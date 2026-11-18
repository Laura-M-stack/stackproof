import "./Header.css";
import { useI18n, type Lang } from "../i18n";

export const REPO_URL = "https://github.com/Laura-M-stack/stackproof";

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const items = [
    { href: "#demo", label: t.nav.demo },
    { href: "#how", label: t.nav.how },
    { href: "#tech", label: t.nav.tech },
    { href: "#faq", label: t.nav.faq },
  ];

  return (
    <header className="hdr">
      <div className="wrap hdr__row">
        <a className="hdr__brand" href="#top" aria-label="StackProof">
          <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M9.5 16.5l4.5 4.5 8.5-9.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>StackProof</span>
        </a>

        <nav className="hdr__nav" aria-label={t.nav.label}>
          {items.map((i) => (
            <a key={i.href} href={i.href}>
              {i.label}
            </a>
          ))}
        </nav>

        <div className="hdr__tools">
          <div className="lang" role="group" aria-label={t.lang.label}>
            {(["en", "es"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                className="lang__btn"
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <a className="hdr__code" href={REPO_URL} target="_blank" rel="noreferrer">
            {t.nav.code}
          </a>
        </div>
      </div>
    </header>
  );
}
