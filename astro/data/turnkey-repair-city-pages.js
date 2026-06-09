import process from "node:process";
import citiesData from "./directus-cache/cities.json";
import complexesData from "./directus-cache/residential-complexes.json";
import { buildLocalServiceContent } from "./local-service-content.js";
import { turnkeyRepairPage } from "./turnkey-repair.js";
import { serviceJsonLd as buildServiceJsonLd } from "../lib/seo.js";

const citySlugsFilter = (process.env.ASTRO_TURNKEY_REPAIR_CITY_SLUGS ?? "")
  .split(",")
  .map(slug => slug.trim())
  .filter(Boolean);

const selectedCities =
  citySlugsFilter.length > 0
    ? citiesData.cities.filter(city => citySlugsFilter.includes(city.slug))
    : citiesData.cities;

const selectedCitySlugs = new Set(selectedCities.map(city => city.slug));
const missingCitySlugs = citySlugsFilter.filter(slug => !selectedCitySlugs.has(slug));

if (missingCitySlugs.length > 0) {
  throw new Error(
    `Unknown ASTRO_TURNKEY_REPAIR_CITY_SLUGS value(s): ${missingCitySlugs.join(", ")}`,
  );
}

export const turnkeyRepairCitySlugs = selectedCities.map(city => city.slug);

function citySeo(city) {
  const canonical = `https://sk-rosa.ru/turnkey-repair-${city.slug}`;

  return {
    title: `Ремонт под ключ в ${city.nameIn} | ROSA`,
    description: `Ремонт квартир, домов и коммерческих помещений в ${city.nameIn}. Демонтаж, черновая и чистовая отделка, договор, гарантия 3 года.`,
    canonical,
    ogTitle: `Ремонт под ключ в ${city.nameIn} | ROSA — Профессиональный ремонт квартир`,
    ogDescription: `Ремонт квартир и домов под ключ в ${city.nameIn}. Полный комплекс работ от демонтажа до чистовой отделки. Официальный договор, гарантия качества.`,
    ogImageAlt: `Ремонт под ключ в ${city.nameIn} - ROSA`,
  };
}

function serviceJsonLd(city, seo) {
  return buildServiceJsonLd({
    canonical: seo.canonical,
    serviceType: "Ремонт под ключ",
    name: `Ремонт под ключ в ${city.nameIn}`,
    description: `Ремонт квартир и домов под ключ в ${city.nameIn}. Полный комплекс работ от демонтажа до чистовой отделки. Официальный договор, гарантия качества, фиксированные цены.`,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Московская область",
      },
    },
    minPrice: "10000",
    maxPrice: "20000",
  });
}

function buildCityPage(city) {
  const seo = citySeo(city);
  const complexes = complexesData.complexes[city.name] ?? [];
  const localContent = buildLocalServiceContent({
    city,
    serviceSlug: "turnkey-repair",
    complexes,
  });

  return {
    ...turnkeyRepairPage,
    city,
    seo,
    jsonLd: serviceJsonLd(city, seo),
    complexes,
    localContent,
    faq: [...turnkeyRepairPage.faq, ...localContent.faq],
    hero: {
      ...turnkeyRepairPage.hero,
      title: `Ремонт квартир, домов и коммерческих помещений под ключ в ${city.nameIn}`,
      subtitle: `Полный цикл работ от демонтажа до чистовой отделки. Работаем в ${city.nameIn} и Московской области по договору, фиксируем смету и сроки.`,
    },
    contact: {
      ...turnkeyRepairPage.contact,
      comments: `Заявка на бесплатную консультацию — ${city.name}`,
      formSource: `Ремонт под ключ - Консультация (${city.name})`,
    },
    priceCalc: {
      ...turnkeyRepairPage.priceCalc,
      quizFormSource: `Квиз-смета ремонта под ключ (${city.name})`,
      miniCalcFormSource: `Мини-калькулятор ремонта под ключ (${city.name})`,
    },
    runtime: {
      ...turnkeyRepairPage.runtime,
      callBannerComments: `Заявка с баннера (10 сек) — ${city.name}`,
      callBannerSource: `Баннер 10 секунд (${city.name})`,
    },
    textBlock: {
      ...turnkeyRepairPage.textBlock,
      title: `Ремонт под ключ в ${city.nameIn}`,
      paragraphs: [
        `Нужен качественный ремонт квартиры или дома в ${city.nameIn} без головной боли? Выполним весь комплекс работ — от проектирования и демонтажа до финишной отделки и уборки.`,
        "Работаем с новостройками, вторичным жильём, домами и коммерческими помещениями. Используем проверенные материалы, соблюдаем строительные нормы и ведём фотоотчёт по этапам.",
        `Стоимость, сроки, состав работ и порядок оплаты фиксируем в договоре. Бесплатно выезжаем на объект в ${city.nameIn}, делаем замер и готовим смету без скрытых доплат.`,
      ],
    },
  };
}

export const turnkeyRepairCityPages = selectedCities.map(city => ({
  route: `turnkey-repair-${city.slug}`,
  page: buildCityPage(city),
}));
