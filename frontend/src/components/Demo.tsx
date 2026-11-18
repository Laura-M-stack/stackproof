import { useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";
import Card from "./Card";
import Certificate, { type CertState } from "./Certificate";
import { fill, useI18n, type MsgKey } from "../i18n";
import {
  connectWallet,
  chainName,
  getInjectedProvider,
  getWalletState,
  shortenAddress,
  walletErrorCode,
  type WalletState,
} from "../lib/wallet";
import {
  SAMPLE_PROOF,
  buildMessage,
  downloadJson,
  loadProof,
  parseProofJson,
  saveProof,
  signProof,
  verifyProof,
  type StackProof,
} from "../lib/proof";

type Status = { kind: "idle" } | { kind: "busy" | "ok" | "bad"; key: MsgKey };

function Pill({ status }: { status: Status }) {
  const { t } = useI18n();
  return (
    <div className="pillbox" role="status" aria-live="polite">
      {status.kind === "idle" ? null : <span className={`pill is-${status.kind}`}>{t.msg[status.key]}</span>}
    </div>
  );
}

function errorKey(e: unknown): MsgKey {
  const code = walletErrorCode(e);
  return code === "rejected" ? "rejected" : code === "pending" ? "pending" : "walletError";
}

type Checked = { proof: StackProof; state: CertState };

export default function Demo() {
  const { t } = useI18n();
  const [wallet, setWallet] = useState<WalletState>({ status: "disconnected" });
  const [proof, setProof] = useState<StackProof | null>(null);
  const [ownState, setOwnState] = useState<CertState>("unchecked");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pasted, setPasted] = useState("");
  const [pasteStatus, setPasteStatus] = useState<Status>({ kind: "idle" });
  const [checked, setChecked] = useState<Checked | null>(null);
  const [signing, setSigning] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const provider = useMemo(() => getInjectedProvider(), []);

  useEffect(() => {
    void (async () => {
      try {
        setWallet(await getWalletState());
      } catch {
        setWallet({ status: "disconnected" });
      }
      setProof(loadProof());
    })();
    return () => window.clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (!provider) return;
    const refresh = () => {
      void getWalletState()
        .then(setWallet)
        .catch(() => setWallet({ status: "disconnected" }));
    };
    provider.on?.("accountsChanged", refresh);
    provider.on?.("chainChanged", refresh);
    return () => {
      provider.removeListener?.("accountsChanged", refresh);
      provider.removeListener?.("chainChanged", refresh);
    };
  }, [provider]);

  const connected = wallet.status === "connected";

  const preview = useMemo(() => {
    if (wallet.status !== "connected") return "";
    return buildMessage({
      app: "StackProof",
      purpose: "Proof of Participation",
      version: "1.0",
      issuedAt: t.demo.previewTime,
      nonce: t.demo.previewNonce,
      chainId: wallet.chainId,
      address: wallet.address,
    });
  }, [wallet, t.demo.previewTime, t.demo.previewNonce]);

  async function onConnect() {
    setStatus({ kind: "idle" });
    try {
      setWallet(await connectWallet());
    } catch (e) {
      setStatus({ kind: "bad", key: errorKey(e) });
    }
  }

  async function onSign() {
    if (!provider || wallet.status !== "connected" || signing) return;
    setSigning(true);
    setStatus({ kind: "busy", key: "signing" });
    try {
      const p = await signProof(provider, wallet.address, wallet.chainId);
      setProof(p);
      setOwnState("unchecked");
      saveProof(p);
      setStatus({ kind: "idle" });
    } catch (e) {
      setStatus({ kind: "bad", key: errorKey(e) });
    } finally {
      setSigning(false);
    }
  }

  async function check(target: StackProof): Promise<CertState> {
    try {
      const res = await verifyProof(target);
      return res.ok ? "ok" : "bad";
    } catch {
      return "bad";
    }
  }

  async function onCheckOwn() {
    if (!proof) return;
    setStatus({ kind: "busy", key: "verifying" });
    const state = await check(proof);
    setOwnState(state);
    setStatus({ kind: state === "ok" ? "ok" : "bad", key: state === "ok" ? "valid" : "invalidSignature" });
  }

  async function onCopy() {
    if (!proof) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(proof, null, 2));
      setStatus({ kind: "ok", key: "copied" });
    } catch {
      setStatus({ kind: "bad", key: "copyFail" });
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus({ kind: "idle" }), 3000);
  }

  function onSample() {
    setPasted(JSON.stringify(SAMPLE_PROOF, null, 2));
    setPasteStatus({ kind: "idle" });
    setChecked(null);
  }

  function onTamper() {
    const parsed = parseProofJson(pasted);
    if (!parsed) return;
    // Flip one hex digit inside r: still well-formed, but it recovers a different address.
    const sig = parsed.signature;
    const i = 10;
    const swapped = sig[i] === "0" ? "1" : "0";
    setPasted(JSON.stringify({ ...parsed, signature: `${sig.slice(0, i)}${swapped}${sig.slice(i + 1)}` }, null, 2));
    setPasteStatus({ kind: "idle" });
    setChecked(null);
  }

  async function onVerifyPasted() {
    const parsed = parseProofJson(pasted);
    if (!parsed) {
      setChecked(null);
      setPasteStatus({ kind: "bad", key: "notProof" });
      return;
    }
    setPasteStatus({ kind: "busy", key: "verifying" });
    try {
      const res = await verifyProof(parsed);
      if (res.ok) {
        setChecked({ proof: parsed, state: "ok" });
        setPasteStatus({ kind: "ok", key: "valid" });
      } else {
        setChecked({ proof: parsed, state: "bad" });
        setPasteStatus({ kind: "bad", key: res.reason === "mismatch" ? "invalidMismatch" : "invalidSignature" });
      }
    } catch {
      setChecked(null);
      setPasteStatus({ kind: "bad", key: "unreadable" });
    }
  }

  const hint = wallet.status === "no-wallet" ? t.demo.noWallet : connected ? "" : t.demo.needConnect;

  return (
    <div className="demo__grid">
      <Card step={t.demo.gen.step} title={t.demo.gen.title} subtitle={t.demo.gen.sub}>
        <div className="stack">
          <Button block variant={connected ? "ghost" : "primary"} onClick={onConnect} disabled={wallet.status === "no-wallet"}>
            {wallet.status === "connected"
              ? fill(t.demo.connected, { address: shortenAddress(wallet.address) })
              : t.demo.connect}
          </Button>

          {connected ? (
            <p className="hint">{fill(t.demo.connectedHint, { chain: chainName(wallet.chainId) })}</p>
          ) : (
            <p className={`hint ${wallet.status === "no-wallet" ? "is-warn" : ""}`}>{hint}</p>
          )}

          {connected ? (
            <div className="preview">
              <div className="preview__title">{t.demo.previewTitle}</div>
              <pre className="preview__code">{preview}</pre>
              <div className="preview__note">{t.demo.previewNote}</div>
            </div>
          ) : null}

          <Button block variant={connected ? "primary" : "ghost"} onClick={() => void onSign()} disabled={!connected || signing}>
            {signing ? t.demo.generating : t.demo.generate}
          </Button>

          {proof ? (
            <div className="stack">
              <Certificate proof={proof} state={ownState} />
              <div className="row">
                <Button variant="ghost" onClick={() => void onCopy()}>
                  {t.demo.copy}
                </Button>
                <Button variant="ghost" onClick={() => downloadJson("stackproof.json", proof)}>
                  {t.demo.download}
                </Button>
              </div>
              <Button variant="ghost" block onClick={() => void onCheckOwn()}>
                {t.demo.checkThis}
              </Button>
            </div>
          ) : null}

          <Pill status={status} />
        </div>
      </Card>

      <Card step={t.demo.ver.step} title={t.demo.ver.title} subtitle={t.demo.ver.sub}>
        <div className="stack">
          <label className="label" htmlFor="sp-paste">
            {t.demo.pasteLabel}
          </label>
          <textarea
            id="sp-paste"
            className="textarea"
            value={pasted}
            rows={7}
            spellCheck={false}
            placeholder={t.demo.pastePlaceholder}
            onChange={(e) => {
              setPasted(e.target.value);
              setPasteStatus({ kind: "idle" });
              setChecked(null);
            }}
          />
          <div className="row">
            <Button variant="ghost" onClick={onSample}>
              {t.demo.sample}
            </Button>
            <Button onClick={() => void onVerifyPasted()} disabled={pasted.trim() === ""}>
              {t.demo.verify}
            </Button>
          </div>
          <div className="tamper">
            <Button variant="ghost" onClick={onTamper} disabled={parseProofJson(pasted) === null}>
              {t.demo.tamper}
            </Button>
            <span className="hint">{t.demo.tamperHint}</span>
          </div>

          <Pill status={pasteStatus} />

          {checked ? <Certificate proof={checked.proof} state={checked.state} /> : null}
        </div>
      </Card>
    </div>
  );
}
