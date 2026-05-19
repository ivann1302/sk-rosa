import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const legacyDir = path.join(rootDir, "public_html");
const astroDir = path.join(rootDir, "public_html_astro");

const pages = [
  "index.html",
  "calculator.html",
  "portfolio.html",
  "where-we-work.html",
  "privacy.html",
  "terms.html",
  "plastering.html",
  "plastering-balashikha.html",
  "plastering-khimki.html",
  "plastering-podolsk.html",
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
    .replace(/^(assets|scripts)\//, "/$1/");
}

function attrValue(tag, name) {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(pattern);

  return normalizeText(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
}

function matchFirst(html, pattern) {
  return html.match(pattern)?.[1] ?? "";
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
  };
}

function extractJsonLdTypes(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => {
      try {
        return JSON.parse(match[1].trim())["@type"] ?? "unknown";
      } catch {
        return "invalid";
      }
    })
    .sort();
}

function extractForms(html) {
  return [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)].map(([, formAttrs, body]) => {
    const fields = [...body.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)]
      .map(([, tagName, attrs]) => ({
        tag: tagName.toLowerCase(),
        type: attrValue(attrs, "type") || (tagName.toLowerCase() === "input" ? "text" : ""),
        name: attrValue(attrs, "name"),
        value: attrValue(attrs, "value"),
      }))
      .filter(field => field.name)
      .sort((a, b) =>
        `${a.tag}:${a.type}:${a.name}:${a.value}`.localeCompare(
          `${b.tag}:${b.type}:${b.name}:${b.value}`,
          "ru",
        ),
      );

    return {
      className: attrValue(formAttrs, "class"),
      action: normalizePublicPath(attrValue(formAttrs, "action")),
      method: attrValue(formAttrs, "method").toUpperCase() || "GET",
      fields,
    };
  });
}

function extractScripts(html) {
  return [...html.matchAll(/<script\b[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi)].map(match =>
    normalizePublicPath(match[1]),
  );
}

function extractRuntimeCapabilities(html) {
  const scripts = extractScripts(html);
  const hasFeaturesBundle = scripts.some(script => /^\/assets\/js\/features-[\w-]+\.js$/.test(script));
  const hasCoreBundle = scripts.some(script => /^\/assets\/js\/core-[\w-]+\.js$/.test(script));
  const hasPriceCalcMarkup = html.includes("price-calc");
  const hasManagedForm = /class=["'][^"']*(?:contact-request__form-fields|call-banner__form|price-calc__)/.test(
    html,
  );

  return {
    callBanner: scripts.includes("/scripts/features/contact/call-banner.js"),
    formHandling:
      !hasManagedForm ||
      hasFeaturesBundle ||
      scripts.includes("/scripts/features/contact/form-handler.js"),
    headerMenu: hasCoreBundle || scripts.includes("/scripts/core/main.js"),
    priceCalc:
      !hasPriceCalcMarkup ||
      hasFeaturesBundle ||
      scripts.includes("/scripts/features/calculator/price-calc.js"),
  };
}

function extractPage(html) {
  return {
    head: extractHead(html),
    h1: normalizeText(matchFirst(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i)),
    jsonLdTypes: extractJsonLdTypes(html),
    forms: extractForms(html),
    runtimeCapabilities: extractRuntimeCapabilities(html),
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  compareValue(diffs, page, "forms", legacy.forms, astro.forms);
  compareValue(diffs, page, "runtimeCapabilities", legacy.runtimeCapabilities, astro.runtimeCapabilities);
}

if (diffs.length === 0) {
  process.stdout.write(`Astro PoC parity check passed for ${pages.length} pages.\n`);
  process.exit(0);
}

console.error(`Astro PoC parity check failed: ${diffs.length} difference(s).`);

for (const diff of diffs) {
  console.error(`\n${diff.page}: ${diff.field}`);
  console.error(`  legacy: ${stable(diff.legacy)}`);
  console.error(`  astro:  ${stable(diff.astro)}`);
}

process.exit(1);
