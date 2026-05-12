import { describe, expect, it } from "vitest";
import { parseYouTubeId, parseYouTubeStart, youTubeEmbedUrl } from "../utils/youtube";

describe("parseYouTubeId", () => {
    it("parses watch?v= URLs", () => {
        expect(parseYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
            "dQw4w9WgXcQ"
        );
        expect(
            parseYouTubeId("https://youtube.com/watch?v=dQw4w9WgXcQ&t=42")
        ).toBe("dQw4w9WgXcQ");
    });

    it("parses youtu.be short URLs", () => {
        expect(parseYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe(
            "dQw4w9WgXcQ"
        );
        expect(parseYouTubeId("https://youtu.be/dQw4w9WgXcQ?t=90")).toBe(
            "dQw4w9WgXcQ"
        );
    });

    it("parses embed, shorts, live, and /v/ URLs", () => {
        expect(
            parseYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")
        ).toBe("dQw4w9WgXcQ");
        expect(
            parseYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")
        ).toBe("dQw4w9WgXcQ");
        expect(parseYouTubeId("https://www.youtube.com/live/dQw4w9WgXcQ")).toBe(
            "dQw4w9WgXcQ"
        );
    });

    it("parses music.youtube.com URLs", () => {
        expect(
            parseYouTubeId("https://music.youtube.com/watch?v=dQw4w9WgXcQ")
        ).toBe("dQw4w9WgXcQ");
    });

    it("accepts bare 11-char IDs", () => {
        expect(parseYouTubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    });

    it("returns null for non-YouTube URLs", () => {
        expect(parseYouTubeId("https://example.com/video.mp4")).toBeNull();
        expect(parseYouTubeId("https://vimeo.com/12345")).toBeNull();
        expect(parseYouTubeId("https://test-streams.mux.dev/x.m3u8")).toBeNull();
        expect(parseYouTubeId("not a url")).toBeNull();
        expect(parseYouTubeId("")).toBeNull();
    });
});

describe("parseYouTubeStart", () => {
    it("parses numeric and suffixed seconds", () => {
        expect(parseYouTubeStart("https://youtu.be/dQw4w9WgXcQ?t=90")).toBe(90);
        expect(
            parseYouTubeStart("https://www.youtube.com/watch?v=x&t=90s")
        ).toBe(90);
    });

    it("parses h/m/s composite forms", () => {
        expect(parseYouTubeStart("https://youtu.be/x?t=1m30s")).toBe(90);
        expect(parseYouTubeStart("https://youtu.be/x?t=1h2m3s")).toBe(3723);
    });

    it("returns null when no timestamp", () => {
        expect(parseYouTubeStart("https://youtu.be/dQw4w9WgXcQ")).toBeNull();
    });
});

describe("youTubeEmbedUrl", () => {
    it("builds a privacy-enhanced embed URL with sane defaults", () => {
        const url = youTubeEmbedUrl("dQw4w9WgXcQ");
        expect(url).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
        expect(url).toContain("rel=0");
        expect(url).toContain("playsinline=1");
        expect(url).toContain("controls=1");
        // default muted=true → mute=1, but no autoplay
        expect(url).toContain("mute=1");
        expect(url).not.toContain("autoplay=1");
    });

    it("adds autoplay=1 and forces mute=1 when autoPlay is set", () => {
        const url = youTubeEmbedUrl("dQw4w9WgXcQ", { autoPlay: true, muted: false });
        expect(url).toContain("autoplay=1");
        expect(url).toContain("mute=1"); // forced even though muted:false
    });

    it("omits mute when not muted and not autoplaying", () => {
        const url = youTubeEmbedUrl("dQw4w9WgXcQ", { muted: false });
        expect(url).not.toContain("mute=1");
    });

    it("sets controls=0 when controls is false", () => {
        expect(youTubeEmbedUrl("dQw4w9WgXcQ", { controls: false })).toContain(
            "controls=0"
        );
    });

    it("adds loop=1 and playlist=<id> for single-video loop", () => {
        const url = youTubeEmbedUrl("dQw4w9WgXcQ", { loop: true });
        expect(url).toContain("loop=1");
        expect(url).toContain("playlist=dQw4w9WgXcQ");
    });

    it("includes a start time when provided", () => {
        expect(
            youTubeEmbedUrl("dQw4w9WgXcQ", { startSeconds: 42 })
        ).toContain("start=42");
        expect(
            youTubeEmbedUrl("dQw4w9WgXcQ", { startSeconds: 0 })
        ).not.toContain("start=");
    });
});
