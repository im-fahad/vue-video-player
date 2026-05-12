/**
 * Extract a YouTube video ID from any common URL form, or `null` if the URL
 * isn't a YouTube link.
 *
 * Recognised:
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtube.com/watch?v=ID&t=42
 *   - https://youtu.be/ID
 *   - https://youtu.be/ID?t=42
 *   - https://www.youtube.com/embed/ID
 *   - https://www.youtube.com/shorts/ID
 *   - https://music.youtube.com/watch?v=ID
 *   - bare 11-character video IDs
 */
export function parseYouTubeId(input: string): string | null {
  if (!input) return null;

  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  }

  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    const v = url.searchParams.get("v");
    if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;

    const m = /^\/(?:embed|shorts|v|live)\/([A-Za-z0-9_-]{11})/.exec(
      url.pathname
    );
    if (m) return m[1];
  }

  return null;
}

/** Extract a `t`/`start` timestamp (in seconds) from a YouTube URL, if present. */
export function parseYouTubeStart(input: string): number | null {
  try {
    const url = new URL(input);
    const t = url.searchParams.get("t") ?? url.searchParams.get("start");
    if (!t) return null;
    if (/^\d+s?$/.test(t)) return Number.parseInt(t, 10);
    const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t);
    if (m) {
      const h = Number.parseInt(m[1] ?? "0", 10);
      const min = Number.parseInt(m[2] ?? "0", 10);
      const s = Number.parseInt(m[3] ?? "0", 10);
      const total = h * 3600 + min * 60 + s;
      return total > 0 ? total : null;
    }
  } catch {
    /* not a URL */
  }
  return null;
}

export interface YouTubeEmbedOptions {
  /** Start playback immediately. Forces `mute` on, since browsers block sound-on autoplay. */
  autoPlay?: boolean;
  /** Mute the player. */
  muted?: boolean;
  /** Loop the video. */
  loop?: boolean;
  /** Show YouTube's player controls. Defaults to `true`. */
  controls?: boolean;
  /** Start offset in seconds. */
  startSeconds?: number | null;
}

/**
 * Build a privacy-enhanced YouTube embed URL from a video ID and player options.
 *
 * Notes on YouTube's quirks:
 *  - `autoplay=1` only takes effect if `mute=1` is also set (browser policy).
 *  - single-video loop requires `loop=1` **and** `playlist=<id>`.
 */
export function youTubeEmbedUrl(
  id: string,
  opts: YouTubeEmbedOptions = {}
): string {
  const {
    autoPlay = false,
    muted = true,
    loop = false,
    controls = true,
    startSeconds
  } = opts;

  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    controls: controls ? "1" : "0"
  });

  if (autoPlay) {
    params.set("autoplay", "1");
    params.set("mute", "1"); // required for autoplay to actually fire
  } else if (muted) {
    params.set("mute", "1");
  }

  if (loop) {
    params.set("loop", "1");
    params.set("playlist", id); // YouTube needs this for single-video loop
  }

  if (startSeconds && startSeconds > 0) {
    params.set("start", String(startSeconds));
  }

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
