// analyze-bundle.js
import { readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicHtmlDir = resolve(__dirname, "public_html");

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function getFileSize(filePath) {
  try {
    const stats = statSync(filePath);
    return stats.size;
  } catch (e) {
    return 0;
  }
}

function analyzeDirectory(dir, prefix = "") {
  const items = readdirSync(dir, { withFileTypes: true });
  const results = [];

  for (const item of items) {
    const fullPath = join(dir, item.name);
    const relativePath = join(prefix, item.name);

    if (item.isDirectory()) {
      results.push(...analyzeDirectory(fullPath, relativePath));
    } else {
      const size = getFileSize(fullPath);
      results.push({ path: relativePath, size, type: getFileType(item.name) });
    }
  }

  return results;
}

function getFileType(filename) {
  if (filename.endsWith(".js")) return "JS";
  if (filename.endsWith(".css")) return "CSS";
  if (filename.endsWith(".woff2") || filename.endsWith(".woff")) return "Font";
  if (filename.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) return "Image";
  if (filename.endsWith(".mp4") || filename.endsWith(".webm")) return "Video";
  return "Other";
}

console.log("📦 Анализ размеров бандла\n");
console.log("=".repeat(60));

const assetsDir = join(publicHtmlDir, "assets");
const allFiles = analyzeDirectory(assetsDir);

// Группируем по типам
const byType = {};
let totalSize = 0;

allFiles.forEach(file => {
  if (!byType[file.type]) {
    byType[file.type] = { files: [], total: 0 };
  }
  byType[file.type].files.push(file);
  byType[file.type].total += file.size;
  totalSize += file.size;
});

// Сортируем файлы по размеру
Object.keys(byType).forEach(type => {
  byType[type].files.sort((a, b) => b.size - a.size);
});

// Выводим результаты
console.log("\n📊 Размеры по типам файлов:\n");
Object.entries(byType)
  .sort((a, b) => b[1].total - a[1].total)
  .forEach(([type, data]) => {
    console.log(`${type}: ${formatBytes(data.total)} (${data.files.length} файлов)`);
  });

console.log(`\n${"=".repeat(60)}`);
console.log(`\n📦 Общий размер: ${formatBytes(totalSize)}\n`);

// Детали по JS файлам
console.log("\n📜 JavaScript бандлы:\n");
const jsFiles = byType.JS?.files || [];
jsFiles.forEach(file => {
  const percentage = ((file.size / totalSize) * 100).toFixed(2);
  console.log(`  ${file.path.padEnd(50)} ${formatBytes(file.size).padStart(10)} (${percentage}%)`);
});

// Детали по CSS
console.log("\n🎨 CSS файлы:\n");
const cssFiles = byType.CSS?.files || [];
cssFiles.forEach(file => {
  const percentage = ((file.size / totalSize) * 100).toFixed(2);
  console.log(`  ${file.path.padEnd(50)} ${formatBytes(file.size).padStart(10)} (${percentage}%)`);
});

// Детали по шрифтам
console.log("\n🔤 Шрифты:\n");
const fontFiles = byType.Font?.files || [];
fontFiles.forEach(file => {
  const percentage = ((file.size / totalSize) * 100).toFixed(2);
  console.log(`  ${file.path.padEnd(50)} ${formatBytes(file.size).padStart(10)} (${percentage}%)`);
});

// Детали по изображениям (топ 10)
console.log("\n🖼️  Топ-10 изображений по размеру:\n");
const imageFiles = (byType.Image?.files || []).slice(0, 10);
imageFiles.forEach(file => {
  const percentage = ((file.size / totalSize) * 100).toFixed(2);
  console.log(`  ${file.path.padEnd(50)} ${formatBytes(file.size).padStart(10)} (${percentage}%)`);
});

// Детали по видео
console.log("\n🎬 Видео файлы:\n");
const videoFiles = byType.Video?.files || [];
videoFiles.forEach(file => {
  const percentage = ((file.size / totalSize) * 100).toFixed(2);
  console.log(`  ${file.path.padEnd(50)} ${formatBytes(file.size).padStart(10)} (${percentage}%)`);
});

// Рекомендации
console.log("\n" + "=".repeat(60));
console.log("\n💡 Рекомендации по оптимизации:\n");

const jsTotal = byType.JS?.total || 0;
const cssTotal = byType.CSS?.total || 0;
const imageTotal = byType.Image?.total || 0;
const videoTotal = byType.Video?.total || 0;

if (jsTotal > 500 * 1024) {
  console.log(`  ⚠️  JS бандлы (${formatBytes(jsTotal)}) превышают 500KB`);
  console.log("     - Рассмотрите tree-shaking для удаления неиспользуемого кода");
  console.log("     - Проверьте возможность lazy loading для некоторых модулей");
}

if (cssTotal > 200 * 1024) {
  console.log(`  ⚠️  CSS (${formatBytes(cssTotal)}) превышает 200KB`);
  console.log("     - Используйте PurgeCSS для удаления неиспользуемых стилей");
  console.log("     - Рассмотрите разделение CSS на критические и некритические стили");
}

if (imageTotal > 2 * 1024 * 1024) {
  console.log(`  ⚠️  Изображения (${formatBytes(imageTotal)}) превышают 2MB`);
  console.log("     - Оптимизируйте изображения (WebP, сжатие)");
  console.log("     - Используйте lazy loading для изображений");
}

if (videoTotal > 5 * 1024 * 1024) {
  console.log(`  ⚠️  Видео (${formatBytes(videoTotal)}) превышает 5MB`);
  console.log("     - Рассмотрите использование внешних сервисов (YouTube, Vimeo)");
  console.log("     - Используйте сжатие видео и разные форматы");
}

console.log("\n");
