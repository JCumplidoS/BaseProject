import type { InputHTMLAttributes, ReactNode } from "react";

export const inputClass =
"w-full rounded-lg border border-border-strong bg-elevated px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60";

export function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-foreground/80"
    >
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />;
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger"
    >
      {children}
    </p>
  );
}

export function FormSuccess({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-lg border border-success-border bg-success-surface px-3 py-2 text-sm text-success"
    >
      {children}
    </p>
  );
}
