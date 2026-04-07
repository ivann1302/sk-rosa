#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "public_html");

const footerHtml = readFileSync(resolve(ROOT, "src/templates/footer.html"), "utf-8");
const headerHtml = readFileSync(resolve(ROOT, "src/templates/header.html"), "utf-8");

function collectHtmlFiles(dir) {
  const files = [];
  for (const file of readdirSync(dir)) {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      files.push(...collectHtmlFiles(filePath));
    } else if (file.endsWith(".html")) {
      files.push(filePath);
    }
  }
  return files;
}

const htmlFiles = collectHtmlFiles(OUT_DIR);
let injected = 0;
let warnedFooter = 0;
let warnedHeader = 0;

for (const filePath of htmlFiles) {
  const rel = filePath.replace(OUT_DIR + "/", "");
  let content = readFileSync(filePath, "utf-8");
  let changed = false;

  if (content.includes("<!-- HEADER -->")) {
    content = content.replace("<!-- HEADER -->", headerHtml);
    changed = true;
  } else {
    console.warn(`WARN: нет <!-- HEADER --> в ${rel}`);
    warnedHeader++;
  }

  if (content.includes("<!-- FOOTER -->")) {
    content = content.replace("<!-- FOOTER -->", footerHtml);
    changed = true;
  } else {
    console.warn(`WARN: нет <!-- FOOTER --> в ${rel}`);
    warnedFooter++;
  }

  if (changed) {
    writeFileSync(filePath, content, "utf-8");
    injected++;
  }
}

console.log(
  `Partials injected: ${injected}/${htmlFiles.length} файлов. Предупреждений: header=${warnedHeader}, footer=${warnedFooter}.`
);
