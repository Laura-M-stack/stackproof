import { SAMPLE_PROOF } from "../lib/proof";
import { useI18n } from "../i18n";
import { REPO_URL } from "./Header";

export function How() {
  const { t } = useI18n();
  return (
    <section id="how" className="sec">
      <div className="wrap">
        <p className="kicker">{t.how.kicker}</p>
        <h2 className="h2">{t.how.title}</h2>
        <ol className="steps">
          {t.how.steps.map((s, i) => (
            <li key={s.t} className="steps__item">
              <span className="steps__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Which message lines each note explains (line indexes of the signed message).
const GROUPS: number[][] = [[0, 1, 2, 3], [4], [5], [6], [7]];

export function Tech() {
  const { t } = useI18n();
  const lines = SAMPLE_PROOF.message.split("\n");
  return (
    <section id="tech" className="sec sec--alt">
      <div className="wrap">
        <p className="kicker">{t.tech.kicker}</p>
        <h2 className="h2">{t.tech.title}</h2>
        <p className="lead lead--narrow">{t.tech.lead}</p>

        <div className="tech__grid">
          <div className="anatomy">
            <h3 className="h3">{t.tech.msgTitle}</h3>
            <ol className="anatomy__list">
              {GROUPS.map((g, i) => (
                <li key={i} className="anatomy__item">
                  <span className="anatomy__n" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <pre className="anatomy__code">{g.map((n) => lines[n] ?? "").join("\n")}</pre>
                    <p className="anatomy__note">{t.tech.notes[i]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="tech__side">
            <div className="box">
              <h3 className="h3">{t.tech.checksTitle}</h3>
              <ul className="ticks">
                {t.tech.checks.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="box box--warn">
              <h3 className="h3">{t.tech.limitsTitle}</h3>
              <ul className="ticks ticks--warn">
                {t.tech.limits.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="sec">
      <div className="wrap">
        <p className="kicker">{t.faq.kicker}</p>
        <h2 className="h2">{t.faq.title}</h2>
        <div className="faq">
          {t.faq.items.map((it) => (
            <details key={it.q} className="faq__item">
              <summary>{it.q}</summary>
              <p>{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="ftr">
      <div className="wrap ftr__row">
        <span>{t.footer.made}</span>
        <span className="ftr__links">
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            {t.footer.code}
          </a>
          <a href="#top">{t.footer.top}</a>
        </span>
      </div>
    </footer>
  );
}
