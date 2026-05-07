import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

const canvasContext = {
  beginPath: vi.fn(),
  arc: vi.fn(),
  clearRect: vi.fn(),
  closePath: vi.fn(),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  fill: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  restore: vi.fn(),
  save: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
};

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: vi.fn(() => canvasContext),
});

Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
  value: vi.fn(() => ({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    top: 0,
    right: 800,
    bottom: 600,
    left: 0,
    toJSON: () => ({}),
  })),
});

Object.defineProperty(window, "requestAnimationFrame", {
  value: (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), 16),
});

Object.defineProperty(window, "cancelAnimationFrame", {
  value: (id: number) => window.clearTimeout(id),
});
