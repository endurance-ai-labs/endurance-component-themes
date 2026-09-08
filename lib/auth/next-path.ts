/**
 * A `next` query/form value is a relative path on this origin, or it is `/`.
 *
 * It arrives from the URL and from a hidden form field, so anything that is
 * not a same-origin path (a scheme, a protocol-relative `//`, a backslash)
 * is dropped rather than echoed into a Location header.
 */
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string") return "/";
  const next = value.trim();
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//") || next.includes("\\")) return "/";
  if (next.includes("://")) return "/";
  return next;
}
