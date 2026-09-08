import { NextResponse, type NextRequest } from "next/server";
import { exchangeCode, verifyIdToken, type GoogleProfile } from "@/lib/auth/google";
import { OAUTH_STATE_COOKIE } from "@/lib/auth/oauth-state";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";

/**
 * The only production door into the gallery.
 *
 * Failures all land back on /sign-in with a coarse reason. The detail stays
 * in the server log: telling a stranger whether they failed on domain or on
 * state just helps them iterate.
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const deny = (reason: string) =>
    NextResponse.redirect(new URL(`/sign-in?error=${reason}`, origin));

  if (searchParams.get("error")) return deny("declined");

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return deny("state");
  }

  let profile: GoogleProfile;
  try {
    profile = await verifyIdToken(await exchangeCode(code, origin));
  } catch (error) {
    console.error("Google sign-in rejected:", error);
    return deny("denied");
  }

  const response = NextResponse.redirect(new URL("/", origin));
  response.cookies.set(
    SESSION_COOKIE,
    await signSession({ email: profile.email, name: profile.name, sub: profile.sub }),
    sessionCookieOptions(),
  );
  response.cookies.delete(OAUTH_STATE_COOKIE);

  return response;
}
