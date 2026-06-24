import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MediaUploadError } from "../../src/lib/media/errors";
import {
  assertAllowedSize,
  detectMimeFromHeader,
  extensionForMime,
  sanitizeOriginalFilename,
  validateUploadFile,
} from "../../src/lib/media/validation";
import {
  checkUploadRateLimit,
  resetUploadRateLimitsForTests,
} from "../../src/lib/media/rate-limit";

describe("media validation", () => {
  it("detects png from magic bytes", () => {
    const header = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    assert.equal(detectMimeFromHeader(header), "image/png");
  });

  it("rejects path traversal in filenames", () => {
    const safe = sanitizeOriginalFilename("../../etc/passwd");
    assert.equal(safe.includes(".."), false);
    assert.equal(safe.includes("/"), false);
  });

  it("maps mime to extension", () => {
    assert.equal(extensionForMime("image/jpeg"), ".jpg");
    assert.equal(extensionForMime("video/mp4"), ".mp4");
  });

  it("throws when image exceeds configured size", () => {
    assert.throws(
      () => assertAllowedSize(11 * 1024 * 1024, "image/png"),
      (error: unknown) =>
        error instanceof MediaUploadError && error.code === "imageTooLarge"
    );
  });

  it("validates jpeg file content", () => {
    const header = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const file = new File([header], "photo.jpg", { type: "image/jpeg" });
    const result = validateUploadFile(file, "media", header);
    assert.equal(result.mimeType, "image/jpeg");
    assert.equal(result.byteSize, 6);
  });

  it("accepts .jpeg extension and image/jpg mime", () => {
    const header = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const file = new File([header], "photo.jpeg", { type: "image/jpg" });
    const result = validateUploadFile(file, "media", header);
    assert.equal(result.mimeType, "image/jpeg");
  });

  it("falls back to extension when browser omits mime type", () => {
    const header = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const file = new File([header], "scan.jpeg", { type: "" });
    const result = validateUploadFile(file, "media", header);
    assert.equal(result.mimeType, "image/jpeg");
  });
});

describe("upload rate limit", () => {
  it("blocks after limit is exceeded", () => {
    resetUploadRateLimitsForTests();
    const userId = "test-user";
    let allowed = 0;
    for (let i = 0; i < 35; i += 1) {
      if (checkUploadRateLimit(userId)) allowed += 1;
    }
    assert.ok(allowed <= 30);
    resetUploadRateLimitsForTests();
  });
});
