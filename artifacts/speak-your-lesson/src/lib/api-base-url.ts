const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

export function getApiBaseUrl(): string | null {
  if (!rawApiBaseUrl) {
    return null;
  }

  return rawApiBaseUrl.replace(/\/+$/, "");
}

export function resolveApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return path;
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
