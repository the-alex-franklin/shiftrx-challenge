import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import presetWind4 from "@unocss/preset-wind4";
import { presetWebFonts } from "unocss";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    deno(),
    vue(),
    UnoCSS({
      presets: [
        presetWind4(),
        presetWebFonts(),
      ],
    }),
  ],
});
