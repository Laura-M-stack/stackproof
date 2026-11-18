import Button from "./components/Button";
import Certificate from "./components/Certificate";
import Demo from "./components/Demo";
import Header from "./components/Header";
import { Faq, Footer, How, Tech } from "./components/Sections";
import { LangProvider, useI18n } from "./i18n";
import { SAMPLE_PROOF } from "./lib/proof";

function Page() {
  const { t } = useI18n();

  return (
    <div id="top" className="page">
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <Header />

      <main id="main">
        <section className="hero">
          <div className="wrap hero__grid">
            <div>
              <p className="kicker">{t.hero.kicker}</p>
              <h1 className="h1">
                {t.hero.titleA} <span className="h1__accent">{t.hero.titleB}</span>
              </h1>
              <p className="lead">{t.hero.lead}</p>
              <div className="hero__cta">
                <Button href="#demo">{t.hero.ctaPrimary}</Button>
                <Button variant="ghost" href="#how">
                  {t.hero.ctaSecondary}
                </Button>
              </div>
              <ul className="points">
                {t.hero.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="hero__cert">
              <Certificate proof={SAMPLE_PROOF} state="ok" tag={t.hero.sampleTag} note={t.cert.sample} />
            </div>
          </div>
        </section>

        <section id="demo" className="sec sec--alt">
          <div className="wrap">
            <p className="kicker">{t.demo.kicker}</p>
            <h2 className="h2">{t.demo.title}</h2>
            <p className="lead lead--narrow">{t.demo.lead}</p>
            <Demo />
          </div>
        </section>

        <How />
        <Tech />
        <Faq />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <Page />
    </LangProvider>
  );
}
