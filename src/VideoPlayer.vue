<script lang="ts" setup>
import { computed, ref } from "vue";
import HLSPlayer from "./HLSPlayer.vue";
import IconDesktop from "./components/IconDesktop.vue";
import IconMobile from "./components/IconMobile.vue";
import IconPlay from "./components/IconPlay.vue";
import IconX from "./components/IconX.vue";
import type { DeviceMode, VideoPlayerProps } from "./utils/types";
import { parseYouTubeId, parseYouTubeStart, youTubeEmbedUrl } from "./utils/youtube";

const props = withDefaults(
  defineProps<VideoPlayerProps & { class?: string; closable?: boolean }>(),
  {
    showDeviceToggle: true,
    defaultDevice: "desktop",
    hoverPlay: false,
    muted: true,
    loop: false,
    controls: false,
    autoPlay: false,
    closable: false,
    class: ""
  }
);

const emit = defineEmits<{
  close: [];
  play: [];
  pause: [];
}>();

const hlsPlayerRef = ref<InstanceType<typeof HLSPlayer> | null>(null);
const device = ref<DeviceMode>(props.defaultDevice);
const isPlaying = ref(false);
const showTooltip = ref(false);
const playPromise = ref<Promise<void> | null>(null);

const youTubeId = computed(() => parseYouTubeId(props.src));
const isYouTube = computed(() => youTubeId.value !== null);
const youTubeSrc = computed(() =>
  youTubeId.value
    ? youTubeEmbedUrl(youTubeId.value, {
        autoPlay: props.autoPlay,
        muted: props.muted,
        loop: props.loop,
        controls: props.controls,
        startSeconds: parseYouTubeStart(props.src)
      })
    : null
);

const aspectRatio = computed(() =>
  device.value === "mobile"
    ? (props.aspectRatio?.mobile ?? "9/16")
    : (props.aspectRatio?.desktop ?? "16/9")
);

const frameMaxWidth = computed(() =>
  device.value === "mobile"
    ? (props.frameMaxWidth?.mobile ?? "420px")
    : (props.frameMaxWidth?.desktop ?? "960px")
);

const videoEl = computed(() => hlsPlayerRef.value?.videoEl ?? null);

async function safePlay() {
  const el = videoEl.value;
  if (!el) return;
  try {
    if (el.readyState < 2) el.load();
    const p = el.play();
    playPromise.value = p;
    await p;
    isPlaying.value = true;
  } catch {
    isPlaying.value = false;
  } finally {
    playPromise.value = null;
  }
}

async function safePause() {
  const el = videoEl.value;
  if (!el) return;
  if (playPromise.value) {
    try {
      await playPromise.value;
    } catch {
      /* play was interrupted; nothing to await */
    }
  }
  el.pause();
}

async function hoverStart() {
  if (!props.hoverPlay || isYouTube.value) return;
  await safePlay();
}

async function hoverStop() {
  if (!props.hoverPlay || isYouTube.value) return;
  await safePause();
  isPlaying.value = false;
}

async function togglePlay() {
  const el = videoEl.value;
  if (!el) return;
  if (el.paused) {
    await safePlay();
  } else {
    await safePause();
    isPlaying.value = false;
  }
}

function onMouseEnter() {
  showTooltip.value = true;
  void hoverStart();
}

function onMouseLeave() {
  showTooltip.value = false;
  void hoverStop();
}
</script>

<template>
  <div
    :class="['gvp-root', props.class]"
    :style="{ width: frameMaxWidth, aspectRatio }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <iframe
      v-if="isYouTube"
      class="gvp-video gvp-youtube"
      :src="youTubeSrc ?? undefined"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    />
    <HLSPlayer
      v-else
      ref="hlsPlayerRef"
      :controls="controls"
      :hls-config="hlsConfig"
      :is-hls="isHls"
      :loop="loop"
      :muted="muted"
      :auto-play="autoPlay"
      :plays-inline="true"
      :poster="poster"
      :src="src"
      class="gvp-video"
      preload="metadata"
      @pause="
        isPlaying = false;
        emit('pause');
      "
      @play="
        isPlaying = true;
        emit('play');
      "
    >
      <slot />
    </HLSPlayer>

    <div v-if="!isYouTube" class="gvp-vignette" />

    <div v-if="showDeviceToggle" class="gvp-toggle">
      <div class="gvp-toggle-pill">
        <button
          :aria-pressed="device === 'desktop'"
          :class="['gvp-toggle-btn', { 'is-active': device === 'desktop' }]"
          aria-label="Desktop view"
          type="button"
          @click="device = 'desktop'"
        >
          <IconDesktop />
        </button>

        <div class="gvp-toggle-divider" />

        <button
          :aria-pressed="device === 'mobile'"
          :class="['gvp-toggle-btn', { 'is-active': device === 'mobile' }]"
          aria-label="Mobile view"
          type="button"
          @click="device = 'mobile'"
        >
          <IconMobile />
        </button>
      </div>
    </div>

    <button
      v-if="closable"
      aria-label="Close"
      class="gvp-close"
      type="button"
      @click="emit('close')"
    >
      <IconX />
    </button>

    <div v-if="!isYouTube && !isPlaying" class="gvp-play-wrap">
      <button
        aria-label="Play"
        class="gvp-play"
        type="button"
        @click="togglePlay"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
      >
        <IconPlay />
        <span v-if="tooltipText && showTooltip" class="gvp-tooltip" role="tooltip">
          {{ tooltipText }}
        </span>
      </button>
    </div>

    <div v-if="!isYouTube" class="gvp-bottom-fade" />
  </div>
</template>
