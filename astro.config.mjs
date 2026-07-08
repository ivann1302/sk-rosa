import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  srcDir: "./astro",
  outDir: "./public_html_astro",
  publicDir: "./astro-public",
  site: "https://sk-rosa.ru",
  build: {
    format: "file",
  },
  integrations: [react()],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [resolve("src/styles")],
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve("src"),
        "@assets": resolve("src/assets"),
        "@styles": resolve("src/styles"),
      },
    },
    plugins: [
      viteStaticCopy({
        targets: [
          { src: "src/assets", dest: "." },
          { src: "src/scripts", dest: "." },
          { src: "src/.htaccess", dest: "." },
          { src: "src/.nojekyll", dest: "." },
          { src: "src/404.html", dest: "." },
          { src: "src/404.php", dest: "." },
          { src: "src/robots.txt", dest: "." },
          { src: "src/router.php", dest: "." },
          { src: "src/public/llms.txt", dest: "." },
          { src: "src/bde05525-af0e-48de-b161-305c96820afb.txt", dest: "." },
          { src: "src/yandex_35e96ef6b3300db1.html", dest: "." },
          { src: "src/yandex_409f3d25273b124e.html", dest: "." },
          { src: "src/yandex_a93fef6adebc72d6.html", dest: "." },
        ],
      }),
    ],
  },
});
