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
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const SRC_PAGES = resolve(ROOT, 'src/pages');
const PUBLIC_HTML = resolve(ROOT, 'public_html');

// Загружаем данные
const cities = JSON.parse(readFileSync(resolve(__dirname, 'cities.json'), 'utf-8')).cities;
const services = JSON.parse(readFileSync(resolve(__dirname, 'services.json'), 'utf-8')).services;
const complexesData = JSON.parse(readFileSync(resolve(__dirname, 'residential-complexes.json'), 'utf-8')).complexes;

// Базовый город для шаблонов
const TEMPLATE_CITY = {
  slug: 'balashikha',
  name: 'Балашиха',
  nameIn: 'Балашихе'
};

/**
 * Генерирует HTML-блок ЖК для города
 */
function buildComplexesBlock(cityName, cityNameIn) {
  const list = complexesData[cityName];
  if (!list || list.length === 0) {
    return '';
  }

  const items = list
    .map(name => `        <li class="city-complexes__item">${name}</li>`)
    .join('\n');

  return `      <section class="city-complexes">
        <div class="city-complexes__container">
          <h2 class="city-complexes__title">Новостройки в ${cityNameIn}, где мы работаем</h2>
          <p class="city-complexes__desc">Наши мастера выполняли работы в этих жилых комплексах — знаем особенности домов, застройщиков и типичные задачи.</p>
          <ul class="city-complexes__list">
${items}
          </ul>
        </div>
      </section>`;
}

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

  return result;
}

/**
 * Генерирует страницы для одной услуги
 * Файлы выводятся в src/pages/service-city.html (плоская структура, 2-й уровень URL)
 */
function generateServicePages(service) {
  const templatePath = resolve(SRC_PAGES, service.slug, `${TEMPLATE_CITY.slug}.html`);

  if (!existsSync(templatePath)) {
    console.error(`Template not found: ${templatePath}`);
    return 0;
  }

  const template = readFileSync(templatePath, 'utf-8');
  let generated = 0;

  cities.forEach(city => {
    let html = replaceCity(template, TEMPLATE_CITY, city);
    const complexesBlock = buildComplexesBlock(city.name, city.nameIn);
    html = html.replace('<!-- COMPLEXES_BLOCK -->', complexesBlock);
    const outPath = resolve(SRC_PAGES, `${service.slug}-${city.slug}.html`);

    writeFileSync(outPath, html, 'utf-8');
    generated++;
  });

  return generated;
}

/**
 * Генерирует все городские страницы
 */
function generateAll() {
  let total = 0;

  services.forEach(service => {
    const count = generateServicePages(service);
    total += count;
  });
  return total;
}

/**
 * Находит актуальное имя CSS файла с хешем
 */
function findCssFileName() {
  const cssDir = resolve(ROOT, 'public_html/assets/css');
if (!existsSync(cssDir)) { 
  return '/assets/css/main.css'; 

}

  const files = readdirSync(cssDir).filter(f => f.startsWith('main-') && f.endsWith('.css'));
  if (files.length > 0) {
    return `/assets/css/${files[0]}`;
  }
  return '/assets/css/main.css';
}

/**
 * Генерирует страницы напрямую в public_html (для production build)
 * Файлы выводятся в public_html/service-city.html (корень)
 */
function generateForBuild() {
  // Находим актуальный CSS файл
  const cssPath = findCssFileName();
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

    let count = 0;

    cities.forEach(city => {
      let html = replaceCity(template, TEMPLATE_CITY, city);
      const complexesBlock = buildComplexesBlock(city.name, city.nameIn);
      html = html.replace('<!-- COMPLEXES_BLOCK -->', complexesBlock);
      const outPath = resolve(PUBLIC_HTML, `${service.slug}-${city.slug}.html`);

      writeFileSync(outPath, html, 'utf-8');
      count++;
    });
    total += count;
  });
  return total;
}

/**
 * Очищает сгенерированные плоские страницы из src/pages/
 */
function clean() {
  let removed = 0;

  services.forEach(service => {
    const files = readdirSync(SRC_PAGES).filter(
      f => f.startsWith(`${service.slug}-`) && f.endsWith('.html')
    );

    files.forEach(file => {
      unlinkSync(resolve(SRC_PAGES, file));
      removed++;
    });
  });
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'generate';

switch (command) {
  case 'generate':
  case 'gen':
    generateAll();
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
  build          Generate pages directly to public_html/ for production
  clean          Remove generated pages (keep templates)
  help           Show this help
`);
    break;

  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
