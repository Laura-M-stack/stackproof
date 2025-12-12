import "./Field.css";

type Props = {
  label: string;
  value: string;
  mono?: boolean;
};

export default function Field({ label, value, mono }: Props) {
  return (
    <div className="sp-field">
      <div className="sp-field__label">{label}</div>
      <div className={`sp-field__value ${mono ? "is-mono" : ""}`}>{value}</div>
    </div>
  );
}
