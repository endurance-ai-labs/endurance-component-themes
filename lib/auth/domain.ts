import { allowedDomainForEnv, isAllowedEmailForEnv } from "@/lib/auth/runtime";

/**
 * THE ACCESS CONTROL.
 *
 * This gallery has no invite flow and no allowlist: whoever holds a company
 * account on this domain is staff, and nobody else can get a session at all.
 * Google sign-in funnels through here, and the session check re-runs the
 * domain rule so moving someone off the domain logs them out on their next
 * request rather than whenever their cookie happens to expire.
 *
 * Production (`VERCEL_ENV=production`) refuses to start without
 * ALLOWED_EMAIL_DOMAIN. Off production the Endurance default still applies.
 */

export function allowedDomain() {
  return allowedDomainForEnv();
}

export function isAllowedEmail(email: string) {
  return isAllowedEmailForEnv(email);
}
