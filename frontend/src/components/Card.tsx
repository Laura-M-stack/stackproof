import "./Card.css";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: boolean;
};

export default function Card({ eyebrow, title, subtitle, children, footer = true }: Props) {
  return (
    <section className="sp-card" aria-label={title}>
      <header className="sp-card__header">
        {eyebrow ? <div className="sp-card__eyebrow">{eyebrow}</div> : null}
        <h2 className="sp-card__title">{title}</h2>
        {subtitle ? <p className="sp-card__subtitle">{subtitle}</p> : null}
      </header>
      <div className="sp-card__content">{children}</div>
      {footer ? (
        <footer className="sp-card__footer">
          <span className="sp-dot" aria-hidden="true" />
          <span className="sp-footerText">Demo StackProof · Made by Laura Moyano</span>
        </footer>
      ) : null}
    </section>
  );
}
