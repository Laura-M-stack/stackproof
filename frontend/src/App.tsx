import { useEffect, useMemo, useRef, useState } from "react";
import Card from "./components/Card";
import Button from "./components/Button";
import Field from "./components/Field";
import {
  connectWallet,
  getInjectedProvider,
  getWalletState,
  shortenAddress,
  walletErrorMessage,
  type WalletState,
} from "./lib/wallet";
import {
  SAMPLE_PROOF,
  downloadJson,
  loadProof,
  parseProofJson,
  saveProof,
  signProof,
  verifyProof,
  type StackProof,
} from "./lib/proof";

type Status =
  | { kind: "idle" }
  | { kind: "busy"; text: string }
  | { kind: "ok"; text: string }
  | { kind: "bad"; text: string };

export default function App() {
  const [wallet, setWallet] = useState<WalletState>({ status: "disconnected" });
  const [proof, setProof] = useState<StackProof | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pasted, setPasted] = useState("");
  const [pasteStatus, setPasteStatus] = useState<Status>({ kind: "idle" });
  const [signing, setSigning] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);
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
    return () => window.clearTimeout(copyTimer.current);
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

  const canUseWallet = wallet.status === "connected";
  const hasWallet = wallet.status !== "no-wallet";

  const connectLabel =
    wallet.status === "connected"
      ? `Connected: ${shortenAddress(wallet.address)}`
      : "Connect with MetaMask";

  const walletHint =
    wallet.status === "no-wallet"
      ? "No wallet found. You can still verify a proof below, or try the sample."
      : wallet.status === "connected"
        ? `Chain: ${wallet.chainId}`
        : "Connect a wallet to generate a proof.";

  async function onConnect() {
    setStatus({ kind: "idle" });
    try {
      setWallet(await connectWallet());
    } catch (e) {
      setStatus({ kind: "bad", text: walletErrorMessage(e) });
    }
  }

  async function onGenerateProof() {
    if (!provider || wallet.status !== "connected" || signing) return;

    setStatus({ kind: "busy", text: "Waiting for your signature…" });
    setSigning(true);
    try {
      const p = await signProof(provider, wallet.address, wallet.chainId);
      setProof(p);
      saveProof(p);
      setStatus({ kind: "idle" });
    } catch (e) {
      setStatus({ kind: "bad", text: walletErrorMessage(e) });
    } finally {
      setSigning(false);
    }
  }

  async function runVerify(target: StackProof, set: (s: Status) => void) {
    set({ kind: "busy", text: "Verifying…" });
    try {
      const res = await verifyProof(target);
      set(
        res.ok
          ? { kind: "ok", text: "Valid proof: the signature belongs to the address." }
          : { kind: "bad", text: `Invalid proof. ${res.reason}` }
      );
    } catch {
      set({ kind: "bad", text: "Invalid proof. The signature could not be read." });
    }
  }

  async function onCopyJson() {
    if (!proof) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(proof, null, 2));
      setStatus({ kind: "ok", text: "JSON copied to the clipboard." });
    } catch {
      setStatus({ kind: "bad", text: "Could not copy. Use Download JSON instead." });
    }
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setStatus({ kind: "idle" }), 3000);
  }

  function onDownload() {
    if (!proof) return;
    downloadJson("stackproof.json", proof);
  }

  function onVerifyPasted() {
    const parsed = parseProofJson(pasted);
    if (!parsed) {
      setPasteStatus({
        kind: "bad",
        text: "That is not a StackProof JSON. Paste the full file you exported.",
      });
      return;
    }
    void runVerify(parsed, setPasteStatus);
  }

  function onUseSample() {
    setPasted(JSON.stringify(SAMPLE_PROOF, null, 2));
    setPasteStatus({ kind: "idle" });
  }

  function onTamper() {
    const parsed = parseProofJson(pasted);
    if (!parsed) return;
    // Flip one hex digit inside r: the signature stays well-formed but recovers a different address.
    const sig = parsed.signature;
    const i = 10;
    const swapped = sig[i] === "0" ? "1" : "0";
    const tampered = `${sig.slice(0, i)}${swapped}${sig.slice(i + 1)}`;
    setPasted(JSON.stringify({ ...parsed, signature: tampered }, null, 2));
    setPasteStatus({ kind: "idle" });
  }

  return (
    <div className="sp-page">
      <div className="sp-lights" aria-hidden="true" />

      <main className="sp-shell">
        <section className="sp-left">
          <div className="sp-kicker">STACKPROOF · WEB3</div>

          <h1 className="sp-h1">
            Proof of participation,
            <span className="sp-grad"> in seconds</span>.
          </h1>

          <p className="sp-lead">
            Sign a message with your wallet and get a JSON proof that anyone can verify, with no
            server and no gas. A small demo of wallet UX, EIP-191 signatures and local
            verification.
          </p>

          <div className="sp-bullets">
            <div className="sp-bullet">
              <div className="sp-bullet__title">No gas · No deploy</div>
              <div className="sp-bullet__text">
                Message signing only (EIP-191). Nothing is sent on-chain or to a server.
              </div>
            </div>
            <div className="sp-bullet">
              <div className="sp-bullet__title">Portable proof</div>
              <div className="sp-bullet__text">
                Export or copy the JSON, and verify it again at any time, even without a wallet.
              </div>
            </div>
          </div>

          <div className="sp-miniStats">
            <div className="sp-stat">
              <div className="sp-stat__num">0</div>
              <div className="sp-stat__label">gas</div>
            </div>
            <div className="sp-stat">
              <div className="sp-stat__num">1</div>
              <div className="sp-stat__label">signature</div>
            </div>
            <div className="sp-stat">
              <div className="sp-stat__num" aria-hidden="true">✔</div>
              <div className="sp-stat__label">local verify</div>
            </div>
          </div>
        </section>

        <section className="sp-right">
          <Card
            eyebrow="STEP 1"
            title="Generate a proof"
            subtitle="Sign a message tied to your wallet address. No gas, no contracts."
            footer={false}
          >
            <div className="sp-stack">
              <Button onClick={onConnect} disabled={!hasWallet}>
                {connectLabel}
              </Button>

              <p className={`sp-hint ${wallet.status === "no-wallet" ? "is-warn" : ""}`}>
                {walletHint}
              </p>

              <Button variant="ghost" onClick={onGenerateProof} disabled={!canUseWallet || signing}>
                {signing ? "Waiting for signature…" : "Generate proof"}
              </Button>

              {wallet.status === "connected" ? (
                <div className="sp-grid">
                  <Field label="Address" value={wallet.address} mono />
                  <Field label="Chain ID" value={`${wallet.chainId}`} />
                </div>
              ) : null}

              {proof ? (
                <div className="sp-proof">
                  <div className="sp-grid">
                    <Field label="Issued at" value={proof.payload.issuedAt} />
                    <Field label="Nonce" value={proof.payload.nonce} mono />
                  </div>

                  <Field label="Message" value={proof.message} mono />
                  <Field label="Signature" value={proof.signature} mono />

                  <div className="sp-row">
                    <Button variant="ghost" onClick={onCopyJson}>
                      Copy JSON
                    </Button>
                    <Button variant="ghost" onClick={onDownload}>
                      Download JSON
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => void runVerify(proof, setStatus)}
                  >
                    Verify this proof
                  </Button>
                </div>
              ) : null}

              <div className="sp-verify" role="status" aria-live="polite">
                {status.kind === "idle" ? null : (
                  <span className={`sp-pill ${status.kind === "ok" ? "is-ok" : status.kind === "bad" ? "is-bad" : ""}`}>
                    {status.text}
                  </span>
                )}
              </div>
            </div>
          </Card>

          <Card
            eyebrow="STEP 2"
            title="Verify any proof"
            subtitle="Paste a StackProof JSON. Works without a wallet."
          >
            <div className="sp-stack">
              <label className="sp-label" htmlFor="sp-paste">
                Proof JSON
              </label>
              <textarea
                id="sp-paste"
                className="sp-textarea"
                value={pasted}
                onChange={(e) => {
                  setPasted(e.target.value);
                  setPasteStatus({ kind: "idle" });
                }}
                rows={6}
                spellCheck={false}
                placeholder='{ "payload": { … }, "message": "…", "signature": "0x…" }'
              />
              <div className="sp-row">
                <Button variant="ghost" onClick={onUseSample}>
                  Load sample proof
                </Button>
                <Button onClick={onVerifyPasted} disabled={pasted.trim() === ""}>
                  Verify
                </Button>
              </div>
              <Button variant="ghost" onClick={onTamper} disabled={pasted.trim() === ""}>
                Tamper with the signature
              </Button>
              <div className="sp-verify" role="status" aria-live="polite">
                {pasteStatus.kind === "idle" ? null : (
                  <span
                    className={`sp-pill ${pasteStatus.kind === "ok" ? "is-ok" : pasteStatus.kind === "bad" ? "is-bad" : ""}`}
                  >
                    {pasteStatus.text}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
