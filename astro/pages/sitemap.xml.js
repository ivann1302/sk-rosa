import existingSitemapXml from "../../src/sitemap.xml?raw";
import { airlessPaintingPage } from "../data/airless-painting.js";
import { biozashchitaPage } from "../data/biozashchita.js";
import { blogArticlePages, blogPage } from "../data/blog.js";
import { floorScreedPage } from "../data/floor-screed.js";
import { plasteringPage } from "../data/plastering.js";
import { serviceCityPages } from "../data/service-city-pages.js";
import { softRoofingPage } from "../data/soft-roofing.js";
import { turnkeyRepairPage } from "../data/turnkey-repair.js";

const staticPages = [
  { canonical: "https://sk-rosa.ru/" },
  turnkeyRepairPage.seo,
  plasteringPage.seo,
  airlessPaintingPage.seo,
  floorScreedPage.seo,
  softRoofingPage.seo,
  biozashchitaPage.seo,
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
  const today = new Date().toISOString().slice(0, 10);
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
    .filter(page => page.loc?.startsWith("https://sk-rosa.ru"))
    .filter(page => {
      if (seen.has(page.loc)) {
        return false;
      }

      seen.add(page.loc);
      return true;
    })
    .map(page => ({
      loc: page.loc,
      lastmod: page.lastmod || knownLastmods.get(page.loc) || today,
    }));
}

export function GET() {
  const urls = uniqueUrls()
    .map(
      ({ loc, lastmod }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
  </url>`,
    )
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
