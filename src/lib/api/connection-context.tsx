"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { env } from "@/lib/config/env";

/**
 * Estado global de conexion con el backend.
 *
 * Existe para que un reinicio del backend no rompa la aplicacion:
 * cuando alguna peticion falla por red, se marca la app como "offline",
 * se sondea /actuator/health con backoff hasta que el backend vuelve, y
 * entonces se incrementa `retryNonce`. Las paginas incluyen ese nonce en
 * las dependencias de su efecto de carga, asi que se recargan solas.
 *
 * El sondeo vive SOLO aqui: hay un unico temporizador activo en toda la
 * aplicacion, sin importar cuantas paginas o componentes esten montados.
 */

type ConnectionStatus = "online" | "offline";

type ConnectionContextValue = {
  status: ConnectionStatus;
  /** true cuando el backend no responde. */
  offline: boolean;
  /** Numero de sondeos fallidos consecutivos. */
  attempt: number;
  /** Cambia cada vez que el backend vuelve: usalo como dependencia para recargar. */
  retryNonce: number;
  /** Notifica que una peticion fallo por red (NetworkError). */
  reportNetworkError: () => void;
  /** Notifica que una peticion se completo: el backend esta vivo. */
  reportSuccess: () => void;
};

/** Espera progresiva entre sondeos. El ultimo valor se repite indefinidamente. */
const BACKOFF_MS = [1_000, 2_000, 4_000, 8_000, 15_000];
const HEALTH_TIMEOUT_MS = 5_000;

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

function backoffFor(attempt: number): number {
  return BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
}

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("online");
  const [attempt, setAttempt] = useState(0);
  const [retryNonce, setRetryNonce] = useState(0);

  // Espejo del estado para poder leerlo dentro de callbacks sin recrearlos.
  const statusRef = useRef<ConnectionStatus>("online");

  const goOnline = useCallback(() => {
    if (statusRef.current === "online") {
      return;
    }

    statusRef.current = "online";
    setStatus("online");
    setAttempt(0);
    // Solo al recuperarse: dispara la recarga de datos en las paginas montadas.
    setRetryNonce((current) => current + 1);
  }, []);

  const reportNetworkError = useCallback(() => {
    if (statusRef.current === "offline") {
      return;
    }

    statusRef.current = "offline";
    setStatus("offline");
    setAttempt(0);
  }, []);

  const reportSuccess = useCallback(() => {
    goOnline();
  }, [goOnline]);

  useEffect(() => {
    if (status === "online") {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) {
        return;
      }

      try {
        const response = await fetch(`${env.apiBaseUrl}/actuator/health`, {
          cache: "no-store",
          signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
        });

        if (!cancelled && response.ok) {
          goOnline();
          return;
        }
      } catch {
        // Sigue caido: caemos al siguiente intento con mas espera.
      }

      if (!cancelled) {
        setAttempt((current) => current + 1);
      }
    }, backoffFor(attempt));

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [attempt, goOnline, status]);

  const value = useMemo(
    () => ({
      status,
      offline: status === "offline",
      attempt,
      retryNonce,
      reportNetworkError,
      reportSuccess,
    }),
    [attempt, reportNetworkError, reportSuccess, retryNonce, status],
  );

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection(): ConnectionContextValue {
  const context = useContext(ConnectionContext);

  if (!context) {
    throw new Error("useConnection must be used within ConnectionProvider.");
  }

  return context;
}
