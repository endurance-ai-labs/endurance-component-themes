import { NextResponse, type NextRequest } from "next/server";
import { isPublicPath, signInRedirectUrl } from "@/lib/auth/gate";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

/**
 * One gate: a valid session cookie, or back to /sign-in.
 *
 * This is an optimistic check and nothing more. It proves the cookie was
 * signed by us and that the email is still on ALLOWED_EMAIL_DOMAIN.
 *
 * Next 16 names this file `proxy.ts` (same job as `middleware.ts`).
 *
 * The matcher includes HTML/CSS/JS on purpose. The default Next matcher
 * skips those extensions, which would let a file in `public/` leak past
 * the cookie. The gallery is not in `public/` for the same reason.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  return NextResponse.redirect(signInRedirectUrl(request.nextUrl.origin, pathname));
}

export const config = {
  matcher: [
    // Everything except Next internals. Do not skip .html / .css / .js.
    "/((?!_next/static|_next/image|_next/data).*)",
  ],
};
