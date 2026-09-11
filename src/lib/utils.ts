import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveApiAssetUrl(path?: string | null) {
  return getApiAssetUrlCandidates(path)[0] || "";
}

export function getApiAssetUrlCandidates(path?: string | null) {
  const cleanPath = path?.trim().replace(/^['"]|['"]$/g, "").replaceAll("\\", "/");

  if (!cleanPath) return [];

  if (/^(blob:|data:|\/\/)/i.test(cleanPath)) {
    return [cleanPath];
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://mindgest.mindware-vps.cloud/api";
  const apiBaseUrl = apiUrl.replace(/\/$/, "");
  const assetBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");
  const candidates: string[] = [];

  const addCandidate = (candidate: string) => {
    if (candidate && !candidates.includes(candidate)) {
      candidates.push(candidate);
    }
  };

  if (/^https?:\/\//i.test(cleanPath)) {
    addCandidate(cleanPath);

    try {
      const url = new URL(cleanPath);

      if (url.pathname.startsWith("/api/")) {
        const withoutApi = new URL(cleanPath);
        withoutApi.pathname = withoutApi.pathname.replace(/^\/api/, "");
        addCandidate(withoutApi.toString());
      } else {
        const withApi = new URL(cleanPath);
        withApi.pathname = `/api${withApi.pathname.startsWith("/") ? "" : "/"}${withApi.pathname}`;
        addCandidate(withApi.toString());
      }
    } catch {
      return candidates;
    }

    return candidates;
  }

  try {
    if (cleanPath.startsWith("/api/")) {
      addCandidate(new URL(cleanPath, `${assetBaseUrl}/`).toString());
      addCandidate(new URL(cleanPath.replace(/^\/api/, ""), `${assetBaseUrl}/`).toString());
    } else {
      addCandidate(new URL(cleanPath, `${apiBaseUrl}/`).toString());
      addCandidate(new URL(cleanPath, `${assetBaseUrl}/`).toString());
    }

    if (!cleanPath.includes("/")) {
      addCandidate(new URL(`uploads/${cleanPath}`, `${apiBaseUrl}/`).toString());
      addCandidate(new URL(`uploads/${cleanPath}`, `${assetBaseUrl}/`).toString());
      addCandidate(new URL(`uploads/companies/${cleanPath}`, `${apiBaseUrl}/`).toString());
      addCandidate(new URL(`uploads/companies/${cleanPath}`, `${assetBaseUrl}/`).toString());
    }

    return candidates;
  } catch {
    return [cleanPath];
  }
}

export function withCacheBuster(url: string, value: string | number) {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const hasSignedQuery =
      parsedUrl.searchParams.has("X-Amz-Signature") ||
      parsedUrl.searchParams.has("X-Amz-Credential") ||
      parsedUrl.searchParams.has("Expires") ||
      parsedUrl.searchParams.has("Signature");

    if (hasSignedQuery) {
      return url;
    }
  } catch {
    // Relative URLs are handled below.
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${value}`;
}
