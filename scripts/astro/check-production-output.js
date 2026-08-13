import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { gzipSync } from "node:zlib";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "public_html_astro");
const baselinePath = path.join(rootDir, "docs/production-url-baseline.txt");

const criticalFiles = [
  ".htaccess",
  ".nojekyll",
  "404.html",
  "404.php",
  "bde05525-af0e-48de-b161-305c96820afb.txt",
  "llms.txt",
  "robots.txt",
  "router.php",
  "sitemap.xml",
  "yandex_35e96ef6b3300db1.html",
  "yandex_a93fef6adebc72d6.html",
];

const homepageCssBudget = {
  raw: 100 * 1024,
  gzip: 20 * 1024,
};

function relativeOutputPath(url) {
  return new URL(url).pathname.replace(/^\/+/, "");
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(outputDir, relativePath));
}

if (!fs.existsSync(outputDir)) {
  throw new Error(`Missing Astro output directory: ${path.relative(rootDir, outputDir)}`);
}

if (!fs.existsSync(baselinePath)) {
  throw new Error(`Missing production URL baseline: ${path.relative(rootDir, baselinePath)}`);
}

const baselineUrls = fs.readFileSync(baselinePath, "utf8").trim().split(/\n+/).filter(Boolean);

const missingBaselineFiles = baselineUrls.map(relativeOutputPath).filter(file => !fileExists(file));
const missingCriticalFiles = criticalFiles.filter(file => !fileExists(file));

if (missingBaselineFiles.length > 0 || missingCriticalFiles.length > 0) {
  if (missingBaselineFiles.length > 0) {
    console.error("Missing files from docs/production-url-baseline.txt:");
    console.error(missingBaselineFiles.map(file => `  - ${file}`).join("\n"));
  }

  if (missingCriticalFiles.length > 0) {
    console.error("Missing production-critical files:");
    console.error(missingCriticalFiles.map(file => `  - ${file}`).join("\n"));
  }

  process.exit(1);
}

