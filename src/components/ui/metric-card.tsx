type MetricCardProps = {
  label: string;
  value: number | string;
  tone?: "lime" | "mint" | "dark";
};

export function MetricCard({ label, value, tone = "lime" }: MetricCardProps) {
  const accent =
    tone === "mint"
      ? "bg-[var(--globant-mint)]"
      : tone === "dark"
        ? "bg-[var(--globant-dark)]"
        : "bg-[var(--globant-lime)]";

  return (
    <article className="brand-card p-5">
      <div className={`mb-4 h-1.5 w-10 rounded-full ${accent}`} />
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-extrabold text-[var(--globant-dark)]">
        {value}
      </p>
    </article>
  );
}
