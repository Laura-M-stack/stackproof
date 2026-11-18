import "./Certificate.css";
import { useI18n } from "../i18n";
import { chainName, shortenAddress } from "../lib/wallet";
import type { StackProof } from "../lib/proof";

export type CertState = "ok" | "bad" | "unchecked";

type Props = {
  proof: StackProof;
  state: CertState;
  note?: string;
  tag?: string;
};

function shortSig(sig: string): string {
  return `${sig.slice(0, 20)}…${sig.slice(-10)}`;
}

function formatDate(iso: string, lang: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(d) + " UTC";
}

function Seal() {
  return (
    <svg className="cert__seal" viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="28" cy="28" r="20" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M18.5 28.5l6.5 6.5 12.5-13.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Certificate({ proof, state, note, tag }: Props) {
  const { t, lang } = useI18n();
  const label = state === "ok" ? t.cert.verified : state === "bad" ? t.cert.invalid : t.cert.unchecked;

  return (
    <article className={`cert is-${state}`} aria-label={t.cert.title}>
      {tag ? <span className="cert__tag">{tag}</span> : null}
      <header className="cert__top">
        <Seal />
        <div>
          <div className="cert__eyebrow">STACKPROOF</div>
          <h3 className="cert__title">{t.cert.title}</h3>
        </div>
      </header>

      <dl className="cert__grid">
        <div className="cert__wide">
          <dt>{t.cert.address}</dt>
          <dd className="is-mono cert__addr" title={proof.payload.address}>
            <span className="cert__addrFull">{proof.payload.address}</span>
            <span className="cert__addrShort">{shortenAddress(proof.payload.address)}</span>
          </dd>
        </div>
        <div>
          <dt>{t.cert.chain}</dt>
          <dd>{chainName(proof.payload.chainId)}</dd>
        </div>
        <div>
          <dt>{t.cert.issued}</dt>
          <dd>{formatDate(proof.payload.issuedAt, lang)}</dd>
        </div>
        <div>
          <dt>{t.cert.nonce}</dt>
          <dd className="is-mono">{proof.payload.nonce.slice(0, 12)}…</dd>
        </div>
        <div>
          <dt>{t.cert.signature}</dt>
          <dd className="is-mono" title={proof.signature}>{shortSig(proof.signature)}</dd>
        </div>
      </dl>

      <footer className="cert__foot" role="status">
        <span className="cert__state">
          <span className="cert__dot" aria-hidden="true" />
          {label}
        </span>
        {note ? <span className="cert__note">{note}</span> : null}
      </footer>
    </article>
  );
}
