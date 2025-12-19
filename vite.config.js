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

      // Находим скомпилированный CSS файл
      const cssDir = join(outDir, "assets/css");
      let cssFileName = "./assets/css/main.css"; // fallback
      try {
        if (statSync(cssDir, { throwIfNoEntry: false })) {
          const cssFiles = readdirSync(cssDir).filter(
            file => file.startsWith("main-") && file.endsWith(".css")
          );
          if (cssFiles.length > 0) {
            cssFileName = `./assets/css/${cssFiles[0]}`;
          }
        }
      } catch (e) {
        console.warn("Could not find CSS directory, using fallback:", e.message);
      }

      // Создаем маппинг файлов: оригинальное имя -> имя с хешем
      const imagesDir = join(outDir, "assets/images");
      const imageMap = new Map();
      try {
        if (statSync(imagesDir, { throwIfNoEntry: false })) {
          const imageFiles = readdirSync(imagesDir);
          console.log(`📁 Found ${imageFiles.length} image files in ${imagesDir}`);
          imageFiles.forEach(file => {
            // Извлекаем оригинальное имя (до хеша)
            // Формат: filename-hash.ext
            const match = file.match(/^(.+?)-([A-Za-z0-9]{8,})\.(png|jpg|jpeg|gif|svg|webp|ico)$/);
            if (match) {
              const [, baseName, , ext] = match;
              const originalName = `${baseName}.${ext}`;
              imageMap.set(originalName, file);
              // Также добавляем варианты с путями
              imageMap.set(`common/${originalName}`, file);
              imageMap.set(`portfolio/${originalName}`, file);
              imageMap.set(`turnkey/${originalName}`, file);
            } else {
              // Если файл без хеша, добавляем его как есть
              imageMap.set(file, file);
              imageMap.set(`common/${file}`, file);
              imageMap.set(`portfolio/${file}`, file);
              imageMap.set(`turnkey/${file}`, file);
            }
          });
          // Выводим информацию о маппинге для отладки
          console.log(`📋 Image map created with ${imageMap.size} entries`);
          if (imageMap.has("common/whatsapp_icon.png")) {
            console.log(
              `✓ WhatsApp icon mapped: common/whatsapp_icon.png -> ${imageMap.get("common/whatsapp_icon.png")}`
            );
          } else {
            console.warn("⚠ WhatsApp icon not found in image map");
            console.warn(
              `Available common/* keys: ${Array.from(imageMap.keys())
                .filter(k => k.startsWith("common/"))
                .slice(0, 5)
                .join(", ")}`
            );
          }
        } else {
          console.warn(`⚠ Images directory does not exist: ${imagesDir}`);
        }
      } catch (e) {
        console.warn("Could not read images directory:", e.message);
      }

      console.log(`📄 Processing ${htmlFiles.length} HTML files from ${pagesDir}`);
      htmlFiles.forEach(file => {
        const sourceFile = join(pagesDir, file);
        const targetFile = join(outDir, file);

        // Читаем содержимое файла
        let content = readFileSync(sourceFile, "utf-8");
        const originalContent = content;

        // Заменяем ../styles/main.scss на путь к скомпилированному CSS
        content = content.replace(/\.\.\/styles\/main\.scss/g, cssFileName);
        // Исправляем неправильный путь .././ на ./
        content = content.replace(/\.\.\/\.\//g, "./");
        // Заменяем ../scripts/ на ./scripts/
        content = content.replace(/\.\.\/scripts\//g, "./scripts/");
        // Заменяем ../assets/ на ./assets/
        content = content.replace(/\.\.\/assets\//g, "./assets/");
        // Заменяем ../index.html на index.html
        content = content.replace(/\.\.\/index\.html/g, "index.html");

        // Заменяем пути к изображениям с учетом хешей
        // Обрабатываем все варианты: ./assets/images/common/..., assets/images/common/..., "assets/images/common/..."
        // Паттерн: ./assets/images/common/123.png -> ./assets/images/123-CjT05Y4O.png
        // Сначала обрабатываем пути в атрибутах src и href
        let replacementCount = 0;
        content = content.replace(
          /(src|href)=(["'])(\.\/)?assets\/images\/(common|portfolio|turnkey)\/([^"'\s>]+\.(png|jpg|jpeg|gif|svg|webp|ico))\2/g,
          (match, attr, quote, dot, folder, filename) => {
            // Для common - ищем в маппинге (файлы обрабатываются Vite и получают хеши)
            if (folder === "common") {
              let mappedFile = imageMap.get(`${folder}/${filename}`);
              if (!mappedFile) {
                mappedFile = imageMap.get(filename);
              }
              if (mappedFile) {
                replacementCount++;
                return `${attr}=${quote}./assets/images/${mappedFile}${quote}`;
              }
              // Если не найдено, выводим предупреждение
              console.warn(
                `[${file}] Image not found in map: ${folder}/${filename}, available keys: ${Array.from(
                  imageMap.keys()
                )
                  .filter(k => k.includes(filename.split(".")[0]))
                  .slice(0, 5)
                  .join(", ")}`
              );
              // Если не найдено, оставляем путь но добавляем ./
              return `${attr}=${quote}./assets/images/${folder}/${filename}${quote}`;
            }
            // Для portfolio и turnkey - добавляем ./ если его нет
            return `${attr}=${quote}./assets/images/${folder}/${filename}${quote}`;
          }
        );

        if (replacementCount > 0) {
          console.log(`  ✓ Replaced ${replacementCount} image paths in ${file}`);
        }

        // Также обрабатываем пути без атрибутов (на случай, если они используются в других контекстах)
        content = content.replace(
          /(["'])(\.\/)?assets\/images\/(common|portfolio|turnkey)\/([^"'\s>]+\.(png|jpg|jpeg|gif|svg|webp|ico))\1/g,
          (match, quote, dot, folder, filename) => {
            // Для common - ищем в маппинге
            if (folder === "common") {
              let mappedFile = imageMap.get(`${folder}/${filename}`);
              if (!mappedFile) {
                mappedFile = imageMap.get(filename);
              }
              if (mappedFile) {
                return `${quote}./assets/images/${mappedFile}${quote}`;
              }
              return `${quote}./assets/images/${folder}/${filename}${quote}`;
            }
            return `${quote}./assets/images/${folder}/${filename}${quote}`;
          }
        );

        // Исправляем пути к assets без ./ в начале (но не внешние ссылки)
        content = content.replace(
          /(href|src)=["'](?!https?:\/\/|\.\/|#|mailto:|tel:)(assets\/)/g,
          '$1="./$2'
        );
        // Исправляем пути к scripts без ./ в начале
        content = content.replace(
          /(href|src)=["'](?!https?:\/\/|\.\/|#|mailto:|tel:)(scripts\/)/g,
          '$1="./$2'
        );

        // Записываем исправленный файл в корень
        writeFileSync(targetFile, content, "utf-8");

        // Проверяем, были ли заменены пути к изображениям
        const imageReplacements = (originalContent.match(/assets\/images\/common\//g) || []).length;
        const remainingCommonPaths = (content.match(/assets\/images\/common\//g) || []).length;
        if (imageReplacements > 0 && remainingCommonPaths > 0) {
          console.warn(
            `⚠ ${file}: ${remainingCommonPaths} paths to common/ images were not replaced (out of ${imageReplacements} total)`
          );
        } else if (imageReplacements > 0) {
          console.log(`✓ ${file}: All ${imageReplacements} paths to common/ images were replaced`);
        }

        // Удаляем исходный файл из папки pages
        unlinkSync(sourceFile);
      });

      // Удаляем пустую папку pages
      try {
        rmdirSync(pagesDir);
      } catch (e) {
        // Игнорируем ошибку, если папка не пуста
      }

      // Обрабатываем index.html - заменяем pages/ на пустую строку в ссылках на HTML файлы
      const indexFile = join(outDir, "index.html");
      if (statSync(indexFile, { throwIfNoEntry: false })) {
        let indexContent = readFileSync(indexFile, "utf-8");
        // Заменяем pages/ на пустую строку в ссылках на HTML файлы
        // Паттерн: href="pages/turnkey-repair.html" -> href="./turnkey-repair.html"
        indexContent = indexContent.replace(/href=["']pages\/([^"']+\.html)/g, 'href="./$1');
        writeFileSync(indexFile, indexContent, "utf-8");
        console.log("✓ Processed index.html: replaced pages/ paths");
      }
    },
  };
};

export default defineConfig({
  // 5.1: Настройка base URL для корректных путей в production
  // BASE_PATH можно задать через переменную окружения:
  // - Для хостинга (корень домена): BASE_PATH=./ npm run build:hosting
  // - Для GitHub Pages: BASE_PATH=/sk-rosa/ npm run build:github
  // По умолчанию: для production используется /sk-rosa/ (GitHub Pages), для dev - ./
  base: process.env.BASE_PATH || (process.env.NODE_ENV === "production" ? "/sk-rosa/" : "./"),
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
        // Копируем тестовые PHP файлы для диагностики на хостинге
        {
          src: "test-*.php",
          dest: ".",
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
        // Копируем иконки с сохранением структуры (важно!)
        {
          src: "assets/icons/**/*",
          dest: "assets/icons",
        },
        // Копируем скрипты features (они подключены через <script src>)
        {
          src: "scripts/features/faq/faq.js",
          dest: "scripts/features/faq",
        },
        {
          src: "scripts/features/portfolio/portfolio-filter.js",
          dest: "scripts/features/portfolio",
        },
        {
          src: "scripts/features/portfolio/portfolio-turnkey.js",
          dest: "scripts/features/portfolio",
        },
        {
          src: "scripts/features/calculator/calculator.js",
          dest: "scripts/features/calculator",
        },
        {
          src: "scripts/features/calculator/price-calc.js",
          dest: "scripts/features/calculator",
        },
        {
          src: "scripts/features/contact/contact-request.js",
          dest: "scripts/features/contact",
        },
        // Копируем видео файлы
        {
          src: "assets/videos/**/*",
          dest: "assets/videos",
        },
        // Копируем изображения из portfolio и turnkey (они не обрабатываются Vite)
        {
          src: "assets/images/portfolio/**/*",
          dest: "assets/images/portfolio",
        },
        {
          src: "assets/images/turnkey/**/*",
          dest: "assets/images/turnkey",
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
