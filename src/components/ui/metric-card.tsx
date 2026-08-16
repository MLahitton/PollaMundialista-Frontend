type MetricCardProps = {
  label: string;
  value: number | string;
  tone?: "lime" | "mint" | "dark";
  /** Dato secundario real (por ejemplo, la unidad o un detalle). */
  hint?: string;
  /** Resalta la métrica principal del bloque. */
  featured?: boolean;
};

export function MetricCard({
  label,
  value,
  hint,
}: MetricCardProps) {
  return (
    <article className="brand-card relative flex flex-col justify-between overflow-hidden p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      {/* Fila superior: Icono en circulo verde suave + Tag */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(34,197,94,0.3)] bg-[var(--success-soft)] px-2.5 py-1 text-[0.7rem] font-bold text-[var(--success)]">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M18 15l-6-6-6 6" />
          </svg>
          En juego
        </span>
      </div>

      {/* Contenido principal */}
      <div className="mt-4 relative z-10">
        <p className="text-xs font-bold text-[var(--text-secondary)]">
          {label}
        </p>
        <p className="mt-1 text-3xl font-black leading-none tracking-tight text-[var(--text-primary)] sm:text-4xl">
          {value}
        </p>
      </div>

      {/* Sparkline verde tenue al fondo (Exacto a Imagen 1) */}
      <div aria-hidden="true" className="pointer-events-none mt-4 h-12 w-full overflow-hidden">
        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 35">
          <defs>
            <linearGradient id="metric-sparkline-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--success)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 28 Q 20 20, 40 22 T 80 8 L 100 12 L 100 35 L 0 35 Z"
            fill="url(#metric-sparkline-grad)"
          />
          <path
            d="M0 28 Q 20 20, 40 22 T 80 8 L 100 12"
            fill="none"
            stroke="var(--success)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {hint ? (
        <p className="muted-text border-t border-[var(--surface-muted)] pt-3 text-xs leading-5 text-[var(--text-faint)]">
          {hint}
        </p>
      ) : null}
    </article>
  );
}
