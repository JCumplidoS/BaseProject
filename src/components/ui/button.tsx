import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md";

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60";

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary:
    "border border-border-strong bg-elevated text-foreground hover:bg-elevated-hover",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}
