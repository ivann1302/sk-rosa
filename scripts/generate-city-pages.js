/**
 * Скрипт для генерации посадочных страниц услуг для городов МО
 * Использование: node scripts/generate-city-pages.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, '../src/pages');

// Конфигурация городов (slug и название в разных падежах)
const cities = [
  { slug: 'mytishchi', name: 'Мытищи', prepositional: 'Мытищах', genitive: 'Мытищ' },
  { slug: 'odintsovo', name: 'Одинцово', prepositional: 'Одинцово', genitive: 'Одинцово' },
  { slug: 'khimki', name: 'Химки', prepositional: 'Химках', genitive: 'Химок' },
  { slug: 'balashikha', name: 'Балашиха', prepositional: 'Балашихе', genitive: 'Балашихи' },
  { slug: 'dolgoprudny', name: 'Долгопрудный', prepositional: 'Долгопрудном', genitive: 'Долгопрудного' },
  { slug: 'krasnogorsk', name: 'Красногорск', prepositional: 'Красногорске', genitive: 'Красногорска' },
  { slug: 'lyubertsy', name: 'Люберцы', prepositional: 'Люберцах', genitive: 'Люберец' },
  { slug: 'podolsk', name: 'Подольск', prepositional: 'Подольске', genitive: 'Подольска' },
  { slug: 'reutov', name: 'Реутов', prepositional: 'Реутове', genitive: 'Реутова' },
  { slug: 'sergiev-posad', name: 'Сергиев Посад', prepositional: 'Сергиевом Посаде', genitive: 'Сергиева Посада' },
  { slug: 'noginsk', name: 'Ногинск', prepositional: 'Ногинске', genitive: 'Ногинска' },
  { slug: 'elektrostal', name: 'Электросталь', prepositional: 'Электростали', genitive: 'Электростали' },
  { slug: 'korolev', name: 'Королёв', prepositional: 'Королёве', genitive: 'Королёва' }
];

// Конфигурация услуг
const services = [
  {
    slug: 'turnkey-repair',
    name: 'Ремонт под ключ',
    titleTemplate: 'Ремонт под ключ в {city}',
    descTemplate: 'Ремонт квартир и домов под ключ в {city}. Полный комплекс работ от демонтажа до чистовой отделки. Официальный договор, гарантия качества, фиксированные цены. Бесплатный замер. Звоните: +7 (985) 135-49-91',
    keywordsTemplate: 'ремонт под ключ, ремонт квартир под ключ, ремонт домов, {cityName}, комплексный ремонт, отделочные работы, ремонт с гарантией',
    h1Template: 'Ремонт квартир и домов под ключ<br> в {city}',
    jsonLdName: 'Ремонт квартир и домов под ключ',
    jsonLdDesc: 'Ремонт квартир и домов под ключ в {city}. Полный комплекс работ от демонтажа до чистовой отделки. Официальный договор, гарантия качества, фиксированные цены.'
  },
  {
    slug: 'plastering',
    name: 'Штукатурные работы',
    titleTemplate: 'Штукатурные работы в {city}',
    descTemplate: 'Профессиональные штукатурные работы в {city}. Штукатурка стен и потолков, выравнивание поверхностей. Качественные материалы, гарантия качества. Бесплатный замер. Звоните: +7 (985) 135-49-91',
    keywordsTemplate: 'штукатурные работы, штукатурка стен, штукатурка потолков, выравнивание стен, {cityName}, штукатурка цена',
    h1Template: 'Штукатурные работы<br> в {city}',
    jsonLdName: 'Штукатурные работы',
    jsonLdDesc: 'Профессиональные штукатурные работы в {city}. Штукатурка стен и потолков, выравнивание поверхностей. Качественные материалы, гарантия качества.'
  },
  {
    slug: 'airless-painting',
    name: 'Безвоздушная покраска',
    titleTemplate: 'Безвоздушная покраска в {city}',
    descTemplate: 'Профессиональная безвоздушная покраска в {city}. Покраска стен, потолков, фасадов. Качественное нанесение краски, ровное покрытие. Гарантия качества. Звоните: +7 (985) 135-49-91',
    keywordsTemplate: 'безвоздушная покраска, покраска стен, покраска потолков, {cityName}, покраска фасадов, профессиональная покраска',
    h1Template: 'Безвоздушная покраска<br> в {city}',
    jsonLdName: 'Безвоздушная покраска',
    jsonLdDesc: 'Профессиональная безвоздушная покраска в {city}. Покраска стен, потолков, фасадов. Качественное нанесение краски, ровное покрытие.'
  },
  {
    slug: 'floor-screed',
    name: 'Стяжка пола',
    titleTemplate: 'Стяжка пола в {city}',
    descTemplate: 'Профессиональная стяжка пола в {city}. Выравнивание пола, подготовка основания под финишное покрытие. Качественные материалы, гарантия качества. Звоните: +7 (985) 135-49-91',
    keywordsTemplate: 'стяжка пола, выравнивание пола, {cityName}, полусухая стяжка, мокрая стяжка, цена стяжки',
    h1Template: 'Стяжка пола<br> в {city}',
    jsonLdName: 'Стяжка пола',
    jsonLdDesc: 'Профессиональная стяжка пола в {city}. Выравнивание пола, подготовка основания под финишное покрытие. Качественные материалы, гарантия качества.'
  }
];

/**
 * Генерация страницы для конкретного города и услуги
 */
