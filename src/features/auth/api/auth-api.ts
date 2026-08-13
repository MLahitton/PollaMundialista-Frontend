import { apiClient } from "@/lib/api/api-client";
import type {
  AuthenticatedParticipant,
  AuthResponse,
  GoogleLoginRequest,
} from "@/features/auth/types/auth-types";

export function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const body: GoogleLoginRequest = { idToken };

  return apiClient<AuthResponse>("/api/v1/auth/google", {
    method: "POST",
    body,
  });
}

export function getCurrentParticipant(
  accessToken: string,
): Promise<AuthenticatedParticipant> {
  return apiClient<AuthenticatedParticipant>("/api/v1/me", {
    accessToken,
  });
}
