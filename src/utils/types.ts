import type { HlsConfig } from "hls.js";

export type DeviceMode = "desktop" | "mobile";

export type AspectRatio = `${number}/${number}`;

export interface VideoPlayerProps {
  /** Video source URL. `.m3u8` URLs are routed through hls.js automatically. */
  src: string;
  /** Poster image shown before playback. */
  poster?: string;

  /** Show the desktop/mobile toggle pill in the top-left. Defaults to `true`. */
  showDeviceToggle?: boolean;
  /** Initial device mode. Defaults to `"desktop"`. */
  defaultDevice?: DeviceMode;

  /** Start playback on mouse enter, pause on mouse leave. Defaults to `false`. */
  hoverPlay?: boolean;

  /** Text shown in a tooltip above the play button. */
  tooltipText?: string;

  /** Mute the video. Defaults to `true`. */
  muted?: boolean;
  /** Loop playback. Defaults to `false`. */
  loop?: boolean;
  /** Show native browser controls. Defaults to `false`. */
  controls?: boolean;

  /** Maximum width of the player in each device mode. */
  frameMaxWidth?: {
    desktop?: string;
    mobile?: string;
  };

  /** Aspect ratio in each device mode. */
  aspectRatio?: {
    desktop?: AspectRatio;
    mobile?: AspectRatio;
  };

  /**
   * Optional hls.js configuration. Pass a stable reference to avoid tearing
   * down and rebuilding the HLS instance on each render.
   */
  hlsConfig?: HlsConfig;

  /** Force HLS routing even when the URL doesn't end in `.m3u8`. */
  isHls?: boolean;
}

export interface HLSPlayerProps {
  src: string;
  hlsConfig?: HlsConfig;
  isHls?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  preload?: string;
  poster?: string;
  class?: string;
}
