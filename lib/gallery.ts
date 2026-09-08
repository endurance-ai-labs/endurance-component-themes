import { readFileSync } from "node:fs";
import { join } from "node:path";

const GALLERY_FILE = "content/gallery.html";

export function galleryFilePath() {
  return join(process.cwd(), GALLERY_FILE);
}

/** Existing Foundations gallery HTML, served as the authenticated home page. */
export function readGalleryHtml() {
  return readFileSync(galleryFilePath(), "utf8");
}
