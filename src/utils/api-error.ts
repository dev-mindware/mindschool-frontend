export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const data = (error as any)?.response?.data;
  const fieldError = Array.isArray(data?.errors) ? data.errors[0]?.message : undefined;
  const candidate =
    fieldError ||
    data?.detail ||
    (error as any)?.response?.data?.message ||
    (error as any)?.data?.message ||
    (error as any)?.message;

  if (typeof candidate === "string" && candidate.trim()) {
    return candidate.trim();
  }

  return fallback;
}
