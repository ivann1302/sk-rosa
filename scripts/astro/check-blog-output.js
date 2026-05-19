import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const legacyDir = path.join(rootDir, "public_html");
const astroDir = path.join(rootDir, "public_html_astro");

const pages = [
  "blog.html",
  "stoimost-remonta-kvartiry.html",
  "kak-rasscitat-raskhod-shtukaturki.html",
  "pokraska-sten-dvumya-cvetami.html",
  "styazhka-pod-teply-pol.html",
  "shpaklevka-sten-posle-shtukaturki.html",
  "pokraska-sten-bez-razvodov.html",
  "armirovanie-shtukaturki-setkoj.html",
  "gidroizolyaciya-pola-pod-styazhku.html",
  "vidy-styazhki-pola.html",
  "fasad-shtukaturka.html",
  "preimushestva-bezvozdushnoj-pokraski.html",
  "shtukaturka-sten-v-novostrojke.html",
  "vybor-kraski-airless-painting.html",
  "shtukaturka-guide.html",
  "mashinnaya-ili-ruchnaya-shtukaturka.html",
  "vybor-shtukaturki.html",
];

const headFields = [
  "title",
  "description",
  "robots",
  "canonical",
  "og:type",
  "og:title",
  "og:description",
  "og:url",
  "og:image",
  "og:image:secure_url",
  "og:image:width",
  "og:image:height",
  "og:image:type",
  "og:image:alt",
  "og:locale",
  "og:site_name",
  "article:published_time",
  "article:author",
  "article:section",
];

function readHtml(dir, page) {
  const filePath = path.join(dir, page);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${path.relative(rootDir, filePath)}`);
  }

  return fs.readFileSync(filePath, "utf8");
}

function decodeEntities(value) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#34;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ");
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, " ");
}

function normalizeText(value = "") {
  return decodeEntities(stripTags(value))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePublicPath(value = "") {
  return normalizeText(value)
    .replace(/^(?:\.\.\/)+/, "/")
    .replace(/^\.\//, "/")
    .replace(/^([a-z][a-z0-9-]+)\.html$/, "/$1")
    .replace(/^\.\.\/([a-z][a-z0-9-]+)\.html$/, "/$1");
}

function attrValue(tag, name) {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(pattern);

  return normalizeText(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
}

function matchFirst(html, pattern) {
  return html.match(pattern)?.[1] ?? "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMeta(html, name) {
  const tag = html.match(
    new RegExp(`<meta\\b(?=[^>]*(?:name|property)=["']${escapeRegExp(name)}["'])[^>]*>`, "i"),
  )?.[0];

  return tag ? attrValue(tag, "content") : "";
}

function extractHead(html) {
  return {
    title: normalizeText(matchFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i)),
    description: extractMeta(html, "description"),
    robots: extractMeta(html, "robots"),
    canonical: attrValue(
      html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/i)?.[0] ?? "",
      "href",
    ),
    "og:type": extractMeta(html, "og:type"),
    "og:title": extractMeta(html, "og:title"),
    "og:description": extractMeta(html, "og:description"),
    "og:url": extractMeta(html, "og:url"),
    "og:image": extractMeta(html, "og:image"),
    "og:image:secure_url": extractMeta(html, "og:image:secure_url"),
    "og:image:width": extractMeta(html, "og:image:width"),
    "og:image:height": extractMeta(html, "og:image:height"),
    "og:image:type": extractMeta(html, "og:image:type"),
    "og:image:alt": extractMeta(html, "og:image:alt"),
    "og:locale": extractMeta(html, "og:locale"),
    "og:site_name": extractMeta(html, "og:site_name"),
    "article:published_time": extractMeta(html, "article:published_time"),
    "article:author": extractMeta(html, "article:author"),
    "article:section": extractMeta(html, "article:section"),
  };
}

function extractJsonLdTypes(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => JSON.parse(match[1].trim())["@type"] ?? "unknown")
    .sort();
}

function extractFormSources(html) {
  return [...html.matchAll(/<input\b(?=[^>]*name=["']form_source["'])[^>]*>/gi)]
    .map(tag => attrValue(tag[0], "value"))
    .sort();
}

function extractScripts(html) {
  return [...html.matchAll(/<script\b[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi)].map(match =>
    normalizePublicPath(match[1]),
  );
}

function extractPage(html) {
  return {
    head: extractHead(html),
    h1: normalizeText(matchFirst(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i)),
    jsonLdTypes: extractJsonLdTypes(html),
    formSources: extractFormSources(html),
    scripts: extractScripts(html).filter(script =>
      [
        "/scripts/features/blog/blog-filter.js",
        "/scripts/features/blog/blog-search.js",
        "/scripts/features/blog/blog-copy-link.js",
        "/scripts/features/contact/call-banner.js",
      ].includes(script),
    ),
  };
}

function stable(value) {
  return JSON.stringify(value);
}

function compareValue(diffs, page, field, legacyValue, astroValue) {
  if (stable(legacyValue) !== stable(astroValue)) {
    diffs.push({ page, field, legacy: legacyValue, astro: astroValue });
  }
}

const diffs = [];

for (const page of pages) {
  const legacy = extractPage(readHtml(legacyDir, page));
  const astro = extractPage(readHtml(astroDir, page));

  for (const field of headFields) {
    compareValue(diffs, page, field, legacy.head[field], astro.head[field]);
  }

  compareValue(diffs, page, "h1", legacy.h1, astro.h1);
  compareValue(diffs, page, "jsonLdTypes", legacy.jsonLdTypes, astro.jsonLdTypes);
  compareValue(diffs, page, "formSources", legacy.formSources, astro.formSources);
  compareValue(diffs, page, "blogRuntimeScripts", legacy.scripts, astro.scripts);
}

if (diffs.length === 0) {
  process.stdout.write(`Astro blog output check passed for ${pages.length} pages.\n`);
  process.exit(0);
}

console.error(`Astro blog output check failed: ${diffs.length} difference(s).`);

for (const diff of diffs) {
  console.error(`\n${diff.page}: ${diff.field}`);
  console.error(`  legacy: ${stable(diff.legacy)}`);
  console.error(`  astro:  ${stable(diff.astro)}`);
}

process.exit(1);
