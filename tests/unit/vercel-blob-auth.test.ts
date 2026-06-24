import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { hasVercelBlobCredentials } from "../../src/lib/media/vercel-blob-auth";

describe("vercel blob credentials", () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it("detects static read-write token", () => {
    process.env = { ...env, BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_xxx" };
    delete process.env.BLOB_STORE_ID;
    assert.equal(hasVercelBlobCredentials(), true);
  });

  it("detects OIDC store id without legacy token", () => {
    process.env = { ...env, BLOB_STORE_ID: "store_abc123" };
    delete process.env.BLOB_READ_WRITE_TOKEN;
    assert.equal(hasVercelBlobCredentials(), true);
  });

  it("returns false when blob is not configured", () => {
    process.env = { ...env };
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_STORE_ID;
    assert.equal(hasVercelBlobCredentials(), false);
  });
});
