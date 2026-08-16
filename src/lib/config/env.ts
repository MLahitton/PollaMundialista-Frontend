const DEFAULT_API_BASE_URL = "http://localhost:8080";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function configuredApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

/**
 * Resuelve la URL del backend segun el host desde el que se sirve la pagina.
 *
 * Cuando la API esta configurada contra la maquina local pero la pagina se abre
 * desde otro host (por ejemplo la IP de red, para probar desde un celular),
 * "localhost" apuntaria al dispositivo del visitante y no al backend. En ese
 * caso se reutiliza el host de la pagina conservando el puerto configurado.
 *
 * Si la pagina ya se sirve desde localhost, o si la API apunta a un host
 * explicito distinto de localhost, el valor configurado se respeta tal cual.
 */
function resolveApiBaseUrl(): string {
  const configured = configuredApiBaseUrl();

  if (typeof window === "undefined") {
    return configured;
  }

  try {
    const apiUrl = new URL(configured);
    const pageHostname = window.location.hostname;

    if (LOCAL_HOSTNAMES.has(apiUrl.hostname) && !LOCAL_HOSTNAMES.has(pageHostname)) {
      apiUrl.hostname = pageHostname;
      return apiUrl.origin;
    }

    return configured;
  } catch {
    return configured;
  }
}

export const env = {
  get apiBaseUrl(): string {
    return resolveApiBaseUrl();
  },
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
};

export function requireGoogleClientId(): string {
  if (!env.googleClientId) {
    throw new Error("Google Client ID is not configured.");
  }

  return env.googleClientId;
}
