import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LocalMediaStorageProvider } from "../../src/lib/media/storage/local";

describe("local storage provider", () => {
  it("builds public urls without exposing original filenames", () => {
    const provider = new LocalMediaStorageProvider();
    const url = provider.getPublicUrl("media/550e8400-e29b-41d4-a716-446655440000.jpg");
    assert.match(url, /\/uploads\/media\/[0-9a-f-]+\.jpg$/);
  });

  it("rejects traversal keys when resolving paths", () => {
    const provider = new LocalMediaStorageProvider();
    assert.equal(provider.keyFromPublicUrl("/uploads/media/evil.jpg"), "media/evil.jpg");
    assert.equal(provider.isManagedUrl("/uploads/media/evil.jpg"), true);
    assert.equal(provider.isManagedUrl("https://example.com/x.jpg"), false);
  });
});
