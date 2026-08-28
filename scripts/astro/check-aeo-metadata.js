import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  equipmentRentalPage,
  rentalEquipment,
} from "../../astro/data/equipment-rental.js";
import {
  rentalCategoryPages,
  rentalGroupPages,
} from "../../astro/data/equipment-rental-catalog.js";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, process.env.AEO_OUTPUT_DIR || "public_html_astro");
const businessId = "https://sk-rosa.ru/#business";
const websiteId = "https://sk-rosa.ru/#website";
const skippedHtmlFiles = new Set([
  "404.html",
  "yandex_35e96ef6b3300db1.html",
  "yandex_409f3d25273b124e.html",
  "yandex_a93fef6adebc72d6.html",
]);
const rentalPublishedPages = [...rentalGroupPages, ...rentalCategoryPages];
const rentalDirectoryCanonicals = new Set([
  equipmentRentalPage.seo.canonical,
  ...rentalPublishedPages.map(page => page.canonical),
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

function outputFileForCanonical(canonical) {
  const pathname = new URL(canonical).pathname.replace(/^\/+|\/+$/g, "");

  return pathname ? `${pathname}.html` : "index.html";
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

function areaServedNames(item) {
  const areas = Array.isArray(item?.areaServed) ? item.areaServed : [item?.areaServed].filter(Boolean);

  return new Set(areas.map(area => typeof area === "string" ? area : area?.name).filter(Boolean));
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
  const robots = metaValue(html, "robots");

  assert(title, `${file}: missing title`);
  assert(description, `${file}: missing meta description`);
  assert(canonical, `${file}: missing canonical`);
  assert(robots.includes("max-image-preview:large"), `${file}: large image previews must be allowed`);
  assert(ogUrl === canonical, `${file}: og:url must match canonical`);
  assert(metaValue(html, "og:title"), `${file}: missing og:title`);
  assert(metaValue(html, "og:description"), `${file}: missing og:description`);
  assert(metaValue(html, "og:image"), `${file}: missing og:image`);
  assert(metaValue(html, "og:image:alt"), `${file}: missing og:image:alt`);
  assert(metaValue(html, "og:site_name"), `${file}: missing og:site_name`);
  assert(metaValue(html, "twitter:card") === "summary_large_image", `${file}: missing large Twitter card`);
  assert(metaValue(html, "twitter:title"), `${file}: missing twitter:title`);
  assert(metaValue(html, "twitter:description"), `${file}: missing twitter:description`);
  assert(metaValue(html, "twitter:image") === metaValue(html, "og:image"), `${file}: social images must match`);
  assert(metaValue(html, "twitter:image:alt"), `${file}: missing twitter:image:alt`);
  assert(items.some(item => item["@id"] === businessId), `${file}: missing business JSON-LD`);
  assert(items.some(item => item["@id"] === websiteId), `${file}: missing WebSite JSON-LD`);
  assert(
    items.some(item => hasType(item, "WebPage") && item["@id"] === `${canonical}#webpage`),
    `${file}: missing canonical WebPage JSON-LD`,
  );

  for (const service of items.filter(item => hasType(item, "Service"))) {
    assert(service.provider?.["@id"] === businessId, `${file}: Service provider must reference ${businessId}`);
    assert(service["@id"] === `${service.url}#service`, `${file}: Service @id must be url#service`);
    const offers = Array.isArray(service.offers) ? service.offers : [service.offers].filter(Boolean);

    if (offers.length === 0) {
      assert(
        rentalDirectoryCanonicals.has(canonical),
        `${file}: only rental directory pages may omit Service offers`,
      );
    }

    for (const offer of offers) {
      assert(offer.priceCurrency === "RUB", `${file}: Service offer must use RUB`);
    }
  }

  if (canonical.includes("/arenda-") && !rentalDirectoryCanonicals.has(canonical)) {
    const ogImage = metaValue(html, "og:image");
    const webPage = items.find(item => hasType(item, "WebPage") && item["@id"] === `${canonical}#webpage`);
    const service = items.find(item => hasType(item, "Service") && item["@id"] === `${canonical}#service`);

    assert(ogImage.includes("/assets/images/rental-preview/"), `${file}: rental page must use its equipment image`);
    assert(webPage?.primaryImageOfPage?.contentUrl === ogImage, `${file}: WebPage image must match og:image`);
    assert(service?.image === ogImage, `${file}: Service image must match og:image`);
    assert(
      service?.availableChannel?.servicePhone?.["@type"] === "ContactPoint",
      `${file}: rental phone channel must use ContactPoint`,
    );
    for (const offer of service?.offers ?? []) {
      assert(
        offer.businessFunction === "http://purl.org/goodrelations/v1#LeaseOut",
        `${file}: rental offer must be marked as a lease`,
      );
      assert(
        offer.priceSpecification?.referenceQuantity?.value,
        `${file}: rental price must declare its duration`,
      );
    }
  }

  if (canonical === "https://sk-rosa.ru/arenda-stroitelnogo-oborudovaniya") {
    const catalog = items.find(item => hasType(item, "ItemList") && item["@id"] === `${canonical}#catalog`);

    assert(
      catalog?.itemListElement?.length === rentalEquipment.length,
      `${file}: rental catalog must list ${rentalEquipment.length} items`,
    );
    for (const listItem of catalog.itemListElement) {
      assert(listItem.url, `${file}: catalog item must link to a page or category`);
      assert(listItem.name, `${file}: catalog item must have a name`);
    }
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

  for (const bot of [
    "GPTBot",
    "OAI-SearchBot",
    "ClaudeBot",
    "Claude-SearchBot",
    "PerplexityBot",
    "Bingbot",
  ]) {
    assert(robots.includes(`User-agent: ${bot}`), `robots.txt: missing ${bot}`);
  }

  assert(llms.includes("Canonical domain: https://sk-rosa.ru"), "llms.txt: missing canonical domain");
  assert(llms.includes("https://sk-rosa.ru/sitemap.xml"), "llms.txt: missing sitemap URL");
  assert(
    llms.includes("https://sk-rosa.ru/arenda-stroitelnogo-oborudovaniya"),
    "llms.txt: missing equipment rental catalog",
  );

  for (const page of rentalPublishedPages) {
    assert(llms.includes(page.canonical), `llms.txt: missing published rental page ${page.canonical}`);
  }
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

function hasInternalHref(html, canonical) {
  const pathname = new URL(canonical).pathname;

  return html.includes(`href="${pathname}"`) || html.includes(`href='${pathname}'`);
}

function checkRentalPublishedPages() {
  const sitemap = fs.readFileSync(path.join(outputDir, "sitemap.xml"), "utf8");
  const titles = new Set();
  const descriptions = new Set();

  assert(
    rentalPublishedPages.length === 48,
    `Published rental directory must define 48 pages, got ${rentalPublishedPages.length}`,
  );

  for (const page of rentalPublishedPages) {
    const pathname = new URL(page.canonical).pathname.replace(/^\/+/, "");
    const file = `${pathname}.html`;
    const fullPath = path.join(outputDir, file);

    assert(fs.existsSync(fullPath), `${file}: missing published rental output`);

    const html = fs.readFileSync(fullPath, "utf8");
    const title = textValue(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = metaValue(html, "description");
    const items = jsonLdItems(html, file);
    const service = items.find(item => hasType(item, "Service") && item["@id"] === `${page.canonical}#service`);
    const webPage = items.find(item => hasType(item, "WebPage") && item["@id"] === `${page.canonical}#webpage`);
    const catalog = items.find(item => hasType(item, "ItemList") && item["@id"] === `${page.canonical}#catalog`);
    const areaNames = areaServedNames(service);
    const expectedCatalogSize = page.categories?.length ?? page.items.length;

    assert(isIndexable(html), `${file}: published rental page must be indexable`);
    assert(
      html.includes("data-rental-directory-page"),
      `${file}: published rental page must use the shared directory template`,
    );
    assert(
      sitemap.includes(`<loc>${page.canonical}</loc>`),
      `${file}: published rental page must be in sitemap`,
    );
    assert(title.includes("Моск") && title.includes("Долгопруд"), `${file}: rental title must cover both cities`);
    assert(
      description.includes("Моск") && description.includes("Долгопруд"),
      `${file}: rental description must cover both cities`,
    );
    assert(service, `${file}: published rental page must define Service JSON-LD`);
    assert(service?.provider?.["@id"] === businessId, `${file}: rental Service must reference the business`);
    assert(areaNames.has("Москва") && areaNames.has("Долгопрудный"), `${file}: Service must cover both cities`);
    assert(!service?.offers, `${file}: unconfirmed directory prices must not be structured as offers`);
    assert(webPage?.mainEntity?.["@id"] === `${page.canonical}#service`, `${file}: WebPage must reference Service`);
    assert(catalog?.numberOfItems === expectedCatalogSize, `${file}: catalog item count must match page data`);
    assert(!titles.has(title), `${file}: duplicate published rental title`);
    assert(!descriptions.has(description), `${file}: duplicate published rental description`);

    titles.add(title);
    descriptions.add(description);
  }

  const mainCatalogHtml = fs.readFileSync(
    path.join(outputDir, outputFileForCanonical(equipmentRentalPage.seo.canonical)),
    "utf8",
  );

  for (const groupPage of rentalGroupPages) {
    assert(
      hasInternalHref(mainCatalogHtml, groupPage.canonical),
      `Main rental catalog must link to ${groupPage.canonical}`,
    );

    const groupHtml = fs.readFileSync(
      path.join(outputDir, outputFileForCanonical(groupPage.canonical)),
      "utf8",
    );
    const groupCategories = rentalCategoryPages.filter(category => category.group === groupPage.group);

    for (const category of groupCategories) {
      assert(
        hasInternalHref(groupHtml, category.canonical),
        `${groupPage.slug}: missing category link ${category.canonical}`,
      );
    }
  }
}

function checkRentalMetadataCoverage() {
  const pages = [
    equipmentRentalPage,
    ...rentalGroupPages,
    ...rentalCategoryPages,
    ...rentalEquipment,
  ];
  const titles = new Set();
  const descriptions = new Set();

  assert(pages.length === 61, `Rental metadata must cover 61 pages, got ${pages.length}`);

  for (const page of pages) {
    const canonical = page.seo.canonical;
    const file = outputFileForCanonical(canonical);
    const html = fs.readFileSync(path.join(outputDir, file), "utf8");
    const title = textValue(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = metaValue(html, "description");
    const heading = textValue(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const socialTitle = metaValue(html, "og:title");
    const socialDescription = metaValue(html, "og:description");
    const items = jsonLdItems(html, file);
    const service = items.find(item => hasType(item, "Service") && item["@id"] === `${canonical}#service`);
    const organization = items.find(item => item["@id"] === businessId);
    const serviceAreas = areaServedNames(service);
    const organizationAreas = areaServedNames(organization);

    assert(title === page.seo.title, `${file}: rendered rental title must match data`);
    assert(description === page.seo.description, `${file}: rendered rental description must match data`);
    assert(title.length <= 70, `${file}: rental title is longer than 70 characters`);
    assert(description.length <= 170, `${file}: rental description is longer than 170 characters`);
    assert(title.includes("Моск") && title.includes("Долгопруд"), `${file}: title must cover both cities`);
    assert(
      description.includes("Моск") && description.includes("Долгопруд"),
      `${file}: description must cover both cities`,
    );
    assert(heading.includes("Моск") && heading.includes("Долгопруд"), `${file}: H1 must cover both cities`);
    assert(
      socialTitle.includes("Моск") && socialTitle.includes("Долгопруд"),
      `${file}: social title must cover both cities`,
    );
    assert(
      socialDescription.includes("Моск") && socialDescription.includes("Долгопруд"),
      `${file}: social description must cover both cities`,
    );
    assert(service, `${file}: rental page must define Service JSON-LD`);
    assert(serviceAreas.has("Москва") && serviceAreas.has("Долгопрудный"), `${file}: Service geo is incomplete`);
    assert(
      organizationAreas.has("Москва") && organizationAreas.has("Долгопрудный"),
      `${file}: Organization geo is incomplete`,
    );
    assert(!titles.has(title), `${file}: duplicate rental title`);
    assert(!descriptions.has(description), `${file}: duplicate rental description`);

    titles.add(title);
    descriptions.add(description);
  }
}

assert(fs.existsSync(outputDir), `Missing output directory: ${path.relative(rootDir, outputDir)}`);

checkCriticalFiles();
checkSitemap();
checkRentalPublishedPages();
checkRentalMetadataCoverage();

const results = walkHtml(outputDir).map(checkHtmlPage);
const checkedCount = results.filter(result => result.checked).length;
const expectedRentalPageCount =
  1 + rentalGroupPages.length + rentalCategoryPages.length + rentalEquipment.length;

assert(expectedRentalPageCount === 61, `Rental data must define 61 pages, got ${expectedRentalPageCount}`);

process.stdout.write(
  `AEO metadata check passed for ${checkedCount} indexable HTML pages and ${expectedRentalPageCount} rental pages.\n`,
);
