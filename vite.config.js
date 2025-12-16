import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve, join } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, rmdirSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Плагин для замены путей в HTML файлах и перемещения их в корень после сборки
const fixHtmlPaths = () => {
  return {
    name: "fix-html-paths",
    closeBundle() {
      const outDir = resolve(__dirname, "public_html");
      const pagesDir = join(outDir, "pages");

      // Проверяем, существует ли папка pages
      if (!statSync(pagesDir, { throwIfNoEntry: false })) {
        return;
      }

      // Находим все HTML файлы в папке pages
      const files = readdirSync(pagesDir);
      const htmlFiles = files.filter(file => file.endsWith(".html"));

      htmlFiles.forEach(file => {
        const sourceFile = join(pagesDir, file);
        const targetFile = join(outDir, file);

        // Читаем содержимое файла
        let content = readFileSync(sourceFile, "utf-8");

        // Заменяем ../scripts/ на scripts/
        content = content.replace(/\.\.\/scripts\//g, "scripts/");
        // Заменяем ../styles/ на styles/
        content = content.replace(/\.\.\/styles\//g, "styles/");
        // Заменяем ../assets/ на assets/
        content = content.replace(/\.\.\/assets\//g, "assets/");
        // Заменяем ../index.html на index.html
        content = content.replace(/\.\.\/index\.html/g, "index.html");

        // Записываем исправленный файл в корень
        writeFileSync(targetFile, content, "utf-8");

        // Удаляем исходный файл из папки pages
        unlinkSync(sourceFile);
      });

      // Удаляем пустую папку pages
      try {
        rmdirSync(pagesDir);
      } catch (e) {
        // Игнорируем ошибку, если папка не пуста
      }
    },
  };
};

export default defineConfig({
  // 5.1: Настройка base URL для корректных путей в production
  // Для GitHub Pages используем имя репозитория как base path
  base: process.env.NODE_ENV === "production" ? "/sk-rosa/" : "./",
  root: "src",
  build: {
    outDir: "../public_html",
    emptyOutDir: true,
    // Используем esbuild для минификации (быстрее и встроен в Vite)
    minify: "esbuild",
    // Добавляем все HTML страницы
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        "airless-painting": resolve(__dirname, "src/pages/airless-painting.html"),
        calculator: resolve(__dirname, "src/pages/calculator.html"),
        "floor-screed": resolve(__dirname, "src/pages/floor-screed.html"),
        plastering: resolve(__dirname, "src/pages/plastering.html"),
        portfolio: resolve(__dirname, "src/pages/portfolio.html"),
        privacy: resolve(__dirname, "src/pages/privacy.html"),
        terms: resolve(__dirname, "src/pages/terms.html"),
        "turnkey-repair": resolve(__dirname, "src/pages/turnkey-repair.html"),
      },
      // 6.1: Настройка code splitting для оптимизации сборки
      output: {
        manualChunks: id => {
          // Выделяем vendor код (node_modules) в отдельный chunk
          if (id.includes("node_modules")) {
            return "vendor";
          }
          // Выделяем общие модули в отдельный chunk
          if (id.includes("/scripts/core/") || id.includes("/scripts/modules/")) {
            return "core";
          }
          // Выделяем features в отдельные chunks для лучшего code splitting
          if (id.includes("/scripts/features/calculator/")) {
            return "feature-calculator";
          }
          if (id.includes("/scripts/features/portfolio/")) {
            return "feature-portfolio";
          }
          if (id.includes("/scripts/features/faq/")) {
            return "feature-faq";
          }
          if (id.includes("/scripts/features/contact/")) {
            return "feature-contact";
          }
        },
        // Настройка имен файлов для лучшего кеширования
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: assetInfo => {
          // Разделяем файлы по типам
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "assets/css/[name]-[hash][extname]";
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name || "")) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || "")) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name || "")) {
            return "assets/videos/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  plugins: [
    fixHtmlPaths(),
    viteStaticCopy({
      targets: [
        // Копируем PHP файлы
        {
          src: "scripts/api/*.php",
          dest: "scripts/api",
        },
        // Копируем JS файлы, которые подключены через <script src> в HTML
        // Эти файлы не являются ES модулями и должны быть доступны как статические
        {
          src: "scripts/core/constants.js",
          dest: "scripts/core",
        },
        {
          src: "scripts/core/carousel.js",
          dest: "scripts/core",
        },
        {
          src: "scripts/features/contact/init-contacts.js",
          dest: "scripts/features/contact",
        },
        // Копируем .nojekyll для GitHub Pages
        {
          src: ".nojekyll",
          dest: ".",
        },
        // УДАЛЕНО: Копирование assets - Vite обрабатывает их автоматически
        // при сборке, копирование всей папки приводит к дублированию
        // и увеличению размера (включая неиспользуемые файлы)
      ],
    }),
  ],
  server: {
    port: 3000,
    open: "/index.html",
    // Настройка для работы с PHP (если нужен прокси)
    // proxy: {
    //   '/scripts/api': {
    //     target: 'http://localhost',
    //     changeOrigin: true,
    //   },
    // },
  },
  // 6.2: Настройка preview режима для корректной работы с base: './'
  preview: {
    port: 4173,
    open: "/index.html",
    // Настройка для корректной работы с относительными путями
    cors: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Путь для импорта SCSS файлов (как в старых командах: --load-path=src/styles)
        // SASS будет искать файлы в этой директории при использовании @use
        loadPaths: [resolve(__dirname, "src/styles")],
        // Дополнительные опции для совместимости
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
  // Настройка путей для импортов (алиасы)
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@scripts": resolve(__dirname, "src/scripts"),
      "@core": resolve(__dirname, "src/scripts/core"),
      "@modules": resolve(__dirname, "src/scripts/modules"),
      "@features": resolve(__dirname, "src/scripts/features"),
      "@utils": resolve(__dirname, "src/scripts/utils"),
      "@styles": resolve(__dirname, "src/styles"),
      "@assets": resolve(__dirname, "src/assets"),
    },
  },
  // 4.2: Настройка обработки статических ресурсов
  assetsInclude: [
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.gif",
    "**/*.svg",
    "**/*.webp",
    "**/*.ico",
    "**/*.woff",
    "**/*.woff2",
    "**/*.ttf",
    "**/*.eot",
    "**/*.mp4",
    "**/*.webm",
  ],
});
