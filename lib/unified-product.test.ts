import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { UNIFIED_THEMES_URL } from "./unified-product";

describe("retired gallery hostname", () => {
  it("points vercel.json at the unified themes URL", () => {
    const config = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8")) as {
      redirects?: Array<{ source: string; destination: string; permanent?: boolean }>;
    };
    const redirect = config.redirects?.[0];
    assert.equal(redirect?.source, "/:path*");
    assert.equal(redirect?.destination, UNIFIED_THEMES_URL);
    assert.equal(redirect?.permanent, true);
  });
});
