/**
 * Safely extracts an error message from an unknown error value
 * avoids need for `catch (error: any)`
 */
export function getErrorMessage(error: unknown, fallbackMessage = "Ocorreu um erro inesperado"): string {
  if (!error) return fallbackMessage;

  if (typeof error === "string") return error;

  if (error instanceof Error) return error.message;

  if (typeof error === "object" && "message" in error && typeof (error as any).message === "string") {
    return (error as any).message;
  }

  if (typeof error === "object" && "error" in error && typeof (error as any).error === "string") {
    return (error as any).error;
  }

  return fallbackMessage;
}
