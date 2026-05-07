import { describe, expect, it } from "vitest";
import { FALLBACK_MANIFEST, modelManifestSchema } from "./modelManifest";

describe("model manifest", () => {
  it("validates the fallback manifest", () => {
    expect(modelManifestSchema.parse(FALLBACK_MANIFEST).schemaVersion).toBe(1);
  });

  it("rejects incompatible schema versions", () => {
    expect(() =>
      modelManifestSchema.parse({
        ...FALLBACK_MANIFEST,
        schemaVersion: 2,
      }),
    ).toThrow();
  });
});
