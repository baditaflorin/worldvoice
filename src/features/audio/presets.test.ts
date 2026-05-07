import { describe, expect, it } from "vitest";
import { clampSetting, getPreset, PRESETS } from "./presets";

describe("presets", () => {
  it("keeps oscillator and harmonic contracts aligned", () => {
    for (const preset of PRESETS) {
      expect(preset.harmonicRatios.length).toBeGreaterThan(0);
      expect(preset.harmonicGains.length).toBe(preset.harmonicRatios.length);
      expect(preset.detuneCents.length).toBeGreaterThan(0);
      expect(preset.accent).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("returns the requested preset", () => {
    expect(getPreset("choir").label).toBe("Choir");
  });

  it("clamps control values", () => {
    expect(clampSetting(-2)).toBe(0);
    expect(clampSetting(2)).toBe(1);
    expect(clampSetting(0.4)).toBe(0.4);
  });
});
