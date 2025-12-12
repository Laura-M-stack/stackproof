import { useEffect, useMemo, useState } from "react";
import Card from "./components/Card";
import Button from "./components/Button";
import Field from "./components/Field";
import {
  connectWallet,
  getInjectedProvider,
  getWalletState,
  shortenAddress,
  type WalletState,
} from "./lib/wallet";
import {
  downloadJson,
  loadProof,
  saveProof,
  signProof,
  verifyProof,
  type StackProof,
} from "./lib/proof";

type VerifyState =
  | { status: "idle" }
  | { status: "verifying" }
  | { status: "valid" }
  | { status: "invalid" }
  | { status: "error"; message: string };

export default function App() {
  const [wallet, setWallet] = useState<WalletState>({ status: "disconnected" });
  const [proof, setProof] = useState<StackProof | null>(null);
  const [verifyState, setVerifyState] = useState<VerifyState>({ status: "idle" });
  const provider = useMemo(() => getInjectedProvider(), []);

  useEffect(() => {
    void (async () => {
      const ws = await getWalletState();
      setWallet(ws);
      setProof(loadProof());
    })();
  }, []);

  useEffect(() => {
    if (!provider) return;

    const onAccountsChanged = (accounts: unknown) => {
      const list = Array.isArray(accounts) ? accounts : [];
      const first = (list[0] as string | undefined) ?? "";
      if (first.startsWith("0x")) {
        void (async () => setWallet(await getWalletState()))();
      } else {
        setWallet({ status: "disconnected" });
      }
    };

    const onChainChanged = () => {
      void (async () => setWallet(await getWalletState()))();
    };

    provider.on?.("accountsChanged", onAccountsChanged);
    provider.on?.("chainChanged", onChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", onAccountsChanged);
      provider.removeListener?.("chainChanged", onChainChanged);
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
      ? "No wallet found. Install MetaMask (or any EIP-1193 wallet) to continue."
      : wallet.status === "connected"
        ? `Chain: ${wallet.chainId}`
        : "Connect a wallet to generate a proof.";

  async function onConnect() {
    setVerifyState({ status: "idle" });
    const ws = await connectWallet();
    setWallet(ws);
  }

  async function onGenerateProof() {
    if (!provider) return;
    if (wallet.status !== "connected") return;

    setVerifyState({ status: "idle" });

    const p = await signProof(provider, wallet.address, wallet.chainId);
    setProof(p);
    saveProof(p);
  }

  async function onVerify() {
    if (!proof) return;

    setVerifyState({ status: "verifying" });
    try {
      const ok = await verifyProof(proof);
      setVerifyState(ok ? { status: "valid" } : { status: "invalid" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setVerifyState({ status: "error", message: msg });
    }
  }

  async function onCopyJson() {
    if (!proof) return;
    await navigator.clipboard.writeText(JSON.stringify(proof, null, 2));
  }

  function onDownload() {
    if (!proof) return;
    downloadJson("stackproof.json", proof);
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
            Generate a verifiable cryptographic proof by signing a message with your wallet.
            A lightweight Web3 pattern combining frontend UX, wallet interaction and cryptographic validation.
          </p>

          <div className="sp-bullets">
            <div className="sp-bullet">
              <div className="sp-bullet__title">No gas · No deploy</div>
              <div className="sp-bullet__text">Message signing only (EIP-191), with local verification.
              </div>
            </div>
            <div className="sp-bullet">
              <div className="sp-bullet__title">Portable proof</div>
              <div className="sp-bullet__text">Export or copy the JSON credential and reuse it anywhere.
              </div>
            </div>

          </div>

          <div className="sp-miniStats">
            <div className="sp-stat">
              <div className="sp-stat__num">0</div>
              <div className="sp-stat__label">contracts</div>
            </div>
            <div className="sp-stat">
              <div className="sp-stat__num">1</div>
              <div className="sp-stat__label">signature</div>
            </div>
            <div className="sp-stat">
              <div className="sp-stat__num">✔</div>
              <div className="sp-stat__label">verify</div>
            </div>
          </div>
        </section>

        <section className="sp-right">
          <Card
            eyebrow="STACKPROOF · WEB3"
            title="Connect your wallet"
            subtitle="Generate a cryptographic proof tied to your wallet address. No gas. No contracts."
          >
            <div className="sp-stack">
              <Button onClick={onConnect} disabled={!hasWallet}>
                {connectLabel}
              </Button>

              <p className={`sp-hint ${wallet.status === "no-wallet" ? "is-warn" : ""}`}>
                {walletHint}
              </p>

              <div className="sp-row">
                <Button variant="ghost" onClick={onGenerateProof} disabled={!canUseWallet}>
                  Generate proof
                </Button>

                <Button variant="ghost" onClick={onVerify} disabled={!proof}>
                  Verify proof
                </Button>
              </div>

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

                  <div className="sp-verify">
                    {verifyState.status === "idle" ? null : verifyState.status === "verifying" ? (
                      <span className="sp-pill">Verifying…</span>
                    ) : verifyState.status === "valid" ? (
                      <span className="sp-pill is-ok">Valid proof ✅</span>
                    ) : verifyState.status === "invalid" ? (
                      <span className="sp-pill is-bad">Invalid proof ❌</span>
                    ) : (
                      <span className="sp-pill is-bad">Error: {verifyState.message}</span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <div className="sp-note">
            Tip: try it with MetaMask installed, then export the proof as JSON.
          </div>
        </section>
      </main>
    </div>
  );
}
