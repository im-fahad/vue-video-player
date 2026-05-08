import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VideoPlayer from "../VideoPlayer.vue";

describe("VueVideoPlayer", () => {
  it("renders a video element with the given src", () => {
    const wrapper = mount(VideoPlayer, {
      props: { src: "https://example.com/video.mp4" }
    });
    const video = wrapper.find("video");
    expect(video.exists()).toBe(true);
  });

  it("renders the device toggle by default", () => {
    const wrapper = mount(VideoPlayer, {
      props: { src: "https://example.com/video.mp4" }
    });
    expect(wrapper.find('[aria-label="Desktop view"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Mobile view"]').exists()).toBe(true);
  });

  it("hides the device toggle when showDeviceToggle is false", () => {
    const wrapper = mount(VideoPlayer, {
      props: { src: "https://example.com/video.mp4", showDeviceToggle: false }
    });
    expect(wrapper.find('[aria-label="Desktop view"]').exists()).toBe(false);
  });

  it("renders the close button only when closable is true and emits close on click", async () => {
    const wrapper = mount(VideoPlayer, {
      props: { src: "https://example.com/video.mp4" }
    });
    expect(wrapper.find('[aria-label="Close"]').exists()).toBe(false);

    await wrapper.setProps({ closable: true });
    const closeBtn = wrapper.find('[aria-label="Close"]');
    expect(closeBtn.exists()).toBe(true);

    await closeBtn.trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("renders the play button when paused", () => {
    const wrapper = mount(VideoPlayer, {
      props: { src: "https://example.com/video.mp4" }
    });
    expect(wrapper.find('[aria-label="Play"]').exists()).toBe(true);
  });

  it("toggles device mode when the mobile button is clicked", async () => {
    const wrapper = mount(VideoPlayer, {
      props: { src: "https://example.com/video.mp4" }
    });
    const root = wrapper.find(".gvp-root");
    expect((root.element as HTMLElement).style.aspectRatio).toBe("16/9");

    await wrapper.find('[aria-label="Mobile view"]').trigger("click");
    expect((root.element as HTMLElement).style.aspectRatio).toBe("9/16");
  });

  it("uses custom aspect ratios when provided", () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: "https://example.com/video.mp4",
        aspectRatio: { desktop: "4/3", mobile: "1/1" }
      }
    });
    const root = wrapper.find(".gvp-root");
    expect((root.element as HTMLElement).style.aspectRatio).toBe("4/3");
  });
});
