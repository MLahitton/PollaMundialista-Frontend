"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, NetworkError } from "@/lib/api/api-client";
import { useConnection } from "@/lib/api/connection-context";
import * as authApi from "@/features/auth/api/auth-api";
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from "@/features/auth/storage/auth-storage";
import type { AuthenticatedParticipant } from "@/features/auth/types/auth-types";

type UseAuthResult = {
  participant: AuthenticatedParticipant | null;
  accessToken: string | null;
  loading: boolean;
  authenticated: boolean;
  /**
   * Hay un token guardado, aunque todavia no se haya podido validar contra
   * el backend. Las paginas lo usan para NO redirigir a /login cuando la
   * unica razon por la que no hay participante es que el backend esta caido.
   */
  hasStoredSession: boolean;
  error: string | null;
  loginWithGoogleCredential: (idToken: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
};

function friendlyError(error: unknown): string {
  if (error instanceof NetworkError) {
    return "No fue posible conectar con el servidor. Intenta nuevamente en unos segundos.";
  }

  if (error instanceof ApiError && error.status === 401) {
    return "Tu sesion expiro. Inicia sesion nuevamente.";
  }

  return "No fue posible iniciar sesion con Google.";
}

export function useAuth(): UseAuthResult {
  const [participant, setParticipant] =
    useState<AuthenticatedParticipant | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { reportNetworkError, reportSuccess, retryNonce } = useConnection();

  const logout = useCallback(() => {
    clearAccessToken();
    setAccessToken(null);
    setParticipant(null);
    setError(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      setAccessToken(null);
      setLoading(false);
      return;
    }

    setAccessToken(accessToken);
    setLoading(true);
    setError(null);

    try {
      const currentParticipant =
        await authApi.getCurrentParticipant(accessToken);
      setParticipant(currentParticipant);
      reportSuccess();
    } catch (restoreError) {
      // Backend caido o reiniciandose: la sesion NO ha expirado.
      // Se conserva el token y el estado; el proveedor de conexion
      // reintentara y este efecto volvera a ejecutarse al recuperarse.
      if (restoreError instanceof NetworkError) {
        reportNetworkError();
        setError(null);
        return;
      }

      // Unico caso en el que la sesion realmente dejo de ser valida.
      if (restoreError instanceof ApiError && restoreError.status === 401) {
        clearAccessToken();
        setAccessToken(null);
        setParticipant(null);
        setError("Tu sesion expiro. Inicia sesion nuevamente.");
        return;
      }

      // 403/404/500: el backend respondio, pero no es un problema de sesion.
      // Tampoco se borra el token.
      setError("No fue posible restaurar tu sesion.");
    } finally {
      setLoading(false);
    }
  }, [reportNetworkError, reportSuccess]);

  const loginWithGoogleCredential = useCallback(async (idToken: string) => {
    setLoading(true);
    setError(null);

    try {
      const authResponse = await authApi.loginWithGoogle(idToken);
      saveAccessToken(authResponse.accessToken);
      setAccessToken(authResponse.accessToken);

      const currentParticipant = await authApi.getCurrentParticipant(
        authResponse.accessToken,
      );
      setParticipant(currentParticipant);
      reportSuccess();
    } catch (loginError) {
      // Si el backend se cayo despues de emitir el token, conservarlo:
      // es valido y la sesion se restaurara sola al reconectar.
      if (loginError instanceof NetworkError) {
        reportNetworkError();
        setError(friendlyError(loginError));
        throw loginError;
      }

      clearAccessToken();
      setAccessToken(null);
      setParticipant(null);
      setError(friendlyError(loginError));
      throw loginError;
    } finally {
      setLoading(false);
    }
  }, [reportNetworkError, reportSuccess]);

  // `retryNonce` cambia cuando el backend vuelve tras una caida: reintenta
  // validar la sesion automaticamente, sin recargar la pagina a mano.
  useEffect(() => {
    // Restaura la sesion al montar y cuando cambia `retryNonce`. Ambas
    // dependencias son estables, por lo que no hay realimentacion ni bucle.
    // Excepcion deliberada y acotada solo a esta linea.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void restoreSession();
  }, [restoreSession, retryNonce]);

  return useMemo(
    () => ({
      participant,
      accessToken,
      loading,
      authenticated: Boolean(participant),
      hasStoredSession: Boolean(accessToken),
      error,
      loginWithGoogleCredential,
      logout,
      restoreSession,
    }),
    [
      participant,
      accessToken,
      loading,
      error,
      loginWithGoogleCredential,
      logout,
      restoreSession,
    ],
  );
}
