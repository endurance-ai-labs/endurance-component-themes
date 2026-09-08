import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readGalleryHtml } from "./gallery";

describe("gallery HTML", () => {
  const html = readGalleryHtml();

  it("keeps the Foundations gallery document", () => {
    assert.match(html, /Endurance components · Foundations/);
    assert.match(html, /Focus timer/);
    assert.match(html, /Looking Glass/);
  });

  it("keeps CRM ink tokens and light/dark pairs", () => {
    assert.match(html, /CRM ink/);
    assert.match(html, /pane-light/);
    assert.match(html, /pane-dark/);
    assert.match(html, /data-filter="light"/);
    assert.match(html, /data-filter="dark"/);
    assert.match(html, /--ink-solid:#1a1a1a/);
  });

  it("keeps the Looking Glass remap section", () => {
    assert.match(html, /Looking Glass product \(CRM ink remap\)/);
    assert.match(html, /LG patterns on CRM ink/);
  });
});
