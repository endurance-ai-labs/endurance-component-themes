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
 * ALLOWED_EMAIL_DOMAIN overrides the Endurance default. Production still
 * refuses to mint a session without SESSION_SECRET. The sign-in page must
 * render either way.
 */

export function allowedDomain() {
  return allowedDomainForEnv();
}

export function isAllowedEmail(email: string) {
  return isAllowedEmailForEnv(email);
}
