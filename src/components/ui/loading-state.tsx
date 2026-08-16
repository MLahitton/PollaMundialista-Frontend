type LoadingStateProps = {
  label: string;
  /** Cantidad de tarjetas fantasma a dibujar. */
  rows?: number;
};

/**
 * Estado de carga con esqueletos: mantiene la altura aproximada del
 * contenido real para que no salte el layout al resolverse la petición.
 */
export function LoadingState({ label, rows = 3 }: LoadingStateProps) {
  return (
    <div aria-busy="true" aria-live="polite" className="grid gap-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          className="brand-card flex items-center gap-4 p-5"
          key={index}
          aria-hidden="true"
        >
          <div className="skeleton h-11 w-11 rounded-full" />
          <div className="grid flex-1 gap-2">
            <div className="skeleton h-3.5 w-1/3 rounded-full" />
            <div className="skeleton h-3 w-1/2 rounded-full" />
          </div>
          <div className="skeleton hidden h-9 w-24 rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}
