import { addPlugin, createResolver, defineNuxtModule } from "@nuxt/kit";

export interface ModuleOptions {
  /** Reserved for future configuration. */
  _reserved?: never;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@glitchlab/vue-video-player",
    configKey: "vueVideoPlayer",
    compatibility: {
      nuxt: ">=3.0.0"
    }
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url);
    addPlugin(resolver.resolve("./nuxt-plugin"));
  }
});
