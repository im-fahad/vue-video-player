import { vi } from "vitest";

vi.mock("hls.js", () => {
  class HlsMock {
    static isSupported() {
      return false;
    }
    static Events = { ERROR: "hlsError" };
    attachMedia() {}
    loadSource() {}
    on() {}
    destroy() {}
  }
  return { default: HlsMock };
});

Object.defineProperty(HTMLMediaElement.prototype, "play", {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined)
});
Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  configurable: true,
  value: vi.fn()
});
Object.defineProperty(HTMLMediaElement.prototype, "load", {
  configurable: true,
  value: vi.fn()
});
