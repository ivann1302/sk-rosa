#!/usr/bin/env node
/**
 * Одноразовый скрипт миграции хедера.
 * Заменяет <header class="header" data-js-header>...</header>
 * на <!-- HEADER --> во всех исходных HTML-файлах.
 *
 * Запуск: node scripts/migrate-header.js
 * После выполнения скрипт можно удалить.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PLACEHOLDER = "<!-- HEADER -->";

/**
 * Заменяет блок <header ...>...</header> на placeholder.
 * Ищет открывающий тег и находит закрывающий </header> с учётом вложенности.
 */
function replaceHeaderBlock(content, filePath) {
  const openTag = '<header class="header" data-js-header>';
  const startIdx = content.indexOf(openTag);

  if (startIdx === -1) {
    // Уже заменён или хедера нет
    if (content.includes(PLACEHOLDER)) {
      return { content, status: "already" };
    }
    return { content, status: "missing" };
  }

  // Ищем закрывающий </header> с учётом вложенности
  let depth = 0;
  let i = startIdx;
  while (i < content.length) {
    if (content.startsWith("<header", i) && (content[i + 7] === " " || content[i + 7] === ">")) {
      depth++;
      i += 7;
    } else if (content.startsWith("</header>", i)) {
      depth--;
      if (depth === 0) {
        const endIdx = i + "</header>".length;
        const updated = content.slice(0, startIdx) + PLACEHOLDER + content.slice(endIdx);
        return { content: updated, status: "replaced" };
      }
      i += 9;
    } else {
      i++;
    }
  }

  console.error(`ERROR: не найден закрывающий </header> в ${filePath}`);
  return { content, status: "error" };
}

// Список файлов для миграции
const filesToMigrate = [
  // Главная страница
  resolve(ROOT, "src/index.html"),

  // Шаблоны генератора городских страниц
  resolve(ROOT, "src/pages/plastering/balashikha.html"),
  resolve(ROOT, "src/pages/turnkey-repair/balashikha.html"),
  resolve(ROOT, "src/pages/floor-screed/balashikha.html"),
  resolve(ROOT, "src/pages/airless-painting/balashikha.html"),
];

// Добавляем все .html из src/pages/ (верхний уровень, не подпапки)
const pagesDir = resolve(ROOT, "src/pages");
for (const file of readdirSync(pagesDir)) {
  const filePath = join(pagesDir, file);
  if (statSync(filePath).isFile() && file.endsWith(".html")) {
    filesToMigrate.push(filePath);
  }
}

let replaced = 0;
let already = 0;
let missing = 0;
let errors = 0;

for (const filePath of filesToMigrate) {
  let content;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    console.warn(`WARN: файл не найден: ${filePath}`);
    missing++;
    continue;
  }

  const { content: updated, status } = replaceHeaderBlock(content, filePath);
  const rel = filePath.replace(ROOT + "/", "");

  if (status === "replaced") {
    writeFileSync(filePath, updated, "utf-8");
    console.log(`✓ ${rel}`);
    replaced++;
  } else if (status === "already") {
    console.log(`– уже заменён: ${rel}`);
    already++;
  } else if (status === "missing") {
    console.warn(`WARN: нет хедера в ${rel}`);
    missing++;
  } else {
    errors++;
  }
}

console.log(
  `\nГотово: заменено ${replaced}, уже были ${already}, не найден ${missing}, ошибок ${errors}.`
);
