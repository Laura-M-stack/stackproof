import "./Button.css";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  type?: "button" | "submit";
  ariaLabel?: string;
};

export default function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
  ariaLabel,
}: Props) {
  return (
    <button
      type={type}
      className={`sp-btn sp-btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
