import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const astroDir = path.join(rootDir, "public_html_astro");

const pages = [
  { file: "blog.html", canonical: "https://sk-rosa.ru/blog", kind: "blog" },
  {
    file: "stoimost-remonta-kvartiry.html",
    canonical: "https://sk-rosa.ru/stoimost-remonta-kvartiry",
    kind: "article",
  },
  {
    file: "kak-rasscitat-raskhod-shtukaturki.html",
    canonical: "https://sk-rosa.ru/kak-rasscitat-raskhod-shtukaturki",
    kind: "article",
  },
  {
    file: "pokraska-sten-dvumya-cvetami.html",
    canonical: "https://sk-rosa.ru/pokraska-sten-dvumya-cvetami",
    kind: "article",
  },
  {
    file: "styazhka-pod-teply-pol.html",
    canonical: "https://sk-rosa.ru/styazhka-pod-teply-pol",
    kind: "article",
  },
  {
    file: "shpaklevka-sten-posle-shtukaturki.html",
    canonical: "https://sk-rosa.ru/shpaklevka-sten-posle-shtukaturki",
    kind: "article",
  },
  {
    file: "pokraska-sten-bez-razvodov.html",
    canonical: "https://sk-rosa.ru/pokraska-sten-bez-razvodov",
    kind: "article",
  },
  {
    file: "armirovanie-shtukaturki-setkoj.html",
    canonical: "https://sk-rosa.ru/armirovanie-shtukaturki-setkoj",
    kind: "article",
  },
  {
    file: "gidroizolyaciya-pola-pod-styazhku.html",
    canonical: "https://sk-rosa.ru/gidroizolyaciya-pola-pod-styazhku",
    kind: "article",
  },
  {
    file: "vidy-styazhki-pola.html",
    canonical: "https://sk-rosa.ru/vidy-styazhki-pola",
    kind: "article",
  },
  {
    file: "fasad-shtukaturka.html",
    canonical: "https://sk-rosa.ru/fasad-shtukaturka",
    kind: "article",
  },
  {
    file: "preimushestva-bezvozdushnoj-pokraski.html",
    canonical: "https://sk-rosa.ru/preimushestva-bezvozdushnoj-pokraski",
    kind: "article",
  },
  {
    file: "shtukaturka-sten-v-novostrojke.html",
    canonical: "https://sk-rosa.ru/shtukaturka-sten-v-novostrojke",
    kind: "article",
  },
  {
    file: "vybor-kraski-airless-painting.html",
    canonical: "https://sk-rosa.ru/vybor-kraski-airless-painting",
    kind: "article",
  },
  {
    file: "shtukaturka-guide.html",
    canonical: "https://sk-rosa.ru/shtukaturka-guide",
    kind: "article",
  },
  {
    file: "mashinnaya-ili-ruchnaya-shtukaturka.html",
    canonical: "https://sk-rosa.ru/mashinnaya-ili-ruchnaya-shtukaturka",
    kind: "article",
  },
  {
    file: "vybor-shtukaturki.html",
    canonical: "https://sk-rosa.ru/vybor-shtukaturki",
    kind: "article",
  },
];

function readHtml(page) {
  const filePath = path.join(astroDir, page);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${path.relative(rootDir, filePath)}`);
  }

  return fs.readFileSync(filePath, "utf8");
}

function attrValue(tag, name) {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(pattern);

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function textValue(html, pattern) {
  return (html.match(pattern)?.[1] ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metaValue(html, name) {
  const tag = html.match(
    new RegExp(`<meta\\b(?=[^>]*(?:name|property)=["']${name}["'])[^>]*>`, "i")
  )?.[0];

  return tag ? attrValue(tag, "content") : "";
}

function canonicalValue(html) {
  return attrValue(html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/i)?.[0] ?? "", "href");
}

function collectJsonLdTypes(value, types = []) {
  if (Array.isArray(value)) {
    value.forEach(item => collectJsonLdTypes(item, types));
    return types;
  }

  if (!value || typeof value !== "object") {
    return types;
  }

  if (value["@type"]) {
    types.push(value["@type"]);
  }

  if (value["@graph"]) {
    collectJsonLdTypes(value["@graph"], types);
  }

  return types;
}

function jsonLdTypes(html) {
  return [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ].flatMap(match => collectJsonLdTypes(JSON.parse(match[1].trim())));
}

function scripts(html) {
  return [...html.matchAll(/<script\b[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi)].map(match =>
    match[1].replace(/^(?:\.\.\/)+/, "/")
  );
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function checkPage({ file, canonical, kind }) {
  const html = readHtml(file);
  const types = jsonLdTypes(html);
  const pageScripts = scripts(html);

  assert(textValue(html, /<title[^>]*>([\s\S]*?)<\/title>/i), `${file}: missing title`);
  assert(metaValue(html, "description"), `${file}: missing description`);
  assert(canonicalValue(html) === canonical, `${file}: unexpected canonical`);
  assert(textValue(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i), `${file}: missing h1`);
  assert(types.includes("BreadcrumbList"), `${file}: missing BreadcrumbList JSON-LD`);

  if (kind === "blog") {
    assert(types.includes("Blog"), `${file}: missing Blog JSON-LD`);
    assert(
      pageScripts.includes("/scripts/features/blog/blog-filter.js"),
      `${file}: missing blog filter script`
    );
    assert(
      pageScripts.includes("/scripts/features/blog/blog-search.js"),
      `${file}: missing blog search script`
    );
    assert(
      pageScripts.includes("/scripts/features/contact/call-banner.js"),
      `${file}: missing call banner script`
    );
    return;
  }

  assert(
    types.includes("BlogPosting") || types.includes("Article"),
    `${file}: missing article JSON-LD`
  );
  assert(metaValue(html, "article:published_time"), `${file}: missing article published time`);
  assert(
    pageScripts.includes("/scripts/features/blog/blog-copy-link.js"),
    `${file}: missing blog copy link script`
  );
}

for (const page of pages) {
  checkPage(page);
}

process.stdout.write(`Astro blog output check passed for ${pages.length} generated blog pages.\n`);
