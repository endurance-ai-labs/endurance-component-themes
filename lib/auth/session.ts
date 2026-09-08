import { SignJWT, jwtVerify } from "jose";
import { isAllowedEmail } from "@/lib/auth/domain";
import { assertProductionAuth } from "@/lib/auth/runtime";

/**
 * Session cookie, signed with `SESSION_SECRET`.
 *
 * Deliberately free of `next/headers` so `proxy.ts` can verify a token too.
 * Callers read the raw cookie value themselves and hand it to `verifySession`.
 *
 * There is no user table. The payload is the Google identity we already
 * checked against ALLOWED_EMAIL_DOMAIN.
 */
export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Session = {
  email: string;
  name: string;
  sub: string;
};

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Generate one with `openssl rand -base64 32`.",
    );
  }
  return new TextEncoder().encode(secret);
}

/** Cookie options shared by every place that sets or clears the session. */
export function sessionCookieOptions(maxAge: number = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    // Localhost is plain http in dev; anything deployed is https.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function signSession(session: Session) {
  // Fail here, when minting, not at import. A production `next build`
  // evaluates route modules and must still complete before env vars exist.
  assertProductionAuth();
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  if (!process.env.SESSION_SECRET?.trim()) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    const email = typeof payload.email === "string" ? payload.email : null;
    const name = typeof payload.name === "string" ? payload.name : null;
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    if (!email || !name || !sub) return null;
    // Re-check the company rule so a domain change signs people out immediately.
    if (!isAllowedEmail(email)) return null;
    return { email, name, sub };
  } catch {
    // Expired, tampered with, or signed by an older SESSION_SECRET. All of
    // them mean the same thing to a caller: no session.
    return null;
  }
}
