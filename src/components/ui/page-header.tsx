import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  /** Métricas o acciones alineadas a la derecha en desktop. */
  aside?: ReactNode;
};

/**
 * Cabecera común a todas las secciones autenticadas: mantiene la misma
 * jerarquía (contexto -> título -> bajada) que la portada del Login.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  aside,
}: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title mt-3">{title}</h1>
        {description ? (
          <p className="muted-text mt-4 max-w-[52ch] text-base leading-7">
            {description}
          </p>
        ) : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}
