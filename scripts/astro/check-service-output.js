import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const astroDir = path.join(rootDir, "public_html_astro");
const cities = JSON.parse(
  fs.readFileSync(path.join(rootDir, "astro/data/directus-cache/cities.json"), "utf8"),
).cities;

const services = [
  {
    slug: "plastering",
    name: "Штукатурные работы",
    basePage: "plastering.html",
    pricingScript: "/scripts/features/pricing-table.js",
    cityFormPrefix: "Штукатурные работы",
    quizPrefix: "Квиз-смета штукатурки",
    miniCalcPrefix: "Мини-калькулятор штукатурки",
  },
  {
    slug: "floor-screed",
    name: "Стяжка пола",
    basePage: "floor-screed.html",
    pricingScript: "/scripts/features/pricing-table-floor-screed.js",
    cityFormPrefix: "Стяжка пола",
    quizPrefix: "Квиз-смета стяжки пола",
    miniCalcPrefix: "Мини-калькулятор стяжки",
  },
  {
    slug: "airless-painting",
    name: "Безвоздушная покраска",
    basePage: "airless-painting.html",
    pricingScript: "/scripts/features/pricing-table-airless-painting.js",
    cityFormPrefix: "Безвоздушная покраска",
    quizPrefix: "Квиз-смета безвоздушной покраски",
    miniCalcPrefix: "Мини-калькулятор покраски",
  },
  {
    slug: "soft-roofing",
    name: "Мягкая кровля",
    basePage: "soft-roofing.html",
    pricingScript: "/scripts/features/pricing-table-soft-roofing.js",
    cityFormPrefix: "Мягкая кровля",
    quizPrefix: "Квиз-смета мягкой кровли",
    miniCalcPrefix: "Мини-калькулятор мягкой кровли",
  },
  {
    slug: "turnkey-repair",
    name: "Ремонт под ключ",
    basePage: "turnkey-repair.html",
    pricingScript: "/scripts/features/pricing-table-turnkey-repair.js",
    cityFormPrefix: "Ремонт под ключ - Консультация",
    quizPrefix: "Квиз-смета ремонта под ключ",
    miniCalcPrefix: "Мини-калькулятор ремонта под ключ",
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
  return (html.match(pattern)?.[1] ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function metaValue(html, name) {
  const tag = html.match(
    new RegExp(`<meta\\b(?=[^>]*(?:name|property)=["']${name}["'])[^>]*>`, "i"),
  )?.[0];

  return tag ? attrValue(tag, "content") : "";
}

function canonicalValue(html) {
  return attrValue(
    html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/i)?.[0] ?? "",
    "href",
  );
}

function formSources(html) {
  return [...html.matchAll(/<input\b(?=[^>]*name=["']form_source["'])[^>]*>/gi)].map(tag =>
    attrValue(tag[0], "value"),
  );
}

function scripts(html) {
  return [...html.matchAll(/<script\b[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi)].map(match =>
    match[1].replace(/^(?:\.\.\/)+/, "/"),
  );
}

function jsonLdTypes(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => JSON.parse(match[1].trim())["@type"])
    .sort();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function checkPage(page, service, city = null) {
  const html = readHtml(page);
  const sources = formSources(html);
  const pageScripts = scripts(html);
  const types = jsonLdTypes(html);
  const expectedCitySuffix = city ? ` (${city.name})` : "";
  const isTurnkeyRepair = service.slug === "turnkey-repair";

  assert(textValue(html, /<title[^>]*>([\s\S]*?)<\/title>/i), `${page}: missing title`);
  assert(metaValue(html, "description"), `${page}: missing description`);
  assert(canonicalValue(html), `${page}: missing canonical`);
  assert(textValue(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i), `${page}: missing h1`);
  assert(types.includes("Service"), `${page}: missing Service JSON-LD`);
  assert(types.includes("BreadcrumbList"), `${page}: missing BreadcrumbList JSON-LD`);
  assert(types.includes("FAQPage"), `${page}: missing FAQPage JSON-LD`);
  if (isTurnkeyRepair) {
    assert(html.includes('class="about-turnkey"'), `${page}: missing turnkey legacy hero`);
    assert(html.includes('class="about-turnkey-2"'), `${page}: missing turnkey legacy calculator`);
    assert(
      sources.includes(`Ремонт под ключ - Калькулятор${expectedCitySuffix}`),
      `${page}: missing turnkey calculator form_source`,
    );
  } else {
    assert(
      sources.includes(`${service.quizPrefix}${expectedCitySuffix}`),
      `${page}: missing quiz form_source`,
    );
    assert(
      sources.includes(`${service.miniCalcPrefix}${expectedCitySuffix}`),
      `${page}: missing mini calc form_source`,
    );
  }
  assert(
    sources.includes(`${service.cityFormPrefix}${expectedCitySuffix}`),
    `${page}: missing contact form_source`,
  );
  if (isTurnkeyRepair) {
    assert(
      pageScripts.includes("/scripts/features/portfolio/custom-select.js"),
      `${page}: missing turnkey custom select script`,
    );
    assert(
      pageScripts.includes("/scripts/features/portfolio/portfolio-turnkey.js"),
      `${page}: missing turnkey portfolio script`,
    );
  } else {
    assert(
      pageScripts.includes("/scripts/features/calculator/price-calc.js"),
      `${page}: missing price calc script`,
    );
    assert(pageScripts.includes(service.pricingScript), `${page}: missing pricing script`);
    assert(
      pageScripts.includes("/scripts/features/contact/contact-request.js"),
      `${page}: missing contact request script`,
    );
  }
}

let checked = 0;

for (const service of services) {
  checkPage(service.basePage, service);
  checked++;

  for (const city of cities) {
    checkPage(`${service.slug}-${city.slug}.html`, service, city);
    checked++;
  }
}

process.stdout.write(`Astro service output check passed for ${checked} pages.\n`);
