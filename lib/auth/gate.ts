/**
 * Paths that do not need a session cookie.
 *
 * `/api/auth` is the Google round trip (and the local/preview login). Those
 * handlers mint or clear the cookie; they cannot require one first.
 */
export const PUBLIC_PATHS = ["/sign-in", "/api/auth"];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** Send people back where they were aiming once they are through. */
export function signInRedirectUrl(origin: string, pathname: string): URL {
  const signIn = new URL("/sign-in", origin);
  if (pathname !== "/") signIn.searchParams.set("next", pathname);
  return signIn;
}
