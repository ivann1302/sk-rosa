import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, process.env.AEO_OUTPUT_DIR || "public_html");
const businessId = "https://sk-rosa.ru/#business";
const websiteId = "https://sk-rosa.ru/#website";
const skippedHtmlFiles = new Set([
  "404.html",
  "yandex_35e96ef6b3300db1.html",
  "yandex_409f3d25273b124e.html",
  "yandex_a93fef6adebc72d6.html",
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function walkHtml(dir, prefix = "") {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => {
      const relativePath = path.join(prefix, entry.name);
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return walkHtml(fullPath, relativePath);
      }

      return entry.isFile() && entry.name.endsWith(".html") ? [relativePath] : [];
    })
    .sort();
}

function attrValue(tag, name) {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(pattern);

  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
}

function textValue(html, pattern) {
  return (html.match(pattern)?.[1] ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metaValue(html, name) {
  const tag = html.match(
    new RegExp(`<meta\\b(?=[^>]*(?:name|property)=["']${name}["'])[^>]*>`, "i"),
  )?.[0];

  return tag ? attrValue(tag, "content") : "";
}

function canonicalValue(html) {
  return attrValue(html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/i)?.[0] ?? "", "href");
}

function jsonLdItems(html, file) {
  return [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].flatMap(match => {
    try {
      const parsed = JSON.parse(match[1].trim());

      return flattenJsonLd(parsed);
    } catch (error) {
      throw new Error(`${file}: invalid JSON-LD: ${error.message}`);
    }
  });
}

function flattenJsonLd(value) {
  if (Array.isArray(value)) {
    return value.flatMap(flattenJsonLd);
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value["@graph"])) {
    return [value, ...value["@graph"].flatMap(flattenJsonLd)];
  }

  return [value];
}

function typeList(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.flatMap(typeList) : [value];
}

function hasType(item, type) {
  return typeList(item?.["@type"]).includes(type);
}

function isIndexable(html) {
  return !metaValue(html, "robots").toLowerCase().split(",").map(item => item.trim()).includes("noindex");
}

function checkHtmlPage(file) {
  const html = fs.readFileSync(path.join(outputDir, file), "utf8");
  const items = jsonLdItems(html, file);

  if (skippedHtmlFiles.has(file) || !isIndexable(html)) {
    return { checked: false };
  }

  const title = textValue(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = metaValue(html, "description");
  const canonical = canonicalValue(html);
  const ogUrl = metaValue(html, "og:url");

  assert(title, `${file}: missing title`);
  assert(description, `${file}: missing meta description`);
  assert(canonical, `${file}: missing canonical`);
  assert(ogUrl === canonical, `${file}: og:url must match canonical`);
  assert(metaValue(html, "og:title"), `${file}: missing og:title`);
  assert(metaValue(html, "og:description"), `${file}: missing og:description`);
  assert(metaValue(html, "og:image"), `${file}: missing og:image`);
  assert(metaValue(html, "og:image:alt"), `${file}: missing og:image:alt`);
  assert(items.some(item => item["@id"] === businessId), `${file}: missing business JSON-LD`);
  assert(items.some(item => item["@id"] === websiteId), `${file}: missing WebSite JSON-LD`);
  assert(
    items.some(item => hasType(item, "WebPage") && item["@id"] === `${canonical}#webpage`),
    `${file}: missing canonical WebPage JSON-LD`,
  );

  for (const service of items.filter(item => hasType(item, "Service"))) {
    assert(service.provider?.["@id"] === businessId, `${file}: Service provider must reference ${businessId}`);
    assert(service["@id"] === `${service.url}#service`, `${file}: Service @id must be url#service`);
    assert(service.offers?.priceCurrency === "RUB", `${file}: Service offer must use RUB`);
  }

  for (const posting of items.filter(item => hasType(item, "BlogPosting"))) {
    assert(posting.publisher?.["@id"] === businessId, `${file}: BlogPosting publisher must reference ${businessId}`);

    const authors = Array.isArray(posting.author) ? posting.author : [posting.author].filter(Boolean);

    for (const author of authors) {
      if (author && typeof author === "object") {
        assert(author.worksFor?.["@id"] === businessId, `${file}: BlogPosting author worksFor must reference ${businessId}`);
      }
    }
  }

  return { checked: true };
}

function checkCriticalFiles() {
  for (const file of ["robots.txt", "llms.txt", "sitemap.xml"]) {
    assert(fs.existsSync(path.join(outputDir, file)), `Missing ${file}`);
  }

  const robots = fs.readFileSync(path.join(outputDir, "robots.txt"), "utf8");
  const llms = fs.readFileSync(path.join(outputDir, "llms.txt"), "utf8");

  for (const bot of ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Bingbot"]) {
    assert(robots.includes(`User-agent: ${bot}`), `robots.txt: missing ${bot}`);
  }

  assert(llms.includes("Canonical domain: https://sk-rosa.ru"), "llms.txt: missing canonical domain");
  assert(llms.includes("https://sk-rosa.ru/sitemap.xml"), "llms.txt: missing sitemap URL");
}

function checkSitemap() {
  const sitemap = fs.readFileSync(path.join(outputDir, "sitemap.xml"), "utf8");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].trim());
  const uniqueUrls = new Set(urls);

  assert(urls.length > 0, "sitemap.xml: missing URLs");
  assert(uniqueUrls.size === urls.length, "sitemap.xml: duplicate URLs");

  for (const url of urls) {
    assert(url.startsWith("https://sk-rosa.ru/"), `sitemap.xml: non-canonical host in ${url}`);
    assert(!url.endsWith(".html"), `sitemap.xml: .html URL found: ${url}`);
    assert(url === "https://sk-rosa.ru/" || !url.endsWith("/"), `sitemap.xml: trailing slash URL found: ${url}`);
    assert(!url.includes("/blog/"), `sitemap.xml: redirected /blog/ URL found: ${url}`);
    assert(!url.includes("/articles/"), `sitemap.xml: redirected /articles/ URL found: ${url}`);
  }
}

assert(fs.existsSync(outputDir), `Missing output directory: ${path.relative(rootDir, outputDir)}`);

checkCriticalFiles();
checkSitemap();

const results = walkHtml(outputDir).map(checkHtmlPage);
const checkedCount = results.filter(result => result.checked).length;

process.stdout.write(`AEO metadata check passed for ${checkedCount} indexable HTML pages.\n`);
