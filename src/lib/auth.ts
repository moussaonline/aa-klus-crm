import { createHash } from "crypto";

export const authCookieName = "aa_klus_crm_auth";
export const authCookieMaxAge = 60 * 60 * 12;

export function getAuthSecret() {
  return process.env.CRM_AUTH_SECRET ?? "aa-klus-local-dev-secret";
}

export function getLoginPassword() {
  return process.env.CRM_LOGIN_PASSWORD ?? "admin123";
}

export function createAuthToken() {
  return createHash("sha256").update(getAuthSecret()).digest("hex");
}

export function isValidAuthToken(token?: string) {
  return Boolean(token && token === createAuthToken());
}
