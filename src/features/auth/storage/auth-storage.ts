const ACCESS_TOKEN_KEY = "mundial_polla_access_token";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function saveAccessToken(token: string): void {
  if (canUseStorage()) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken(): void {
  if (canUseStorage()) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}
