type TeamCrestProps = {
  name: string;
  /** Escudo que expone el backend en homeTeamLogoUrl / awayTeamLogoUrl. */
  logoUrl?: string | null;
  /** Código de selección (por ejemplo COL) usado como respaldo. */
  code?: string | null;
};

/**
 * Escudo de la selección. Usa el logo real cuando el backend lo entrega
 * y cae al código de tres letras cuando el partido aún no tiene equipos
 * definidos, sin inventar ningún dato.
 */
export function TeamCrest({ name, logoUrl, code }: TeamCrestProps) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- escudo remoto, sin dominio fijo
      <img
        alt=""
        className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
        referrerPolicy="no-referrer"
        src={logoUrl}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[0.7rem] font-black tracking-tight text-[var(--text-secondary)]"
      title={name}
    >
      {code ?? "—"}
    </span>
  );
}
