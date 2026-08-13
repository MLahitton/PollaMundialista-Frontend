export type AuthenticatedParticipant = {
  id: string;
  email: string;
  displayName: string;
  profileImageUrl: string | null;
  active: boolean;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresAt: string;
  participant: AuthenticatedParticipant;
};

export type GoogleLoginRequest = {
  idToken: string;
};
