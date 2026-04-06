#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "src");

// ─── 1. Извлечь футер из src/index.html ──────────────────────────────────────
const indexHtml = readFileSync(resolve(SRC, "index.html"), "utf-8");
const OPEN_TAG = '<footer class="footer">';
const CLOSE_TAG = "</footer>";

const startIdx = indexHtml.indexOf(OPEN_TAG);
const endIdx = indexHtml.indexOf(CLOSE_TAG, startIdx) + CLOSE_TAG.length;

if (startIdx === -1) {
  console.error('ERROR: <footer class="footer"> не найден в src/index.html');
  process.exit(1);
}

let footerHtml = indexHtml.slice(startIdx, endIdx);

// ─── 2. Конвертировать пути в абсолютные ─────────────────────────────────────
// Пути к ресурсам
footerHtml = footerHtml.replace(/src="assets\//g, 'src="/assets/');
footerHtml = footerHtml.replace(/href="assets\//g, 'href="/assets/');

// Ссылка логотипа: #top → /#top
footerHtml = footerHtml.replace(/href="#top"/g, 'href="/#top"');

// Внутренние ссылки страниц
const pageLinks = {
  "pages/turnkey-repair.html": "/turnkey-repair",
  "pages/airless-painting.html": "/airless-painting",
  "pages/floor-screed.html": "/floor-screed",
  "pages/plastering.html": "/plastering",
  "pages/soft-roofing.html": "/soft-roofing",
  "pages/portfolio.html": "/portfolio",
  "pages/calculator.html": "/calculator",
  "pages/blog.html": "/blog",
  "pages/where-we-work.html": "/where-we-work",
  "pages/privacy.html": "/privacy",
  "pages/terms.html": "/terms",
};

for (const [from, to] of Object.entries(pageLinks)) {
  footerHtml = footerHtml.replace(
    new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
    to
  );
}

// ─── 3. Сохранить шаблон ─────────────────────────────────────────────────────
const templatesDir = resolve(SRC, "templates");
mkdirSync(templatesDir, { recursive: true });
writeFileSync(resolve(templatesDir, "footer.html"), footerHtml, "utf-8");
console.log("✓ Сохранён шаблон: src/templates/footer.html");

// ─── 4. Найти исходные файлы для миграции ────────────────────────────────────

// Паттерны сгенерированных городских страниц (их НЕ мигрируем)
const GENERATED_PATTERNS = [
  /^plastering-/,
  /^turnkey-repair-/,
  /^floor-screed-/,
  /^airless-painting-/,
  /^soft-roofing-/,
];

// src/pages/*.html (без сгенерированных городских)
const pagesDir = resolve(SRC, "pages");
const pageFiles = readdirSync(pagesDir)
  .filter(f => {
    if (!f.endsWith(".html")) {
      return false;
    }
    return !GENERATED_PATTERNS.some(p => p.test(f));
  })
  .map(f => join(pagesDir, f));

// Шаблоны генератора (balashikha.html в каждой директории сервиса)
const serviceTemplates = [
  "plastering",
  "turnkey-repair",
  "floor-screed",
  "airless-painting",
  "soft-roofing",
]
  .map(slug => join(pagesDir, slug, "balashikha.html"))
  .filter(p => existsSync(p));

const allFiles = [resolve(SRC, "index.html"), ...pageFiles, ...serviceTemplates];

// ─── 5. Заменить футер на placeholder ────────────────────────────────────────
let migrated = 0;
let skipped = 0;

for (const filePath of allFiles) {
  const content = readFileSync(filePath, "utf-8");
  const fStart = content.indexOf(OPEN_TAG);
  const fEnd = content.indexOf(CLOSE_TAG, fStart) + CLOSE_TAG.length;

  if (fStart === -1) {
    console.warn(`  WARN: нет футера в ${filePath.replace(ROOT + "/", "")}`);
    skipped++;
    continue;
  }

  const updated = content.slice(0, fStart) + "    <!-- FOOTER -->" + content.slice(fEnd);
  writeFileSync(filePath, updated, "utf-8");
  console.log(`  ✓ ${filePath.replace(ROOT + "/", "")}`);
  migrated++;
}

console.log(`\nМигрировано: ${migrated}/${allFiles.length}. Пропущено: ${skipped}.`);
console.log("\nПосле проверки удали этот скрипт: scripts/migrate-footer.js");
