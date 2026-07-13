import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const buttonStyles = {
  primary: "bg-ink text-paper hover:bg-ink-soft btn-press border border-ink",
  accent:
    "bg-verdigris text-paper hover:bg-verdigris-deep btn-press border border-verdigris-deep",
  ghost:
    "bg-transparent text-ink border border-line hover:border-ink-faint hover:bg-paper-deep",
  danger:
    "bg-transparent text-danger border border-danger/40 hover:bg-danger/10",
} as const;

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium tracking-wide disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof buttonStyles }) {
  return (
    <button
      className={cx(buttonBase, buttonStyles[variant], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof buttonStyles }) {
  return (
    <Link
      className={cx(buttonBase, buttonStyles[variant], className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cx(
        "w-full rounded-md border border-line bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-verdigris",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cx(
        "mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-ink-soft",
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-lg border border-line bg-white/55 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "green" | "copper";
  children: ReactNode;
}) {
  const tones = {
    neutral: "border-line text-ink-soft bg-paper-deep",
    green: "border-verdigris/30 text-verdigris-deep bg-verdigris/10",
    copper: "border-copper/30 text-copper bg-copper/10",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm text-danger">
      {children}
    </p>
  );
}
