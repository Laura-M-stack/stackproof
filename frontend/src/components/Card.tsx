import "./Card.css";

type Props = {
  step?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function Card({ step, title, subtitle, children }: Props) {
  return (
    <section className="sp-card" aria-label={title}>
      <header className="sp-card__header">
        {step ? <span className="sp-card__step">{step}</span> : null}
        <h3 className="sp-card__title">{title}</h3>
        {subtitle ? <p className="sp-card__subtitle">{subtitle}</p> : null}
      </header>
      <div className="sp-card__content">{children}</div>
    </section>
  );
}
