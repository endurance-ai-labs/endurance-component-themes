/**
 * Where this process is running, and which auth rules that implies.
 *
 * Vercel sets `VERCEL_ENV` to `production` | `preview` | `development`.
 * `NODE_ENV=production` is true on every Vercel deploy, including preview,
 * so it cannot be the production gate. A local `next start` has
 * `NODE_ENV=production` and no `VERCEL_ENV`; that is a production-mode
 * server and the local bypass stays closed there too.
 */

export type AuthEnv = Record<string, string | undefined>;

export function isVercelProduction(env: AuthEnv = process.env): boolean {
  return env.VERCEL_ENV === "production";
}

export function isVercelPreview(env: AuthEnv = process.env): boolean {
  return env.VERCEL_ENV === "preview";
}

/**
 * Fail closed on a production deploy that forgot its locks.
 *
 * SESSION_SECRET and ALLOWED_EMAIL_DOMAIN used to have softer local defaults.
 * That is fine on a laptop. On `VERCEL_ENV=production` an unset value is a
 * misconfigured instance, not a reason to fall back.
 */
export function assertProductionAuth(env: AuthEnv = process.env): void {
  if (!isVercelProduction(env)) return;
  if (!env.SESSION_SECRET?.trim()) {
    throw new Error(
      "SESSION_SECRET is not set. Generate one with `openssl rand -base64 32`.",
    );
  }
  if (!env.ALLOWED_EMAIL_DOMAIN?.trim()) {
    throw new Error(
      "ALLOWED_EMAIL_DOMAIN is not set. Production must name the sign-in domain.",
    );
  }
}

/**
 * Whether the domain-gated local / preview login may mint a session.
 *
 * Never on `VERCEL_ENV=production`. Never on a local `next start`
 * (`NODE_ENV=production` and no Vercel env). Allowed on `next dev` and on
 * Vercel preview / Vercel development, and only when `DEV_LOGIN_EMAIL` is set
 * and sits on the allowed domain.
 */
export function devLoginEnabled(env: AuthEnv = process.env): boolean {
  if (isVercelProduction(env)) return false;
  if (
    env.NODE_ENV === "production" &&
    env.VERCEL_ENV !== "preview" &&
    env.VERCEL_ENV !== "development"
  ) {
    return false;
  }
  const email = env.DEV_LOGIN_EMAIL?.trim();
  if (!email) return false;
  return isAllowedEmailForEnv(email, env);
}

export function devLoginEmail(env: AuthEnv = process.env): string | null {
  if (!devLoginEnabled(env)) return null;
  return env.DEV_LOGIN_EMAIL!.trim().toLowerCase();
}

export function devLoginName(env: AuthEnv = process.env): string {
  const named = env.DEV_LOGIN_NAME?.trim();
  if (named) return named;
  const email = devLoginEmail(env);
  if (!email) return "Local user";
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Same rule as `lib/auth/domain.ts`, taking an explicit env so tests can
 * exercise production-vs-local without mutating process.env for the whole file.
 */
export function allowedDomainForEnv(env: AuthEnv = process.env): string {
  const value = env.ALLOWED_EMAIL_DOMAIN?.trim();
  if (value) return value;
  if (isVercelProduction(env)) {
    throw new Error(
      "ALLOWED_EMAIL_DOMAIN is not set. Production must name the sign-in domain.",
    );
  }
  return "endurancelabs.ai";
}

export function isAllowedEmailForEnv(email: string, env: AuthEnv = process.env): boolean {
  return email.toLowerCase().endsWith(`@${allowedDomainForEnv(env).toLowerCase()}`);
}
