#!/usr/bin/env node

/**
 * Генератор городских страниц для SK-ROSA
 *
 * Использует существующие страницы как шаблоны и генерирует
 * страницы для всех городов, заменяя плейсхолдеры.
 *
 * Запуск: node scripts/generator/generate-city-pages.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const SRC_PAGES = resolve(ROOT, 'src/pages');
const PUBLIC_PAGES = resolve(ROOT, 'public_html/pages');

// Загружаем данные
const cities = JSON.parse(readFileSync(resolve(__dirname, 'cities.json'), 'utf-8')).cities;
const services = JSON.parse(readFileSync(resolve(__dirname, 'services.json'), 'utf-8')).services;

// Базовый город для шаблонов
const TEMPLATE_CITY = {
  slug: 'balashikha',
  name: 'Балашиха',
  nameIn: 'Балашихе'
};

/**
 * Заменяет данные города в HTML
 */
function replaceCity(html, fromCity, toCity) {
  let result = html;

  // Заменяем slug в URL и путях
  result = result.replace(new RegExp(fromCity.slug, 'g'), toCity.slug);

  // Заменяем название города (именительный падеж)
  result = result.replace(new RegExp(fromCity.name, 'g'), toCity.name);

  // Заменяем "в Городе" (предложный падеж)
  result = result.replace(new RegExp(`в ${fromCity.nameIn}`, 'g'), `в ${toCity.nameIn}`);

  // Заменяем canonical URL
  result = result.replace(
    new RegExp(`sk-rosa\\.ru/([^/]+)/${fromCity.slug}`, 'g'),
    `sk-rosa.ru/$1/${toCity.slug}`
  );

  return result;
}

/**
 * Генерирует страницы для одной услуги
 */
function generateServicePages(service, outputDir = 'src') {
  const templatePath = resolve(SRC_PAGES, service.slug, `${TEMPLATE_CITY.slug}.html`);

  if (!existsSync(templatePath)) {
    console.error(`Template not found: ${templatePath}`);
    return 0;
  }

  const template = readFileSync(templatePath, 'utf-8');
  const outDir = outputDir === 'public'
    ? resolve(PUBLIC_PAGES, service.slug)
    : resolve(SRC_PAGES, service.slug);

  mkdirSync(outDir, { recursive: true });

  let generated = 0;

  cities.forEach(city => {
    // Пропускаем базовый город - его не нужно перегенерировать
    if (city.slug === TEMPLATE_CITY.slug) return;

    const html = replaceCity(template, TEMPLATE_CITY, city);
    const outPath = resolve(outDir, `${city.slug}.html`);

    writeFileSync(outPath, html, 'utf-8');
    generated++;
  });

  return generated;
}

/**
 * Генерирует все городские страницы
 */
function generateAll(outputDir = 'src') {
  console.log('Generating city pages...\n');

  let total = 0;

  services.forEach(service => {
    const count = generateServicePages(service, outputDir);
    console.log(`  ${service.name}: ${count} pages`);
    total += count;
  });

  console.log(`\nTotal: ${total} pages generated`);
  return total;
}

/**
 * Находит актуальное имя CSS файла с хешем
 */
function findCssFileName() {
  const cssDir = resolve(ROOT, 'public_html/assets/css');
  if (!existsSync(cssDir)) return '/assets/css/main.css';

  const files = readdirSync(cssDir).filter(f => f.startsWith('main-') && f.endsWith('.css'));
  if (files.length > 0) {
    return `/assets/css/${files[0]}`;
  }
  return '/assets/css/main.css';
}

/**
 * Генерирует страницы напрямую в public_html (для production build)
 */
function generateForBuild() {
  console.log('Generating city pages for production build...\n');

  // Находим актуальный CSS файл
  const cssPath = findCssFileName();
  console.log(`  Using CSS: ${cssPath}\n`);

  let total = 0;

  services.forEach(service => {
    const templatePath = resolve(SRC_PAGES, service.slug, `${TEMPLATE_CITY.slug}.html`);

    if (!existsSync(templatePath)) {
      console.error(`  Template not found: ${service.slug}/${TEMPLATE_CITY.slug}.html`);
      return;
    }

    // Читаем шаблон и сразу заменяем пути для production
    let template = readFileSync(templatePath, 'utf-8');

    // Заменяем пути на абсолютные для production (с актуальным именем CSS)
    template = template.replace(/\.\.\/\.\.\/\.\.\/styles\/main\.scss/g, cssPath);
    template = template.replace(/\.\.\/\.\.\/styles\/main\.scss/g, cssPath);
    template = template.replace(/\.\.\/styles\/main\.scss/g, cssPath);
    template = template.replace(/\.\.\/\.\.\/assets\//g, '/assets/');
    template = template.replace(/\.\.\/assets\//g, '/assets/');
    // Заменяем пути к скриптам
    template = template.replace(/\.\.\/\.\.\/scripts\//g, '/scripts/');
    template = template.replace(/\.\.\/scripts\//g, '/scripts/');

    const outDir = resolve(PUBLIC_PAGES, service.slug);
    mkdirSync(outDir, { recursive: true });

    let count = 0;

    cities.forEach(city => {
      const html = replaceCity(template, TEMPLATE_CITY, city);
      const outPath = resolve(outDir, `${city.slug}.html`);

      writeFileSync(outPath, html, 'utf-8');
      count++;
    });

    console.log(`  ${service.name}: ${count} pages`);
    total += count;
  });

  console.log(`\nTotal: ${total} pages generated to public_html/pages/`);
  return total;
}

/**
 * Очищает сгенерированные страницы (оставляет только шаблон)
 */
function clean() {
  console.log('Cleaning generated city pages...\n');

  let removed = 0;

  services.forEach(service => {
    const serviceDir = resolve(SRC_PAGES, service.slug);

    if (!existsSync(serviceDir)) return;

    const files = readdirSync(serviceDir).filter(f => f.endsWith('.html'));

    files.forEach(file => {
      // Не удаляем шаблон
      if (file === `${TEMPLATE_CITY.slug}.html`) return;

      const filePath = resolve(serviceDir, file);
      unlinkSync(filePath);
      removed++;
    });
  });

  console.log(`Removed ${removed} generated files`);
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'generate';

switch (command) {
  case 'generate':
  case 'gen':
    generateAll('src');
    break;

  case 'build':
    generateForBuild();
    break;

  case 'clean':
    clean();
    break;

  case 'help':
    console.log(`
Usage: node generate-city-pages.js [command]

Commands:
  generate, gen  Generate pages in src/pages/ (default)
  build          Generate pages directly to public_html/pages/ for production
  clean          Remove generated pages (keep templates)
  help           Show this help
`);
    break;

  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
