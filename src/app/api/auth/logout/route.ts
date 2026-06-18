import { NextResponse } from "next/server";
import { authCookieName } from "@/lib/auth";

function clearSession(response: NextResponse) {
  response.cookies.set(authCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
  return response;
}

export async function POST() {
  return clearSession(NextResponse.json({ ok: true }));
}

export async function GET() {
  return clearSession(NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")));
}
