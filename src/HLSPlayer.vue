<script setup lang="ts">
import Hls from "hls.js";
import { onMounted, onUnmounted, ref, watch } from "vue";
import type { HlsConfig } from "hls.js";

const props = withDefaults(
  defineProps<{
    src: string;
    hlsConfig?: HlsConfig;
    isHls?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
    autoPlay?: boolean;
    playsInline?: boolean;
    preload?: string;
    poster?: string;
    class?: string;
  }>(),
  {
    muted: true,
    loop: false,
    controls: false,
    autoPlay: false,
    playsInline: true,
    preload: "metadata"
  }
);

const emit = defineEmits<{
  play: [];
  pause: [];
}>();

const videoEl = ref<HTMLVideoElement | null>(null);
const hlsInstance = ref<Hls | null>(null);

const canUseHlsJs = globalThis.window !== undefined && Hls.isSupported();
const shouldUseHls = (src: string) =>
  Boolean(props.isHls) || (canUseHlsJs && src.endsWith(".m3u8"));

let detachLoadedMetadata: (() => void) | undefined;

function cleanup() {
  detachLoadedMetadata?.();
  detachLoadedMetadata = undefined;
  if (hlsInstance.value) {
    hlsInstance.value.destroy();
    hlsInstance.value = null;
  }
  const el = videoEl.value;
  if (!el) return;
  el.pause();
  el.removeAttribute("src");
  while (el.firstChild) el.firstChild.remove();
  el.load();
}

function initPlayer(src: string) {
  const el = videoEl.value;
  if (!el || !src) return;

  cleanup();

  // Tries to start playback once the stream is ready. Browsers only honor
  // sound-on autoplay after a user gesture, so this is best effort — silently
  // swallows the NotAllowedError when blocked.
  const tryAutoPlay = () => {
    if (!props.autoPlay) return;
    el.play().catch(() => {
      /* autoplay blocked; user gesture required */
    });
  };

  if (shouldUseHls(src)) {
    const hls = new Hls(props.hlsConfig);
    hlsInstance.value = hls;
    hls.attachMedia(el);
    hls.loadSource(src);
    hls.on(Hls.Events.MANIFEST_PARSED, tryAutoPlay);
    hls.on(Hls.Events.ERROR, (_evt, data) => {
      if (data.fatal) {
        hls.destroy();
        hlsInstance.value = null;
      }
    });
  } else {
    el.src = src;
    el.load();
    el.addEventListener("loadedmetadata", tryAutoPlay, { once: true });
    detachLoadedMetadata = () => {
      el.removeEventListener("loadedmetadata", tryAutoPlay);
    };
  }
}

onMounted(() => {
  if (props.src) initPlayer(props.src);
});

watch(
  () => props.src,
  (src) => {
    if (src) initPlayer(src);
  }
);

onUnmounted(cleanup);

defineExpose({ videoEl });
</script>

<template>
  <video
    ref="videoEl"
    :muted="muted"
    :loop="loop"
    :controls="controls"
    :autoplay="autoPlay"
    :playsinline="playsInline"
    :preload="preload"
    :poster="poster"
    :class="props.class"
    @play="emit('play')"
    @pause="emit('pause')"
  >
    <slot />
  </video>
</template>
