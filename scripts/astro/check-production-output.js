import fs from "node:fs";
import path from "node:path";
import process from "node:process";

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

const baselineUrls = fs
  .readFileSync(baselinePath, "utf8")
  .trim()
  .split(/\n+/)
  .filter(Boolean);

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

console.log(
  `Astro production output check passed: ${baselineUrls.length} baseline URL files and ${criticalFiles.length} critical files present.`,
);
