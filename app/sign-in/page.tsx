import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { allowedDomain } from "@/lib/auth/domain";
import { googleConfigured } from "@/lib/auth/google";
import { safeNextPath } from "@/lib/auth/next-path";
import { devLoginEmail, devLoginEnabled } from "@/lib/auth/runtime";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

/**
 * One button, usually. There is no password to forget and no sign-up to
 * police: access is whoever holds a company Google account on this
 * instance's ALLOWED_EMAIL_DOMAIN, decided at the callback.
 */
const ERRORS: Record<string, string> = {
  declined: "Sign-in was cancelled.",
  state: "That sign-in link expired. Try again.",
};

function deniedMessage(): string {
  return `Use your @${allowedDomain()} Google account.`;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (session) redirect("/");

  const { error, next } = await searchParams;
  const message =
    error === "denied"
      ? deniedMessage()
      : typeof error === "string"
        ? ERRORS[error]
        : undefined;
  const googleReady = googleConfigured();
  const localLogin = devLoginEnabled() ? devLoginEmail() : null;
  const nextPath = safeNextPath(next);

  return (
    <main className="sign-in">
      <div className="sign-in-brand">
        <h1>Endurance components</h1>
        <p>Foundations gallery</p>
      </div>
      <div className="sign-in-card">
        {message ? (
          <p role="alert" className="sign-in-alert">
            {message}
          </p>
        ) : null}

        {googleReady || localLogin ? (
          <div className="sign-in-actions">
            {googleReady ? (
              <a className="sign-in-btn" href="/api/auth/google">
                <GoogleMark />
                Continue with Google
              </a>
            ) : null}
            {localLogin ? (
              <form action="/api/auth/dev" method="post">
                <input type="hidden" name="next" value={nextPath} />
                <button
                  type="submit"
                  className={googleReady ? "sign-in-btn sign-in-btn-secondary" : "sign-in-btn"}
                >
                  Continue as {localLogin}
                </button>
              </form>
            ) : null}
          </div>
        ) : (
          <p className="sign-in-note">
            Sign-in is not configured on this deployment yet. Set GOOGLE_CLIENT_ID
            and GOOGLE_CLIENT_SECRET, then redeploy. Locally, set DEV_LOGIN_EMAIL
            to an address on @{allowedDomain()}.
          </p>
        )}

        <p className="sign-in-foot">Restricted to @{allowedDomain()} accounts.</p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden viewBox="0 0 18 18">
      <path
        fill="currentColor"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="currentColor"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18Z"
        opacity=".8"
      />
      <path
        fill="currentColor"
        d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34Z"
        opacity=".6"
      />
      <path
        fill="currentColor"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
        opacity=".9"
      />
    </svg>
  );
}
