import { env } from "@/lib/config/env";
import { getAccessToken } from "@/features/auth/storage/auth-storage";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string;
};

type ErrorBody = {
  message?: string;
  title?: string;
  error?: string;
};

async function parseErrorMessage(response: Response): Promise<string> {
  const fallback = "No fue posible completar la solicitud.";

  try {
    const body = (await response.json()) as ErrorBody;
    return body.message ?? body.title ?? body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers();

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export async function authenticatedApiClient<T>(
  path: string,
  options: Omit<ApiRequestOptions, "accessToken"> = {},
): Promise<T> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new ApiError(401, "Tu sesion expiro. Inicia sesion nuevamente.");
  }

  return apiClient<T>(path, {
    ...options,
    accessToken,
  });
}
