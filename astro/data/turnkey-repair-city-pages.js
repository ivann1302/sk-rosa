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
    title: `Ремонт под ключ в ${city.nameIn} от 10 000 ₽/м² | ROSA`,
    description: `Ремонт квартир, домов и коммерческих помещений в ${city.nameIn}. От 10 000 ₽/м², смета, договор, поэтапные акты и гарантия.`,
    canonical,
    ogTitle: `Ремонт под ключ в ${city.nameIn} | ROSA — Профессиональный ремонт квартир`,
    ogDescription: `Ремонт квартир и домов под ключ в ${city.nameIn}: от 10 000 ₽/м², полный цикл работ, договор, акты и гарантия.`,
    ogImageAlt: `Ремонт под ключ в ${city.nameIn} - ROSA`,
  };
}

function serviceJsonLd(city, seo) {
  return buildServiceJsonLd({
    canonical: seo.canonical,
    serviceType: "Ремонт под ключ",
    name: `Ремонт под ключ в ${city.nameIn}`,
    description: `Ремонт квартир и домов под ключ в ${city.nameIn}. Полный комплекс работ от демонтажа до чистовой отделки. Официальный договор, акты, гарантия качества и фиксированные цены.`,
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
    faqDescription: localContent.faqDescription,
    hero: {
      ...turnkeyRepairPage.hero,
      title: `Ремонт квартир, домов и коммерческих помещений под ключ в ${city.nameIn}`,
      subtitle: `Ремонт под ключ в ${city.nameIn} — это полный цикл работ от демонтажа и инженерии до чистовой отделки, уборки и передачи готового объекта. Ориентир по работам — от 10 000 ₽/м²; смету, сроки, этапы оплаты и сдачу фиксируем в договоре и актах.`,
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
        `Ремонт под ключ в ${city.nameIn} подходит, когда заказчику нужен один подрядчик на весь цикл: демонтаж, черновые работы, электрика, сантехника, стяжка, штукатурка, шпаклёвка, покраска, укладка покрытий, установка дверей и финальная уборка.`,
        "Работаем с новостройками, вторичным жильём, частными домами, офисами и коммерческими помещениями. По каждому объекту составляем смету с перечнем работ, материалов и этапов, чтобы бюджет был понятен до старта.",
        "Ориентир по стоимости работ начинается от 10 000 ₽/м² для косметического ремонта, от 15 000 ₽/м² для капитального и от 20 000 ₽/м² для ремонта с материалами. Итог зависит от площади, состояния объекта, инженерии, дизайн-решений и уровня чистовой отделки.",
        "Сроки, состав работ, порядок оплаты и гарантию фиксируем в договоре. Работы принимаются поэтапно: после каждого этапа можно подписать акт, а финальная сдача закрывается актом выполненных работ.",
      ],
    },
  };
}

export const turnkeyRepairCityPages = selectedCities.map(city => ({
  route: `turnkey-repair-${city.slug}`,
  page: buildCityPage(city),
}));
