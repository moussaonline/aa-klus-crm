import { NextRequest, NextResponse } from "next/server";
import { authCookieMaxAge, authCookieName, createAuthToken, getLoginPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const password = typeof body.password === "string" ? body.password : "";

  if (password !== getLoginPassword()) {
    return NextResponse.json({ message: "Ongeldig wachtwoord." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookieName, createAuthToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: authCookieMaxAge,
    path: "/"
  });

  return response;
}
