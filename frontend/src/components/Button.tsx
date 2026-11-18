import "./Button.css";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  block?: boolean;
  href?: string;
};

export default function Button({ children, onClick, disabled, variant = "primary", block, href }: Props) {
  const cls = `sp-btn sp-btn--${variant}${block ? " sp-btn--block" : ""}`;
  if (href) {
    return (
      <a className={cls} href={href}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
