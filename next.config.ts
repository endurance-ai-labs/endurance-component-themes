import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The authenticated home page reads content/gallery.html at request time.
  // Include it in the function bundle so Vercel does not drop it.
  outputFileTracingIncludes: {
    "/": ["./content/gallery.html"],
  },
};

export default nextConfig;
