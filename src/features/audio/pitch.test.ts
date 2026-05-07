import { describe, expect, it } from "vitest";
import { estimatePitch, frequencyToNote, rootMeanSquare } from "./pitch";

function sineWave(
  frequency: number,
  sampleRate: number,
  length: number,
): Float32Array {
  const buffer = new Float32Array(length);

  for (let index = 0; index < length; index += 1) {
    buffer[index] =
      Math.sin((Math.PI * 2 * frequency * index) / sampleRate) * 0.7;
  }

  return buffer;
}

describe("pitch estimation", () => {
  it("tracks a concert A sine wave", () => {
    const sampleRate = 48_000;
    const estimate = estimatePitch(sineWave(440, sampleRate, 4096), sampleRate);

    expect(estimate.frequency).toBeGreaterThan(435);
    expect(estimate.frequency).toBeLessThan(445);
    expect(estimate.note).toBe("A4");
    expect(estimate.clarity).toBeGreaterThan(0.9);
  });

  it("treats silence as no pitch", () => {
    const estimate = estimatePitch(new Float32Array(2048), 48_000);

    expect(estimate.frequency).toBeNull();
    expect(estimate.note).toBe("Silence");
    expect(estimate.rms).toBe(0);
  });

  it("computes rms for non-empty buffers", () => {
    expect(rootMeanSquare(Float32Array.from([1, -1, 1, -1]))).toBe(1);
  });

  it("formats invalid notes safely", () => {
    expect(frequencyToNote(null)).toBe("Silence");
  });
});
