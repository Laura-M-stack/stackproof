import "./Card.css";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function Card({ eyebrow, title, subtitle, children }: Props) {
  return (
    <section className="sp-card" aria-label={title}>
      <header className="sp-card__header">
        {eyebrow ? <div className="sp-card__eyebrow">{eyebrow}</div> : null}
        <h1 className="sp-card__title">{title}</h1>
        {subtitle ? <p className="sp-card__subtitle">{subtitle}</p> : null}
      </header>
      <div className="sp-card__content">{children}</div>
      <footer className="sp-card__footer">
        <span className="sp-dot" aria-hidden="true" />
        <span className="sp-footerText">Demo StackProof · Made by Laura Moyano</span>
      </footer>
    </section>
  );
}
