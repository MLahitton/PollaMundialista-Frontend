export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
};

export function requireGoogleClientId(): string {
  if (!env.googleClientId) {
    throw new Error("Google Client ID is not configured.");
  }

  return env.googleClientId;
}