function attributeValue(tag, name) {
  return tag.match(new RegExp(`(?:^|\\s)${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
}

const homepageHtml = fs.readFileSync(path.join(outputDir, "index.html"), "utf8");
const homepageLinkTags = [...homepageHtml.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]);
const homepageStylesheets = homepageLinkTags.filter(
  tag => attributeValue(tag, "rel").toLowerCase() === "stylesheet"
);
const homepageCssFiles = homepageStylesheets
  .map(tag => attributeValue(tag, "href"))
  .filter(href => href.startsWith("/"))
  .map(href => path.join(outputDir, href.replace(/^\/+/, "")));
const missingHomepageCss = homepageCssFiles.filter(file => !fs.existsSync(file));

if (homepageCssFiles.length === 0 || missingHomepageCss.length > 0) {
  console.error("Homepage stylesheet output is missing or invalid.");
  process.exit(1);
}

const homepageCss = homepageCssFiles.map(file => fs.readFileSync(file));
const homepageCssRawBytes = homepageCss.reduce((total, css) => total + css.length, 0);
const homepageCssGzipBytes = homepageCss.reduce((total, css) => total + gzipSync(css).length, 0);

if (homepageCssRawBytes > homepageCssBudget.raw || homepageCssGzipBytes > homepageCssBudget.gzip) {
  console.error(
    `Homepage CSS exceeds its budget: ${homepageCssRawBytes} raw / ${homepageCssGzipBytes} gzip bytes.`
  );
  process.exit(1);
}

const imagePreloads = homepageLinkTags.filter(
  tag =>
    attributeValue(tag, "rel").toLowerCase() === "preload" &&
    attributeValue(tag, "as").toLowerCase() === "image"
);
const expectedHeroPreloads = [
  {
    href: "/assets/images/portfolio/20-mobile.webp",
    media: "(max-width: 768px)",
  },
  {
    href: "/assets/images/common/about-hero.webp",
    media: "(min-width: 769px)",
  },
];

for (const expected of expectedHeroPreloads) {
  const preload = imagePreloads.find(tag => attributeValue(tag, "href") === expected.href);
  const imageExists = fileExists(expected.href.replace(/^\/+/, ""));

  if (
    !preload ||
    !imageExists ||
    attributeValue(preload, "media") !== expected.media ||
    attributeValue(preload, "fetchpriority").toLowerCase() !== "high"
  ) {
    console.error(`Homepage is missing the responsive LCP preload for ${expected.href}.`);
    process.exit(1);
  }
}

const homepageHeroImage = homepageHtml.match(
  /<img\b(?=[^>]*class=["'][^"']*\babout__image\b[^"']*["'])[^>]*>/i
)?.[0];

if (
  !homepageHeroImage ||
  attributeValue(homepageHeroImage, "loading").toLowerCase() !== "eager" ||
  attributeValue(homepageHeroImage, "fetchpriority").toLowerCase() !== "high"
) {
  console.error("Homepage LCP image must remain eager and high priority.");
  process.exit(1);
}

const homepageButtonTags = [...homepageHtml.matchAll(/<button\b[^>]*>/gi)].map(match => match[0]);
const homepageBurgerButton = homepageButtonTags.find(tag =>
  /\bdata-js-header-burger-button\b/i.test(tag)
);
const homepageBurgerClasses = attributeValue(homepageBurgerButton ?? "", "class").split(/\s+/);

if (!homepageBurgerButton || homepageBurgerClasses.includes("visible-mobile")) {
  console.error("Header burger must use its own responsive breakpoint without visible-mobile.");
  process.exit(1);
}

const requiredHomepageAssets = [
  "assets/images/common/rosa-logo-280.webp",
  "assets/images/common/rosa-logo-420.webp",
  "assets/icons/ui/burger-button/menu.svg",
  "assets/icons/ui/burger-button/close.svg",
  "assets/images/common/turnkey-og-image-card-400.webp",
  "assets/images/common/turnkey-og-image-card-800.webp",
  "assets/images/common/turnkey-og-image-card-1200.webp",
  "assets/images/common/airless-paint-card-400.webp",
  "assets/images/common/airless-paint-card-800.webp",
  "assets/images/common/airless-paint-card-1200.webp",
  "assets/images/soft-roofing/soft-roofing-card-400.webp",
  "assets/images/soft-roofing/soft-roofing-card-800.webp",
  "assets/images/biozashchita/ognebiozashchita-card-400.webp",
  "assets/images/biozashchita/ognebiozashchita-card-800.webp",
  "assets/images/portfolio/contact-form-mobile-900.webp",
];
const missingHomepageAssets = requiredHomepageAssets.filter(file => !fileExists(file));

if (missingHomepageAssets.length > 0) {
  console.error("Homepage optimized assets are missing:");
  console.error(missingHomepageAssets.map(file => `  - ${file}`).join("\n"));
  process.exit(1);
}

const homepageLogo = homepageHtml.match(
  /<img\b(?=[^>]*class=["'][^"']*\blogo__image\b[^"']*["'])[^>]*>/i
)?.[0];

if (
  !homepageLogo ||
  attributeValue(homepageLogo, "src") !== "/assets/images/common/rosa-logo-280.webp" ||
  attributeValue(homepageLogo, "width") !== "140" ||
  attributeValue(homepageLogo, "height") !== "24"
) {
  console.error("Homepage header must use the optimized 140x24 logo.");
  process.exit(1);
}

if (
  homepageHtml.includes("icons8-hamburger-button-50.png") ||
  homepageHtml.includes("icons8-close-window-50.png") ||
  !homepageHtml.includes("/assets/icons/ui/burger-button/menu.svg") ||
  !homepageHtml.includes("/assets/icons/ui/burger-button/close.svg")
) {
  console.error("Homepage burger must use its resolution-independent SVG icons.");
  process.exit(1);
}

const reviewScreenshotTags = [
  ...homepageHtml.matchAll(
    /<img\b(?=[^>]*class=["'][^"']*\breviews-card__screenshot\b[^"']*["'])[^>]*>/gi
  ),
].map(match => match[0]);

if (
  reviewScreenshotTags.length !== 6 ||
  reviewScreenshotTags.some(
    tag => attributeValue(tag, "width") !== "651" || attributeValue(tag, "height") !== "282"
  )
) {
  console.error("Homepage review screenshots must reserve their intrinsic 651x282 ratio.");
  process.exit(1);
}

console.log(
  `Astro production output check passed: ${baselineUrls.length} baseline URL files, ${criticalFiles.length} critical files, homepage CSS ${homepageCssRawBytes} raw / ${homepageCssGzipBytes} gzip bytes.`
);
