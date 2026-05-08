import { defineNuxtPlugin } from "#app";
import VideoPlayer from "../VideoPlayer.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("VueVideoPlayer", VideoPlayer);
});
