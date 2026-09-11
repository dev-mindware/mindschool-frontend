export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const candidate =
    (error as any)?.response?.data?.message ||
    (error as any)?.data?.message ||
    (error as any)?.message;

  if (typeof candidate === "string" && candidate.trim()) {
    return candidate.trim();
  }

  return fallback;
}
