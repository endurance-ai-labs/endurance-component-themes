import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPublicPath, signInRedirectUrl } from "./gate";

describe("isPublicPath", () => {
  it("allows the sign-in page and auth routes", () => {
    assert.equal(isPublicPath("/sign-in"), true);
    assert.equal(isPublicPath("/api/auth/google"), true);
    assert.equal(isPublicPath("/api/auth/google/callback"), true);
    assert.equal(isPublicPath("/api/auth/dev"), true);
  });

  it("does not allow the gallery or anything else", () => {
    assert.equal(isPublicPath("/"), false);
    assert.equal(isPublicPath("/gallery.html"), false);
    assert.equal(isPublicPath("/api/other"), false);
  });
});

describe("signInRedirectUrl", () => {
  it("sends / to /sign-in without a next param", () => {
    assert.equal(signInRedirectUrl("https://example.test", "/").toString(), "https://example.test/sign-in");
  });

  it("keeps a non-root path as next", () => {
    assert.equal(
      signInRedirectUrl("https://example.test", "/looking-glass").toString(),
      "https://example.test/sign-in?next=%2Flooking-glass",
    );
  });
});
