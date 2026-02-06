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

// Городские страницы (172+) теперь генерируются отдельным скриптом:
// npm run generate:build
// Это решает проблему OOM при сборке через Vite

// Плагин перемещения файлов (упрощённый — без городских страниц)
const fixHtmlPaths = () => {
  return {
    name: "fix-html-paths",
    closeBundle() {
      const outDir = resolve(__dirname, "public_html");

      // Собираем HTML файлы
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

      // Собираем из pages/ и articles/
      const pagesDir = join(outDir, "pages");
      if (statSync(pagesDir, { throwIfNoEntry: false })) {
        collectHtmlFiles(pagesDir, "pages");
      }

      const articlesDir = join(outDir, "articles");
      if (statSync(articlesDir, { throwIfNoEntry: false })) {
        collectHtmlFiles(articlesDir, "articles");
      }

      // Собираем HTML файлы из корня
      try {
        const rootFiles = readdirSync(outDir);
        rootFiles.forEach(file => {
          if (file.endsWith(".html")) {
            const filePath = join(outDir, file);
            if (statSync(filePath).isFile()) {
              htmlFiles.push({ path: filePath, relative: file });
            }
          }
        });
      } catch (e) {}

      // Находим CSS файл
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
          let targetFile;
          let depth = 0;

          // Правила перемещения
          if (relative === "pages/blog.html") {
            targetFile = join(outDir, "blog.html");
            depth = 0;
          } else if (relative.startsWith("pages/articles/")) {
            mkdirSync(join(outDir, "articles"), { recursive: true });
            targetFile = join(outDir, "articles", relative.replace("pages/articles/", ""));
            depth = 1;
          } else if (relative.startsWith("articles/")) {
            targetFile = sourceFile;
            depth = 1;
          } else if (relative.startsWith("pages/")) {
            targetFile = join(outDir, relative.replace("pages/", ""));
            depth = 0;
          } else {
            targetFile = sourceFile;
            depth = relative.split("/").length - 1;
          }

          const pathPrefix = depth > 0 ? "../".repeat(depth) : "./";
          const cssPath = depth > 0 ? `${pathPrefix}${cssFileName.replace('./', '')}` : cssFileName;

          // Замены путей
          content = content.replace(/\.\.\/\.\.\/\.\.\/styles\/main\.scss/g, cssPath);
          content = content.replace(/\.\.\/\.\.\/styles\/main\.scss/g, cssPath);
          content = content.replace(/\.\.\/styles\/main\.scss/g, cssPath);
          content = content.replace(/\.\.\/\.\.\//g, "../");
          content = content.replace(/\.\.\/scripts\//g, "/scripts/");
          content = content.replace(/\.\/scripts\//g, "/scripts/");

          if (depth > 0) {
            content = content.replace(/\.\.\/assets\//g, `${pathPrefix}assets/`);
          } else {
            content = content.replace(/\.\.\/assets\//g, "./assets/");
          }

          // Для хостинга: абсолютные пути
          if (depth === 0 && process.env.BASE_PATH === './') {
            content = content.replace(/href="\.\/assets\//g, 'href="/assets/');
            content = content.replace(/src="\.\/assets\//g, 'src="/assets/');
          }

          // Замены для блога
          if (relative === "pages/blog.html" || relative === "blog.html") {
            content = content.replace(/href=["']blog\.html["']/g, 'href="/blog"');
            content = content.replace(/href=["']articles\/([^"']+)\.html["']/g, 'href="/blog/$1"');
          }

          // Замены для статей
          const isArticle = relative.startsWith("pages/articles/") || relative.startsWith("articles/");
          if (isArticle) {
            content = content.replace(/href=["']blog\.html["']/g, 'href="/blog"');
            content = content.replace(/href=["']\.\.\/blog\.html["']/g, 'href="/blog"');
            content = content.replace(/href=["']\.\.\/([^"']+)\.html["']/g, 'href="/$1"');
          }

          writeFileSync(targetFile, content, "utf-8");

          if (targetFile !== sourceFile) {
            unlinkSync(sourceFile);
          }
        } catch (e) {
          console.error("Error processing", relative, e);
        }
      });

      // Очистка пустых директорий
      try {
        function removeEmptyDirs(dir) {
          if (!statSync(dir, { throwIfNoEntry: false })) {
            return;
          }
          const files = readdirSync(dir);
          files.forEach(file => {
            const filePath = join(dir, file);
            if (statSync(filePath).isDirectory()) {
              removeEmptyDirs(filePath);
            }
          });
          if (readdirSync(dir).length === 0) {
            rmdirSync(dir);
          }
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
          content = content.replace(/href="blog\.html"/g, 'href="/blog"');
          content = content.replace(/href="pages\/([^"']+)\.html"/g, 'href="/$1"');
          writeFileSync(indexFile, content, "utf-8");
        }
      } catch (e) {}
    }
  };
};

// Плагин для эмуляции .htaccess в dev и preview режимах
const htaccessMiddleware = () => {
  // Общая функция middleware для dev и preview
  const createMiddleware = (isPreview = false) => (req, res, next) => {
    const originalUrl = req.url;
    const url = req.url.split('?')[0];

    // Пропускаем Vite-специфичные пути и ресурсы
    if (
      url.startsWith('/@') ||           // Vite internal paths
      url.startsWith('/__') ||          // Vite internal paths
      url.startsWith('/node_modules') ||
      url.startsWith('/assets') ||      // Static assets
      url.startsWith('/scripts') ||     // Scripts
      url.startsWith('/pages') ||       // Pages directory
      url.startsWith('/articles') ||    // Articles directory
      url.includes('.')                 // Files with extensions
    ) {
      return next();
    }

    console.log('🔍 [Middleware] Incoming:', originalUrl);

    // Городские страницы: /service/city → /pages/service/city.html
    const cityMatch = url.match(/^\/(turnkey-repair|plastering|airless-painting|floor-screed)\/([^/]+)$/);
    if (cityMatch) {
      req.url = `/pages/${cityMatch[1]}/${cityMatch[2]}.html`;
      console.log('✅ [City Page]', originalUrl, '→', req.url);
      return next();
    }

    // Блог: /blog/article → /articles/article.html (в preview) или /pages/articles/article.html (в dev)
    const blogMatch = url.match(/^\/blog\/([^/]+)$/);
    if (blogMatch) {
      req.url = isPreview ? `/articles/${blogMatch[1]}.html` : `/pages/articles/${blogMatch[1]}.html`;
      console.log('✅ [Blog Article]', originalUrl, '→', req.url);
      return next();
    }

    // /blog → /blog.html (в preview) или /pages/blog.html (в dev)
    if (url === '/blog' || url === '/blog/') {
      req.url = isPreview ? '/blog.html' : '/pages/blog.html';
      console.log('✅ [Blog]', originalUrl, '→', req.url);
      return next();
    }

    // Главная страница
    if (url === '/') {
      req.url = '/index.html';
      console.log('✅ [Home]', originalUrl, '→', req.url);
      return next();
    }

    // Обычные страницы: /page → /page.html (в preview) или /pages/page.html (в dev)
    const cleanUrl = url.replace(/\/$/, '');
    req.url = isPreview ? `${cleanUrl}.html` : `/pages${cleanUrl}.html`;
    console.log('✅ [Regular Page]', originalUrl, '→', req.url);

    next();
  };

  return {
    name: 'htaccess-middleware',
    configureServer(server) {
      server.middlewares.use(createMiddleware(false));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMiddleware(true));
    }
  };
};

export default defineConfig({
  base: process.env.BASE_PATH || "/",
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
        "where-we-work": resolve(__dirname, "src/pages/where-we-work.html"),
        // Городские страницы генерируются отдельно: npm run generate:build
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
    htaccessMiddleware(),
    fixHtmlPaths(),
    viteStaticCopy({
      targets: [
        { src: "scripts/api/*.php", dest: "scripts/api" },
        { src: "scripts/core/constants.js", dest: "scripts/core" },
        { src: "scripts/core/carousel.js", dest: "scripts/core" },
        { src: "scripts/core/main.js", dest: "scripts/core" },
        { src: "scripts/modules/**/*", dest: "scripts/modules" },
        { src: "scripts/features/contact/init-contacts.js", dest: "scripts/features/contact" },
        { src: "scripts/features/contact/lazy-yandex-maps.js", dest: "scripts/features/contact" },
        { src: "scripts/features/contact/form-validation.js", dest: "scripts/features/contact" },
        { src: "assets/icons/**/*", dest: "assets/icons" },
        { src: "assets/images/icons/flaticon/**/*", dest: "assets/images/icons/flaticon" },
        { src: "assets/images/common/**/*", dest: "assets/images/common" },
        { src: "assets/images/turnkey/**/*", dest: "assets/images/turnkey" },
        { src: "assets/images/portfolio/**/*", dest: "assets/images/portfolio" },
        { src: "assets/videos/**/*", dest: "assets/videos" },
        { src: "scripts/features/portfolio/portfolio-filter.js", dest: "scripts/features/portfolio" },
        { src: "scripts/features/portfolio/portfolio-turnkey.js", dest: "scripts/features/portfolio" },
        { src: "scripts/features/portfolio/custom-select.js", dest: "scripts/features/portfolio" },
        { src: "scripts/features/faq/faq.js", dest: "scripts/features/faq" },
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
    // Visualizer disabled (uses significant memory with 180+ HTML pages)
    // Uncomment for bundle analysis on smaller builds or machines with >16GB RAM
    // visualizer({
    //   open: true,
    //   filename: "public_html/stats.html",
    //   gzipSize: true,
    //   brotliSize: true
    // })
  ],
  server: { port: 3000, open: "/" },
  preview: { port: 4173, open: "/", cors: true },
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
