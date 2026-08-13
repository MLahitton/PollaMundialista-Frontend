"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/api-client";
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
  error: string | null;
  loginWithGoogleCredential: (idToken: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
};

function friendlyError(error: unknown): string {
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
    } catch (restoreError) {
      clearAccessToken();
      setAccessToken(null);
      setParticipant(null);

      if (restoreError instanceof ApiError && restoreError.status === 401) {
        setError("Tu sesion expiro. Inicia sesion nuevamente.");
      } else {
        setError("No fue posible restaurar tu sesion.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

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
    } catch (loginError) {
      clearAccessToken();
      setAccessToken(null);
      setParticipant(null);
      setError(friendlyError(loginError));
      throw loginError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  return useMemo(
    () => ({
      participant,
      accessToken,
      loading,
      authenticated: Boolean(participant),
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
