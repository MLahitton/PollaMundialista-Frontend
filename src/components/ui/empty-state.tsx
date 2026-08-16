import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  /** Acción real disponible (por ejemplo, ir al fixture). Opcional. */
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="brand-card flex flex-col items-center gap-4 px-6 py-12 text-center sm:py-16">
      <span
        aria-hidden="true"
        className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(191,215,50,0.32)] bg-[rgba(191,215,50,0.08)]"
      >
        <span className="h-7 w-7 rounded-full border-2 border-dashed border-[rgba(191,215,50,0.6)]" />
      </span>
      <h2 className="section-title max-w-[34ch]">{title}</h2>
      {description ? (
        <p className="muted-text max-w-[46ch] text-sm leading-6">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
