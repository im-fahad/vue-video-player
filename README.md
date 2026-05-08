# @glitchlab/vue-video-player

A lightweight, HLS-capable Vue 3 video player with a polished overlay UI, device-mode toggle, hover-to-play, and **zero global CSS side-effects**. Ships a Nuxt 3 module for zero-config integration.

[![npm](https://img.shields.io/npm/v/@glitchlab/vue-video-player.svg)](https://www.npmjs.com/package/@glitchlab/vue-video-player)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@glitchlab/vue-video-player.svg)](https://bundlephobia.com/package/@glitchlab/vue-video-player)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![types: TypeScript](https://img.shields.io/badge/types-TypeScript-blue.svg)](#typescript)

---

## Why this player

- **HLS streaming** via `hls.js` with automatic native fallback (Safari)
- **Nuxt 3 module** — `modules: ["@glitchlab/vue-video-player/nuxt"]` and you're done
- **Scoped CSS, no preflight** — all styles live under `.gvp-root`. No `*` resets, no theme tokens leaked into your design system
- **Device-mode toggle** — flip between desktop (16:9) and mobile (9:16) presets
- **Hover-to-play** with safe play/pause race handling
- Tiny: ~3 KB CSS gzipped, ~3.6 KB JS gzipped
- Fully typed; SSR-safe

---

## Installation

```bash
npm install @glitchlab/vue-video-player hls.js
# or
pnpm add @glitchlab/vue-video-player hls.js
# or
yarn add @glitchlab/vue-video-player hls.js
```

> **Peer dependencies:** `vue >= 3`, `hls.js >= 1`

Import the stylesheet once at your app entry:

```ts
import "@glitchlab/vue-video-player/style.css";
```

---

## Quick start

### Vue 3

```vue
<script setup lang="ts">
import { VueVideoPlayer } from "@glitchlab/vue-video-player";
import "@glitchlab/vue-video-player/style.css";
</script>

<template>
  <VueVideoPlayer
    src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    poster="/images/poster.jpg"
  />
</template>
```

### Nuxt 3

Add the module to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ["@glitchlab/vue-video-player/nuxt"],
  css: ["@glitchlab/vue-video-player/style.css"]
});
```

Then use the component anywhere — no manual import required:

```vue
<template>
  <VueVideoPlayer
    src="https://example.com/video/playlist.m3u8"
    poster="/images/poster.jpg"
  />
</template>
```

---

## Props

| Prop                | Type                                              | Default                                 | Description                                                                              |
|---------------------|---------------------------------------------------|-----------------------------------------|------------------------------------------------------------------------------------------|
| `src`               | `string`                                          | —                                       | **Required.** Video URL. `.m3u8` is routed through HLS automatically.                    |
| `poster`            | `string`                                          | —                                       | Poster image shown before playback starts.                                               |
| `showDeviceToggle`  | `boolean`                                         | `true`                                  | Show the desktop/mobile toggle pill in the top-left.                                     |
| `defaultDevice`     | `"desktop" \| "mobile"`                           | `"desktop"`                             | Initial device mode.                                                                     |
| `hoverPlay`         | `boolean`                                         | `false`                                 | Start playback on mouse-enter, pause on mouse-leave.                                     |
| `tooltipText`       | `string`                                          | —                                       | Tooltip text shown above the play button on hover.                                       |
| `closable`          | `boolean`                                         | `false`                                 | Show a close button in the top-right; emits `close` when clicked.                        |
| `class`             | `string`                                          | `""`                                    | Extra class added to the outer container (alongside `.gvp-root`).                        |
| `muted`             | `boolean`                                         | `true`                                  | Mute the video. Required for autoplay in most browsers.                                  |
| `loop`              | `boolean`                                         | `false`                                 | Loop playback.                                                                           |
| `controls`          | `boolean`                                         | `false`                                 | Show native browser controls.                                                            |
| `frameMaxWidth`     | `{ desktop?: string; mobile?: string }`           | `{ desktop: "960px", mobile: "420px" }` | Max width of the player in each device mode.                                             |
| `aspectRatio`       | `{ desktop?: AspectRatio; mobile?: AspectRatio }` | `{ desktop: "16/9", mobile: "9/16" }`   | Aspect ratio per device mode. `AspectRatio` is `` `${number}/${number}` ``.              |
| `hlsConfig`         | `Hls.HlsConfig`                                   | —                                       | Optional hls.js config. Use a stable reference (e.g. `shallowRef`) to avoid HLS rebuilds.|
| `isHls`             | `boolean`                                         | `false`                                 | Force HLS routing even when the URL doesn't end in `.m3u8`.                              |

## Events

| Event   | Payload | Description                                                          |
|---------|---------|----------------------------------------------------------------------|
| `close` | —       | Emitted when the close button is clicked. Requires `closable=true`.  |
| `play`  | —       | Emitted when playback starts.                                        |
| `pause` | —       | Emitted when playback pauses.                                        |

## Slots

| Slot      | Description                                                                              |
|-----------|------------------------------------------------------------------------------------------|
| `default` | Rendered inside the underlying `<video>`. Use for `<track>` elements (captions/subs).    |

---

## Examples

### Looping background video, no UI chrome

```vue
<VueVideoPlayer
  src="/videos/hero.m3u8"
  :muted="true"
  :loop="true"
  :show-device-toggle="false"
