import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeNextPath } from "./next-path";

describe("safeNextPath", () => {
  it("keeps a relative path", () => {
    assert.equal(safeNextPath("/sign-in"), "/sign-in");
    assert.equal(safeNextPath("/?theme=dark"), "/?theme=dark");
  });

  it("rejects anything that could leave this origin", () => {
    assert.equal(safeNextPath("https://evil.example"), "/");
    assert.equal(safeNextPath("//evil.example"), "/");
    assert.equal(safeNextPath("/\\evil.example"), "/");
    assert.equal(safeNextPath("accounts"), "/");
    assert.equal(safeNextPath(""), "/");
    assert.equal(safeNextPath(undefined), "/");
  });
});