function generatePage(service, city) {
  const baseFilePath = resolve(srcDir, `${service.slug}.html`);

  if (!existsSync(baseFilePath)) {
    console.warn(`⚠️  Базовый файл не найден: ${baseFilePath}`);
    return;
  }

  // Читаем базовую страницу
  let content = readFileSync(baseFilePath, 'utf-8');

  // Замены для города
  const cityInPrep = city.prepositional; // в Мытищах
  const cityName = city.name; // Мытищи
  const cityGenitive = city.genitive; // Мытищ (родительный падеж)

  // 1. Title
  content = content.replace(
    /<title>.*?<\/title>/,
    `<title>${service.titleTemplate.replace('{city}', cityInPrep)} | ROSA - Профессиональный ремонт</title>`
  );

  // 2. Description
  content = content.replace(
    /<meta\s+name="description"\s+content="[^"]*"/,
    `<meta name="description" content="${service.descTemplate.replace('{city}', cityInPrep)}"`
  );

  // 3. Keywords
  content = content.replace(
    /<meta\s+name="keywords"\s+content="[^"]*"/,
    `<meta name="keywords" content="${service.keywordsTemplate.replace('{cityName}', cityName)}"`
  );

  // 4. Canonical URL
  content = content.replace(
    /<link rel="canonical" href="https:\/\/sk-rosa\.ru\/[^"]*"/,
    `<link rel="canonical" href="https://sk-rosa.ru/${service.slug}/${city.slug}"`
  );

  // 5. Open Graph title
  content = content.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"/,
    `<meta property="og:title" content="${service.titleTemplate.replace('{city}', cityInPrep)} | ROSA - Профессиональный ремонт"`
  );

  // 6. Open Graph description
  content = content.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"/,
    `<meta property="og:description" content="${service.descTemplate.replace('{city}', cityInPrep).substring(0, 200)}"`
  );

  // 7. Open Graph URL
  content = content.replace(
    /<meta property="og:url" content="https:\/\/sk-rosa\.ru\/[^"]*"/,
    `<meta property="og:url" content="https://sk-rosa.ru/${service.slug}/${city.slug}"`
  );

  // 8. Open Graph image alt
  content = content.replace(
    /<meta property="og:image:alt" content="[^"]*"/,
    `<meta property="og:image:alt" content="${service.name} в ${cityInPrep} - ROSA"`
  );

  // 9. Пути к ресурсам (../ → ../../)
  content = content.replace(/href="\.\.\/assets\//g, 'href="../../assets/');
  content = content.replace(/src="\.\.\/assets\//g, 'src="../../assets/');
  content = content.replace(/src="\.\.\/scripts\//g, 'src="../../scripts/');
  content = content.replace(/href="\.\.\/\.\.\/styles\/main\.scss"/g, 'href="../../../styles/main.scss"');
  // Замена путей внутри srcset (могут быть с пробелами и переносами)
  content = content.replace(/(\s)\.\.\/assets\//g, '$1../../assets/');

  // 10. JSON-LD description
  content = content.replace(
    /"description":\s*"[^"]*",/,
    `"description": "${service.jsonLdDesc.replace('{city}', cityInPrep)}",`
  );

  // 11. JSON-LD areaServed (заменяем блок с Москвой на конкретный город)
  const areaServedReplacement = `"areaServed": {
          "@type": "City",
          "name": "${cityName}",
          "containedInPlace": {
            "@type": "State",
            "name": "Московская область"
          }
        },`;

  content = content.replace(
    /"areaServed":\s*\[[^\]]*\],/s,
    areaServedReplacement
  );

  // 12. JSON-LD serviceUrl
  content = content.replace(
    /"serviceUrl":\s*"https:\/\/sk-rosa\.ru\/[^"]*"/g,
    `"serviceUrl": "https://sk-rosa.ru/${service.slug}/${city.slug}"`
  );

  // 13. JSON-LD offers url
  content = content.replace(
    /"url":\s*"https:\/\/sk-rosa\.ru\/[^"]*"/g,
    `"url": "https://sk-rosa.ru/${service.slug}/${city.slug}"`
  );

  // 14. H1 заголовок (ищем по классу, специфичному для каждой услуги)
  const h1Patterns = [
    { regex: /<h1 class="about-turnkey__title">.*?<\/h1>/s, replacement: `<h1 class="about-turnkey__title">${service.h1Template.replace('{city}', cityInPrep)}</h1>` },
    { regex: /<h1 class="plastering-hero__title">.*?<\/h1>/s, replacement: `<h1 class="plastering-hero__title">${service.h1Template.replace('{city}', cityInPrep)}</h1>` },
    { regex: /<h1 class="painting-hero__title">.*?<\/h1>/s, replacement: `<h1 class="painting-hero__title">${service.h1Template.replace('{city}', cityInPrep)}</h1>` },
    { regex: /<h1 class="screed-hero__title">.*?<\/h1>/s, replacement: `<h1 class="screed-hero__title">${service.h1Template.replace('{city}', cityInPrep)}</h1>` },
    { regex: /<h1[^>]*>.*?<\/h1>/s, replacement: `<h1>${service.h1Template.replace('{city}', cityInPrep)}</h1>` } // fallback
  ];

  for (const pattern of h1Patterns) {
    if (pattern.regex.test(content)) {
      content = content.replace(pattern.regex, pattern.replacement);
      break;
    }
  }

  // 15. Добавляем ссылку "Где работаем?" в футер (если её ещё нет)
  if (!content.includes('Где работаем?')) {
    content = content.replace(
      /(<li><a href="plastering\.html">Штукатурные работы<\/a><\/li>)/,
      '$1\n              <li><a href="where-we-work.html">Где работаем?</a></li>'
    );
  }

  // 16. Breadcrumbs (добавляем город в конец, если есть BreadcrumbList)
  if (content.includes('"@type": "BreadcrumbList"')) {
    content = content.replace(
      /("name":\s*"[^"]*",\s*"item":\s*"https:\/\/sk-rosa\.ru\/[^"]*")\s*\}/s,
      `$1
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "${cityName}",
            "item": "https://sk-rosa.ru/${service.slug}/${city.slug}"
          }`
    );
  }

  // 17. Замена упоминаний "Москвы и МО" на конкретный город
  content = content.replace(
    /Москвы и МО/g,
    `${cityGenitive} и Московской области`
  );
  content = content.replace(
    /Москве и МО/g,
    `${cityInPrep} и Московской области`
  );

  // Создаем папку для услуги, если не существует
  const serviceDir = resolve(srcDir, service.slug);
  if (!existsSync(serviceDir)) {
    mkdirSync(serviceDir, { recursive: true });
  }

  // Сохраняем файл
  const outputPath = resolve(serviceDir, `${city.slug}.html`);
  writeFileSync(outputPath, content, 'utf-8');

  console.log(`✅ ${service.slug}/${city.slug}.html`);
}

/**
 * Основная функция
 */
function main() {
  console.log('🚀 Генерация посадочных страниц для городов...\n');

  let total = 0;

  services.forEach(service => {
    console.log(`\n📄 ${service.name}:`);
    cities.forEach(city => {
      generatePage(service, city);
      total++;
    });
  });

  console.log(`\n✨ Готово! Создано ${total} страниц.\n`);
  console.log('📝 Следующий шаг: обновите vite.config.js для добавления новых entry points');
}

main();
