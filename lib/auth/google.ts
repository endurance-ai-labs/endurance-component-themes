import { createRemoteJWKSet, jwtVerify } from "jose";
import { allowedDomain, isAllowedEmail } from "@/lib/auth/domain";

/**
 * Google sign-in, restricted to one Workspace domain.
 *
 * The domain check that decides who gets in lives in `lib/auth/domain.ts`.
 * `verifyIdToken` is this provider's door.
 *
 * The `hd` parameter on the consent URL is a hint. It filters the account
 * chooser and nothing more. A hand-built request can omit it, so the
 * returned token is what we actually trust, and only after checking its
 * signature, issuer, audience, `email_verified`, and domain.
 */
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export { allowedDomain, isAllowedEmail };

// Google is inconsistent about the scheme in `iss`; both forms are legitimate.
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
};

/** Whether this instance has Google sign-in wired up at all. */
export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

function clientId() {
  const value = process.env.GOOGLE_CLIENT_ID;
  if (!value) throw new Error("GOOGLE_CLIENT_ID is not set.");
  return value;
}

function clientSecret() {
  const value = process.env.GOOGLE_CLIENT_SECRET;
  if (!value) throw new Error("GOOGLE_CLIENT_SECRET is not set.");
  return value;
}

/** Every origin that signs in must be registered in the Google Cloud console. */
export function redirectUri(origin: string) {
  return new URL("/api/auth/google/callback", origin).toString();
}

export function authorizeUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    hd: allowedDomain(),
    // Without this, a signed-out user with one Google session is bounced
    // straight back in as that account with no way to pick another.
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCode(code: string, origin: string): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed: ${response.status}`);
  }

  const body = (await response.json()) as { id_token?: string };
  if (!body.id_token) throw new Error("Google token response carried no id_token.");
  return body.id_token;
}

/** Throws unless the token is genuinely Google's, for us, and on our domain. */
export async function verifyIdToken(idToken: string): Promise<GoogleProfile> {
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ISSUERS,
    audience: clientId(),
  });

  const email = typeof payload.email === "string" ? payload.email : null;
  const sub = typeof payload.sub === "string" ? payload.sub : null;

  if (!sub || !email) throw new Error("Google id_token was missing sub or email.");
  if (payload.email_verified !== true) throw new Error("Google email is not verified.");

  // Belt and braces: `hd` is the Workspace domain Google itself asserts, and
  // the address must agree with it. A consumer gmail.com account carries no `hd`.
  if (payload.hd !== allowedDomain() || !isAllowedEmail(email)) {
    throw new Error(`${email} is outside ${allowedDomain()}.`);
  }

  const name = typeof payload.name === "string" && payload.name ? payload.name : email;
  return { sub, email, name };
}
