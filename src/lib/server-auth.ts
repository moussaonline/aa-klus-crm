import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { authCookieName, isValidAuthToken } from "./auth";

export async function requireCrmLogin(nextPath = "/") {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;

  if (!isValidAuthToken(token)) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
}

export async function requireApiLogin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;

  if (!isValidAuthToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
