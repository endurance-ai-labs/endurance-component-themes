import { NextResponse, type NextRequest } from "next/server";
import { authorizeUrl } from "@/lib/auth/google";
import { OAUTH_STATE_COOKIE, OAUTH_STATE_MAX_AGE } from "@/lib/auth/oauth-state";
import { sessionCookieOptions } from "@/lib/auth/session";

/**
 * Starts sign-in. The `state` value is minted here, parked in a short-lived
 * cookie, and compared on the way back. Without it, an attacker could feed
 * us their own authorization code.
 */
export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();
  const response = NextResponse.redirect(authorizeUrl(request.nextUrl.origin, state));

  response.cookies.set(OAUTH_STATE_COOKIE, state, sessionCookieOptions(OAUTH_STATE_MAX_AGE));

  return response;
}
