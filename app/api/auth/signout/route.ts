import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

/**
 * POST only. A GET sign-out is a link anyone can get you to follow, or that
 * a prefetcher can follow on your behalf.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/sign-in", request.nextUrl.origin), {
    status: 303,
  });

  response.cookies.delete(SESSION_COOKIE);

  return response;
}
