import { NextRequest, NextResponse } from "next/server";

const authCookieName = "aa_klus_crm_auth";

const publicPathPrefixes = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/website-leads",
  "/_next",
  "/favicon.ico"
];

async function createAuthToken() {
  const secret = process.env.CRM_AUTH_SECRET ?? "aa-klus-local-dev-secret";
  const bytes = new TextEncoder().encode(secret);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(authCookieName)?.value;
  if (token && token === await createAuthToken()) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/", "/dashboard", "/lead-import", "/website-form", "/api/:path*"]
};
