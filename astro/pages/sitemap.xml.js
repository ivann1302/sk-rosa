import existingSitemapXml from "../../src/sitemap.xml?raw";
import { airlessPaintingApartmentsPage } from "../data/airless-painting-apartments.js";
import { airlessPaintingCeilingPage } from "../data/airless-painting-ceiling.js";
import { airlessPaintingFacadePage } from "../data/airless-painting-facade.js";
import { airlessPaintingPage } from "../data/airless-painting.js";
import { airlessPaintingWallsPage } from "../data/airless-painting-walls.js";
import { biozashchitaPage } from "../data/biozashchita.js";
import { blogArticlePages, blogPage } from "../data/blog.js";
import { fireProtectionPage } from "../data/fire-protection.js";
import { floorScreedPage } from "../data/floor-screed.js";
import { industrialAirlessPaintingPage } from "../data/industrial-airless-painting.js";
import { kompleksnayaOgnezashchitaPage } from "../data/kompleksnaya-ognezashchita.js";
import { ognezashchitaDerevyannyhKonstruktsiyPage } from "../data/ognezashchita-derevyannyh-konstruktsiy.js";
import { ognezashchitaMetallokonstruktsiyPage } from "../data/ognezashchita-metallokonstruktsiy.js";
import { ognezashchitaVozduhovodovPage } from "../data/ognezashchita-vozduhovodov.js";
import { plasteringPage } from "../data/plastering.js";
import { serviceCityPages } from "../data/service-city-pages.js";
import { softRoofingPage } from "../data/soft-roofing.js";
import { turnkeyRepairPage } from "../data/turnkey-repair.js";

const staticPages = [
  { canonical: "https://sk-rosa.ru/" },
  turnkeyRepairPage.seo,
  plasteringPage.seo,
  airlessPaintingPage.seo,
  airlessPaintingWallsPage.seo,
  airlessPaintingCeilingPage.seo,
  airlessPaintingApartmentsPage.seo,
  airlessPaintingFacadePage.seo,
  industrialAirlessPaintingPage.seo,
  floorScreedPage.seo,
  softRoofingPage.seo,
  biozashchitaPage.seo,
  fireProtectionPage.seo,
  kompleksnayaOgnezashchitaPage.seo,
  ognezashchitaDerevyannyhKonstruktsiyPage.seo,
  ognezashchitaVozduhovodovPage.seo,
  ognezashchitaMetallokonstruktsiyPage.seo,
  { canonical: "https://sk-rosa.ru/portfolio" },
  { canonical: "https://sk-rosa.ru/calculator" },
  blogPage.seo,
  { canonical: "https://sk-rosa.ru/where-we-work" },
  { canonical: "https://sk-rosa.ru/privacy" },
  { canonical: "https://sk-rosa.ru/terms" },
];

function existingLastmodMap() {
  return new Map(
    [...existingSitemapXml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g)].map(
      match => [match[1].trim(), match[2].trim()],
    ),
  );
}

function datePart(value) {
  return typeof value === "string" && value.length >= 10 ? value.slice(0, 10) : "";
}

function articleLastmod(article) {
  const posting = article.jsonLd.find(item => item["@type"] === "BlogPosting");

  return datePart(posting?.dateModified) || datePart(posting?.datePublished);
}

function isIndexableCanonicalUrl(value) {
  try {
    const url = new URL(value);
    const { pathname } = url;

    return (
      url.protocol === "https:" &&
      url.hostname === "sk-rosa.ru" &&
      url.search === "" &&
      url.hash === "" &&
      !pathname.endsWith(".html") &&
      (pathname === "/" || !pathname.endsWith("/")) &&
      !/^\/(?:404|assets|_astro|scripts|api|pages|articles)(?:\/|$)/.test(pathname) &&
      !/^\/(?:router\.php|robots\.txt|sitemap\.xml|llms\.txt|bde[^/]*\.txt|yandex_[^/]+\.html)$/.test(
        pathname,
      ) &&
      !/^\/blog\/[^/]+/.test(pathname)
    );
  } catch {
    return false;
  }
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function uniqueUrls() {
  const knownLastmods = existingLastmodMap();
  const pages = [
    ...staticPages.map(page => ({ loc: page.canonical })),
    ...blogArticlePages.map(article => ({
      loc: article.seo.canonical,
      lastmod: articleLastmod(article),
    })),
    ...serviceCityPages.map(({ page }) => ({ loc: page.seo.canonical })),
  ];

  const seen = new Set();

  return pages
    .filter(page => isIndexableCanonicalUrl(page.loc))
    .filter(page => {
      if (seen.has(page.loc)) {
        return false;
      }

      seen.add(page.loc);
      return true;
    })
    .map(page => ({
      loc: page.loc,
      lastmod: page.lastmod || knownLastmods.get(page.loc) || "",
    }));
}

function urlXml({ loc, lastmod }) {
  const lastmodXml = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : "";

  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmodXml}
  </url>`;
}

export function GET() {
  const urls = uniqueUrls()
    .map(urlXml)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