/>
```

### Hover-to-play with a tooltip

```vue
<VueVideoPlayer
  src="/videos/demo.mp4"
  poster="/images/thumb.jpg"
  :hover-play="true"
  tooltip-text="Watch the demo"
/>
```

### Dismissible player in a modal

```vue
<script setup lang="ts">
import { ref } from "vue";
import { VueVideoPlayer } from "@glitchlab/vue-video-player";

const open = ref(true);
</script>

<template>
  <VueVideoPlayer
    v-if="open"
    src="/videos/walkthrough.m3u8"
    :closable="true"
    :show-device-toggle="false"
    @close="open = false"
  />
</template>
```

### Custom aspect ratio and frame width

```vue
<VueVideoPlayer
  src="/videos/portrait.mp4"
  default-device="mobile"
  :aspect-ratio="{ desktop: '4/3', mobile: '9/16' }"
  :frame-max-width="{ desktop: '720px', mobile: '360px' }"
/>
```

### Captions and subtitles

```vue
<VueVideoPlayer src="/videos/talk.m3u8" :controls="true">
  <track kind="captions" src="/captions/talk.en.vtt" srclang="en" label="English" default />
  <track kind="subtitles" src="/captions/talk.es.vtt" srclang="es" label="Spanish" />
</VueVideoPlayer>
```

### Custom hls.js configuration

```vue
<script setup lang="ts">
import { shallowRef } from "vue";
import { VueVideoPlayer } from "@glitchlab/vue-video-player";

const hlsConfig = shallowRef({
  enableWorker: true,
  lowLatencyMode: true,
  maxBufferLength: 30
});
</script>

<template>
  <VueVideoPlayer src="/videos/live.m3u8" :hls-config="hlsConfig" />
</template>
```

> **Use `shallowRef` (or any stable reference).** A new object identity each render tears down and rebuilds the entire HLS instance.

---

## TypeScript

Full type definitions ship with the package. Re-exported types:

```ts
import type {
  VideoPlayerProps,
  HLSPlayerProps,
  DeviceMode,
  AspectRatio
} from "@glitchlab/vue-video-player";
```

---

## Styling and customization

All styles are scoped under `.gvp-root`. The CSS file (~3 KB minified) contains no global resets and no design-token bleed. Override what you need:

```css
.gvp-root {
  border-radius: 8px;
}

.gvp-play {
  background-color: rebeccapurple;
}

.gvp-toggle-btn.is-active {
  color: deeppink;
}
```

Available class hooks:

| Class                 | Element                                         |
|-----------------------|-------------------------------------------------|
| `.gvp-root`           | Outer container                                 |
| `.gvp-video`          | Underlying `<video>` element                    |
| `.gvp-vignette`       | Top vignette overlay                            |
| `.gvp-bottom-fade`    | Bottom gradient                                 |
| `.gvp-toggle`         | Device-toggle wrapper                           |
| `.gvp-toggle-pill`    | The pill background                             |
| `.gvp-toggle-btn`     | Individual toggle button (`.is-active` modifier)|
| `.gvp-toggle-divider` | Vertical divider between toggle buttons         |
| `.gvp-close`          | Top-right close button                          |
| `.gvp-play-wrap`      | Center play-button container                    |
| `.gvp-play`           | Play button                                     |
| `.gvp-tooltip`        | Tooltip above play button                       |
| `.gvp-icon`           | All inline SVG icons                            |

---

## SSR

The component is SSR-safe. Server output renders the static frame; HLS attaches client-side once the video element mounts. Works with Nuxt 3, Vite-SSR, and any vanilla SSR setup.

---

## Browser support

- Chromium ≥ 88, Firefox ≥ 78, Safari ≥ 14, Edge ≥ 88
- Native HLS playback on Safari (no `hls.js` cost)
- Worker-based HLS on browsers with MSE

---

## Contributing

```bash
git clone https://github.com/im-fahad/vue-video-player.git
cd vue-video-player
pnpm install
pnpm test
pnpm build
```

Issues and PRs welcome at <https://github.com/im-fahad/vue-video-player/issues>.

---

## License

[MIT](./LICENSE) © im-fahad
