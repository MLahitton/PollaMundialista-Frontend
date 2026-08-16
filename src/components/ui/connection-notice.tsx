"use client";

import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { useConnection } from "@/lib/api/connection-context";

/**
 * Aviso de reconexion. Se muestra en lugar de un error cuando el backend
 * no responde, para que la interfaz no parezca rota mientras se reinicia.
 */
export function ConnectionNotice() {
  const { attempt } = useConnection();

  return (
    <div
      aria-live="polite"
      className="brand-card flex items-center gap-3 border-[rgba(191,215,50,0.35)] bg-[rgba(191,215,50,0.12)] p-5"
      role="status"
    >
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[var(--globant-lime)]"
      />
      <div className="min-w-0">
        <p className="text-sm font-bold text-[var(--text-primary)]">
          El servidor se está reiniciando. Intentando reconectar...
        </p>
        <p className="mt-1 text-xs text-[var(--text-faint)]">
          Tu sesión sigue activa. Los datos se cargarán solos en cuanto vuelva
          {attempt > 0 ? ` (intento ${attempt + 1})` : ""}.
        </p>
      </div>
    </div>
  );
}

/**
 * Pantalla previa a que la sesion este lista.
 *
 * Distingue dos situaciones que antes se veian igual:
 * - hay token guardado pero el backend no responde -> reconectando;
 * - no hay sesion -> preparando (la pagina esta redirigiendo a /login).
 */
export function SessionFallback() {
  const { hasStoredSession } = useAuthContext();
  const { offline } = useConnection();

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-5">
      {offline && hasStoredSession ? (
        <div className="w-full max-w-md">
          <ConnectionNotice />
        </div>
      ) : (
        <p className="muted-text text-sm">Preparando tu sesión...</p>
      )}
    </main>
  );
}
