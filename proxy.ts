import { NextResponse, type NextRequest } from "next/server";
import { UNIFIED_THEMES_URL } from "@/lib/unified-product";

/**
 * This hostname is retired. Send every request to the unified design product.
 *
 * vercel.json already 308s at the CDN. This is the in-app fallback so a
 * local `next start` or a missed platform route cannot serve the old gallery.
 */
export function proxy(_request: NextRequest) {
  return NextResponse.redirect(UNIFIED_THEMES_URL, 308);
}

export const config = {
  matcher: ["/:path*"],
};
