"use server";

import { getSession } from "@/lib/auth";

export async function getAccessToken() {
  const session = await getSession();
  return session?.accessToken || null;
}

export async function getRefreshToken() {
  const session = await getSession();
  return session?.refreshToken || null;
}
