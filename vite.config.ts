import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ["src"],
      exclude: [
        "src/__tests__/**",
        "src/utils/nuxt-plugin.ts",
        "**/*.test.ts",
        "**/*.test.tsx"
      ]
    })
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "nuxt-module": resolve(__dirname, "src/utils/nuxt-module.ts")
      },
      formats: ["es", "cjs"],
      fileName: (format, name) => `${name}.${format === "es" ? "mjs" : "cjs"}`
    },
    rollupOptions: {
      external: [
        "vue",
        "hls.js",
        "@nuxt/kit",
        "#app",
        /^node:.*/
      ],
      output: {
        globals: {
          vue: "Vue",
          "hls.js": "Hls"
        }
      }
    }
  }
});
