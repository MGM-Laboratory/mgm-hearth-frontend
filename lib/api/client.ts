import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";
import { ApiError, type ApiErrorBody } from "./errors";

/**
 * Single shared openapi-fetch client. Picks browser vs server base URL at runtime.
 *
 * - Browser: HEARTH_API_URL (public)
 * - Server (RSC, route handlers): HEARTH_API_URL_INTERNAL (in-cluster) when set,
 *   otherwise HEARTH_API_URL.
 */
function resolveBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.HEARTH_API_URL_INTERNAL ??
      process.env.HEARTH_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:8080/api/v1"
    );
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";
}

let cachedToken: string | undefined;
/** Set the active access token (called from Auth.js session glue). */
export function setBearerToken(token: string | undefined) {
  cachedToken = token;
}
/** Read the active access token (for SSE hookup). */
export function getBearerToken(): string | undefined {
  return cachedToken;
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (cachedToken) request.headers.set("Authorization", `Bearer ${cachedToken}`);
    request.headers.set("Accept-Language", typeof document !== "undefined" ? document.documentElement.lang || "en" : "en");
    return request;
  },
  async onResponse({ response }) {
    if (!response.ok) {
      let body: ApiErrorBody;
      const text = await response.clone().text();
      try {
        const parsed = JSON.parse(text);
        body = parsed?.error ?? { code: `HTTP_${response.status}`, message: text };
      } catch {
        body = { code: `HTTP_${response.status}`, message: text || response.statusText };
      }
      const err = new ApiError(response.status, body);
      // Hard-redirect on the IT gate — this is a role boundary, not a recoverable error.
      if (typeof window !== "undefined" && err.code === "NOT_IT_MEMBER") {
        if (window.location.pathname !== "/not-it") window.location.assign("/not-it");
      }
      throw err;
    }
    return response;
  },
};

export const api = createClient<paths>({
  baseUrl: resolveBaseUrl(),
});
api.use(authMiddleware);

/**
 * Untyped helper for endpoints not yet captured by the generated schema or
 * for endpoints returning non-JSON (e.g. sticker PNG, batch ZIP).
 */
export async function rawFetch(
  pathname: string,
  init: RequestInit = {},
): Promise<Response> {
  const base = resolveBaseUrl();
  const url = pathname.startsWith("http") ? pathname : `${base}${pathname}`;
  const headers = new Headers(init.headers);
  if (cachedToken && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${cachedToken}`);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let body: ApiErrorBody;
    const text = await res.clone().text();
    try {
      const parsed = JSON.parse(text);
      body = parsed?.error ?? { code: `HTTP_${res.status}`, message: text };
    } catch {
      body = { code: `HTTP_${res.status}`, message: text || res.statusText };
    }
    const err = new ApiError(res.status, body);
    if (typeof window !== "undefined" && err.code === "NOT_IT_MEMBER") {
      if (window.location.pathname !== "/not-it") window.location.assign("/not-it");
    }
    throw err;
  }
  return res;
}
