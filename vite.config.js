import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve, join } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, rmdirSync, mkdirSync } from "fs";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Поиск HTML файлов
function findHtmlFiles(dir, baseDir = dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      findHtmlFiles(filePath, baseDir, fileList);
    } else if (file.endsWith(".html")) {
      const relativePath = filePath
        .replace(baseDir, "")
        .replace(/^[\/\\]+/, "")
        .replace(/\\+/g, "/");
      fileList.push({ path: filePath, relative: relativePath });
    }
  });
  return fileList;
}

// Статьи блога (физически в articles/, но URL будет /blog/*)
function getBlogArticles() {
  const articlesDir = resolve(__dirname, "src/pages/articles");
  const articles = {};
  try {
    if (statSync(articlesDir, { throwIfNoEntry: false })) {
      const htmlFiles = findHtmlFiles(articlesDir, articlesDir);
      htmlFiles.forEach(({ path, relative }) => {
        const name = relative.replace(".html", "").replace(/\//g, "-");
        // Ключ blog/* для URL /blog/*, но файлы из articles/
        articles[`blog/${name}`] = path;
      });
    }
  } catch (e) {}
  return articles;
}

// Плагин перемещения файлов
const fixHtmlPaths = () => {
  return {
    name: "fix-html-paths",
    closeBundle() {
      const outDir = resolve(__dirname, "public_html");

      // Собираем HTML файлы из разных директорий
      const htmlFiles = [];
      function collectHtmlFiles(dir, relativePath = "") {
        try {
          const files = readdirSync(dir);
          files.forEach(file => {
            const filePath = join(dir, file);
            const stat = statSync(filePath);
            if (stat.isDirectory()) {
              collectHtmlFiles(filePath, join(relativePath, file));
            } else if (file.endsWith(".html")) {
              htmlFiles.push({ path: filePath, relative: join(relativePath, file) });
            }
          });
        } catch (e) {}
      }

      // Собираем из pages/ (если есть)
      const pagesDir = join(outDir, "pages");
      if (statSync(pagesDir, { throwIfNoEntry: false })) {
        collectHtmlFiles(pagesDir, "pages");
      }

      // Собираем из blog/ (если есть - после перемещения)
      const blogDir = join(outDir, "blog");
      if (statSync(blogDir, { throwIfNoEntry: false })) {
        collectHtmlFiles(blogDir, "blog");
      }

      // Собираем из articles/ (если есть - исходные файлы могут быть там)
      const articlesDir = join(outDir, "articles");
      if (statSync(articlesDir, { throwIfNoEntry: false })) {
        collectHtmlFiles(articlesDir, "articles");
      }

      // Собираем HTML файлы из корня outDir
      try {
        const rootFiles = readdirSync(outDir);
        rootFiles.forEach(file => {
          if (file.endsWith(".html")) {
            const filePath = join(outDir, file);
            const stat = statSync(filePath);
            if (stat.isFile()) {
              htmlFiles.push({ path: filePath, relative: file });
            }
          }
        });
      } catch (e) {}

      // CSS файл
      let cssFileName = "./assets/css/main.css";
      try {
        const cssDir = join(outDir, "assets/css");
        if (statSync(cssDir, { throwIfNoEntry: false })) {
          const cssFiles = readdirSync(cssDir).filter(f => f.startsWith("main-") && f.endsWith(".css"));
          if (cssFiles.length > 0) cssFileName = `./assets/css/${cssFiles[0]}`;
        }
      } catch (e) {}

      // Обработка файлов
      htmlFiles.forEach(({ path: sourceFile, relative }) => {
        try {
          let content = readFileSync(sourceFile, "utf-8");

          // Определяем целевой файл и глубину вложенности
          let targetFile;
          let depth = 0;

          // ПРАВИЛА РАСПОЛОЖЕНИЯ
          if (relative === "pages/blog.html") {
            // blog.html из pages/ перемещаем в корень
            targetFile = join(outDir, "blog.html");
            depth = 0;
          } else if (relative.startsWith("pages/articles/")) {
            // Статьи из pages/articles/ перемещаем в articles/ (физически)
            const articlesDir = join(outDir, "articles");
            mkdirSync(articlesDir, { recursive: true });
            const fileName = relative.replace("pages/articles/", "");
            targetFile = join(articlesDir, fileName);
            depth = 1;
          } else if (relative.startsWith("articles/")) {
            // Статьи из articles/ остаются в articles/
            targetFile = sourceFile;
            depth = 1;
          } else if (relative === "blog.html") {
            // blog.html остается в корне
            targetFile = sourceFile;
            depth = 0;
          } else if (relative.startsWith("pages/")) {
            // Страницы из pages/ перемещаем в корень
            const fileName = relative.replace("pages/", "");
            targetFile = join(outDir, fileName);
            depth = fileName.split("/").length - 1;
          } else {
            targetFile = sourceFile;
            depth = relative.split("/").length - 1;
          }

          const pathPrefix = depth > 0 ? "../".repeat(depth) : "./";

          // ЗАМЕНЫ ПУТЕЙ
          // Сначала заменяем полные пути к стилям (../../styles/main.scss и ../styles/main.scss)
          content = content.replace(/\.\.\/\.\.\/styles\/main\.scss/g, cssFileName);
          content = content.replace(/\.\.\/styles\/main\.scss/g, cssFileName);
          // Потом общие замены путей
          content = content.replace(/\.\.\/\.\.\//g, "../"); // ../../ → ../ (для файлов из blog/)
          content = content.replace(/..\/\.\//g, "./");


          // href=./path/file.ext" → href="./path/file.ext"
          content = content.replace(/((?:href|src))=(\.[^"]*")/g, '$1="$2');

          if (depth > 0) {
            content = content.replace(/\.\.\/scripts\//g, `${pathPrefix}scripts/`);
            content = content.replace(/\.\.\/assets\//g, `${pathPrefix}assets/`);
          } else {
            content = content.replace(/\.\.\/scripts\//g, "./scripts/");
            content = content.replace(/\.\.\/assets\//g, "./assets/");
          }

          // СПЕЦИФИЧНЫЕ ЗАМЕНЫ ДЛЯ БЛОГА
          if (relative === "pages/blog.html" || relative === "blog.html") {
            // Ссылка на сам блог: href="blog.html" → href="/blog"
            content = content.replace(/href=["']blog\.html["']/g, 'href="/blog"');
            // Ссылки на статьи: href="articles/article.html" → href="/blog/article"
            content = content.replace(/href=["']articles\/([^"']+)\.html["']/g, 'href="/blog/$1"');
            // Ссылки на статьи (legacy): href="blog/article.html" → href="/blog/article"
            content = content.replace(/href=["']pages\/blog\/([^"']+)\.html["']/g, 'href="/blog/$1"');
            content = content.replace(/href=["']blog\/([^"']+)\.html["']/g, 'href="/blog/$1"');
          }

          // СПЕЦИФИЧНЫЕ ЗАМЕНЫ ДЛЯ СТАТЕЙ БЛОГА
          const isArticle = relative.startsWith("blog/") ||
                           relative.startsWith("pages/blog/") ||
                           relative.startsWith("pages/articles/") ||
                           relative.startsWith("articles/");
          const isNotBlogHtml = relative !== "blog.html" && relative !== "pages/blog.html";

          if (isArticle && isNotBlogHtml) {
            // Ссылка на главную блога: href="blog.html" или href="../blog.html" → href="/blog"
            content = content.replace(/href=["']blog\.html["']/g, 'href="/blog"');
            content = content.replace(/href=["']\.\.\/blog\.html["']/g, 'href="/blog"');
            // Ссылки на другие страницы: href="../page.html" → href="/page"
            content = content.replace(/href=["']\.\.\/([^"']+)\.html["']/g, 'href="/$1"');
          }

          // Сохраняем файл
          writeFileSync(targetFile, content, "utf-8");

          // Удаляем исходный файл, если он был перемещен
          if (targetFile !== sourceFile) {
            unlinkSync(sourceFile);
          }
        } catch (e) {
          console.error("Error processing", relative, e);
        }
      });

      // Очистка пустых директорий (рекурсивно)
      try {
        function removeEmptyDirs(dir) {
          try {
            if (!statSync(dir, { throwIfNoEntry: false })) return false;

            const files = readdirSync(dir);

            // Рекурсивно проверяем вложенные директории
            files.forEach(file => {
              const filePath = join(dir, file);
              if (statSync(filePath).isDirectory()) {
                removeEmptyDirs(filePath);
              }
            });

            // Проверяем, пуста ли директория после рекурсивной очистки
            if (readdirSync(dir).length === 0) {
              rmdirSync(dir);
              return true;
            }
          } catch (e) {}
          return false;
        }

        if (statSync(pagesDir, { throwIfNoEntry: false })) {
          removeEmptyDirs(pagesDir);
        }
      } catch (e) {}

      // Обработка index.html
      try {
        const indexFile = join(outDir, "index.html");
        if (statSync(indexFile, { throwIfNoEntry: false })) {
          let content = readFileSync(indexFile, "utf-8");
          // Ссылки на блог: href="blog.html" → href="/blog"
          content = content.replace(/href="blog\.html"/g, 'href="/blog"');
          // Ссылки на статьи блога: href="pages/blog/article.html" → href="/blog/article"
          content = content.replace(/href="pages\/blog\/([^"']+)\.html"/g, 'href="/blog/$1"');
          // Ссылки на другие страницы: href="pages/page.html" → href="/page"
          content = content.replace(/href="pages\/([^"']+)\.html"/g, 'href="/$1"');
          writeFileSync(indexFile, content, "utf-8");
        }
      } catch (e) {}
    }
  };
};

export default defineConfig({
  base: process.env.BASE_PATH || (process.env.NODE_ENV === "production" ? "/sk-rosa/" : "./"),
  root: "src",
  build: {
    outDir: "../public_html",
    emptyOutDir: true,
    minify: "esbuild",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        404: resolve(__dirname, "src/404.html"),
        "airless-painting": resolve(__dirname, "src/pages/airless-painting.html"),
        calculator: resolve(__dirname, "src/pages/calculator.html"),
        "floor-screed": resolve(__dirname, "src/pages/floor-screed.html"),
        plastering: resolve(__dirname, "src/pages/plastering.html"),
        portfolio: resolve(__dirname, "src/pages/portfolio.html"),
        blog: resolve(__dirname, "src/pages/blog.html"),  // → public_html/blog.html
        privacy: resolve(__dirname, "src/pages/privacy.html"),
        terms: resolve(__dirname, "src/pages/terms.html"),
        "turnkey-repair": resolve(__dirname, "src/pages/turnkey-repair.html"),
        ...getBlogArticles()
      },
      output: {
        manualChunks: id => {
          if (id.includes("node_modules")) return "vendor";
          if (id.includes("scripts/core")) return "core";
          if (id.includes("scripts/features")) return "features";
          return null;
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: assetInfo => {
          const name = assetInfo.name || "";
          if (name.endsWith(".css")) return "assets/css/[name]-[hash][extname]";
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) return "assets/images/[name]-[hash][extname]";
          if (/\.(woff2?|eot|ttf|otf)$/.test(name)) return "assets/fonts/[name]-[hash][extname]";
          return "assets/[name]-[hash][extname]";
        }
      }
    }
  },
  plugins: [
    fixHtmlPaths(),
    viteStaticCopy({
      targets: [
        { src: "scripts/api/*.php", dest: "scripts/api" },
        { src: "scripts/core/constants.js", dest: "scripts/core" },
        { src: "scripts/core/carousel.js", dest: "scripts/core" },
        { src: "scripts/features/contact/init-contacts.js", dest: "scripts/features/contact" },
        { src: "assets/icons/**/*", dest: "assets/icons" },
        { src: "assets/images/icons/flaticon/**/*", dest: "assets/images/icons/flaticon" },
        { src: "assets/images/common/turnkey-og-image.webp", dest: "assets/images/common" },
        { src: "scripts/features/faq/faq.js", dest: "scripts/features/faq" },
        { src: "scripts/features/portfolio/portfolio-filter.js", dest: "scripts/features/portfolio" },
        { src: "scripts/features/portfolio/portfolio-turnkey.js", dest: "scripts/features/portfolio" },
        { src: "scripts/features/calculator/calculator.js", dest: "scripts/features/calculator" },
        { src: "scripts/features/calculator/price-calc.js", dest: "scripts/features/calculator" },
        { src: "scripts/features/contact/contact-request.js", dest: "scripts/features/contact" },
        { src: "scripts/features/contact/success-modal.js", dest: "scripts/features/contact" },
        { src: "scripts/features/contact/form-handler.js", dest: "scripts/features/contact" },
        { src: "scripts/features/contact/form-utils.js", dest: "scripts/features/contact" },
        { src: "scripts/features/blog/blog-filter.js", dest: "scripts/features/blog" },
        { src: "scripts/features/blog/blog-search.js", dest: "scripts/features/blog" },
        { src: "scripts/features/blog/blog-copy-link.js", dest: "scripts/features/blog" },
        { src: ".nojekyll", dest: "." },
        { src: ".htaccess", dest: "." },
        { src: "yandex_*.html", dest: "." },
        { src: "robots.txt", dest: "." },
        { src: "sitemap.xml", dest: "." }
      ]
    }),
    visualizer({
      open: true,
      filename: "public_html/stats.html",
      gzipSize: true,
      brotliSize: true
    })
  ],
  server: { port: 3000, open: "/index.html" },
  preview: { port: 4173, open: "/index.html", cors: true },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [resolve(__dirname, "src/styles")],
        silenceDeprecations: ["legacy-js-api"]
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@scripts": resolve(__dirname, "src/scripts"),
      "@core": resolve(__dirname, "src/scripts/core"),
      "@modules": resolve(__dirname, "src/scripts/modules"),
      "@features": resolve(__dirname, "src/scripts/features"),
      "@utils": resolve(__dirname, "src/scripts/utils"),
      "@styles": resolve(__dirname, "src/styles"),
      "@assets": resolve(__dirname, "src/assets")
    }
  },
  assetsInclude: [
    "**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", 
    "**/*.svg", "**/*.webp", "**/*.ico", "**/*.woff", 
    "**/*.woff2", "**/*.ttf", "**/*.eot", "**/*.mp4", "**/*.webm"
  ]
});
