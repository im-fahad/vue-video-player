import "./styles.css";

export { default as VueVideoPlayer } from "./VideoPlayer.vue";
export { default as HLSPlayer } from "./HLSPlayer.vue";
export type {
  VideoPlayerProps, HLSPlayerProps, DeviceMode, AspectRatio
} from "./utils/types";
export { parseYouTubeId, parseYouTubeStart, youTubeEmbedUrl } from "./utils/youtube";
