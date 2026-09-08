import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/next-path";
import { devLoginEmail, devLoginEnabled, devLoginName } from "@/lib/auth/runtime";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";

/**
 * Domain-gated local / preview login. POST only. A GET would be a link
 * anyone (or a prefetcher) could follow.
 *
 * Closed on Vercel production and on a local `next start`. The email comes
 * from `DEV_LOGIN_EMAIL`, which must already sit on ALLOWED_EMAIL_DOMAIN;
 * the form does not accept an address.
 */
export async function POST(request: NextRequest) {
  const deny = NextResponse.redirect(new URL("/sign-in?error=denied", request.nextUrl.origin), {
    status: 303,
  });

  if (!devLoginEnabled()) return deny;

  const email = devLoginEmail();
  if (!email) return deny;

  let next = "/";
  try {
    const form = await request.formData();
    next = safeNextPath(form.get("next"));
  } catch {
    next = "/";
  }

  const response = NextResponse.redirect(new URL(next, request.nextUrl.origin), {
    status: 303,
  });
  response.cookies.set(
    SESSION_COOKIE,
    await signSession({ email, name: devLoginName(), sub: "dev-login" }),
    sessionCookieOptions(),
  );
  return response;
}
