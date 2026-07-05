import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "public_html_astro");
const sitemapPath = path.join(outputDir, "sitemap.xml");

function fail(message, details = []) {
  console.error(message);

  if (details.length > 0) {
    console.error(details.map(item => `  - ${item}`).join("\n"));
  }

  process.exit(1);
}

function outputFileFor(loc) {
  const pathname = new URL(loc).pathname;

  if (pathname === "/") {
    return "index.html";
  }

  return `${pathname.replace(/^\/+/, "")}.html`;
}

function isForbiddenPath(pathname) {
  return (
    /^\/(?:404|assets|_astro|scripts|api|pages|articles)(?:\/|$)/.test(pathname) ||
    /^\/(?:router\.php|robots\.txt|sitemap\.xml|llms\.txt|bde[^/]*\.txt|yandex_[^/]+\.html)$/.test(
      pathname,
    ) ||
    /^\/blog\/[^/]+/.test(pathname)
  );
}

function validateLoc(loc) {
  let url;

  try {
    url = new URL(loc);
  } catch {
    return "invalid URL";
  }

  if (url.protocol !== "https:") {
    return "must use https";
  }

  if (url.hostname !== "sk-rosa.ru") {
    return "must use sk-rosa.ru without www";
  }

  if (url.search || url.hash) {
    return "must not include query string or hash";
  }

  if (url.pathname.endsWith(".html")) {
    return "must not include .html";
  }

  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    return "must not include trailing slash";
  }

  if (isForbiddenPath(url.pathname)) {
    return "must not include technical or non-canonical path";
  }

  const outputFile = outputFileFor(loc);

  if (!fs.existsSync(path.join(outputDir, outputFile))) {
    return `missing output file ${outputFile}`;
  }

  return "";
}

if (!fs.existsSync(sitemapPath)) {
  fail(`Missing sitemap: ${path.relative(rootDir, sitemapPath)}`);
}

const sitemap = fs.readFileSync(sitemapPath, "utf8");
const urlBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => match[1]);

if (!sitemap.includes("<urlset") || urlBlocks.length === 0) {
  fail("Generated sitemap.xml does not look like a valid URL set.");
}

const seen = new Set();
const errors = [];

for (const block of urlBlocks) {
  const locs = [...block.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].trim());
  const lastmods = [...block.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match =>
    match[1].trim(),
  );

  if (locs.length !== 1) {
    errors.push(`URL block must contain exactly one loc: ${block.replace(/\s+/g, " ").trim()}`);
    continue;
  }

  const loc = locs[0];
  const locError = validateLoc(loc);

  if (locError) {
    errors.push(`${loc}: ${locError}`);
  }

  if (seen.has(loc)) {
    errors.push(`${loc}: duplicate URL`);
  }

  seen.add(loc);

  if (lastmods.length > 1) {
    errors.push(`${loc}: multiple lastmod values`);
  }

  if (lastmods[0] && !/^\d{4}-\d{2}-\d{2}$/.test(lastmods[0])) {
    errors.push(`${loc}: lastmod must be YYYY-MM-DD`);
  }
}

if (errors.length > 0) {
  fail("Generated sitemap.xml contains non-canonical or invalid URLs:", errors);
}

console.log(`Astro sitemap output check passed for ${seen.size} canonical URLs.`);
