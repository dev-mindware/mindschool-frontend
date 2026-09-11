"use server";
export async function clearLocalSession() {
  const { destroySession } = await import("@/lib/session");
  await destroySession();
}
