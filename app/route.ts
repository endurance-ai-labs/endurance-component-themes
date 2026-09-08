import { readGalleryHtml } from "@/lib/gallery";

/**
 * Authenticated home page: the existing gallery HTML, unchanged.
 *
 * Served as a raw document so the gallery keeps its own head, tokens, and
 * scripts. A React page would wrap it in the sign-in layout and break it.
 */
export async function GET() {
  return new Response(readGalleryHtml(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
