import process from "node:process";
import citiesData from "./directus-cache/cities.json";
import complexesData from "./directus-cache/residential-complexes.json";
import { plasteringPage } from "./plastering.js";

const citySlugsFilter = (process.env.ASTRO_PLASTERING_CITY_SLUGS ?? "")
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
  throw new Error(`Unknown ASTRO_PLASTERING_CITY_SLUGS value(s): ${missingCitySlugs.join(", ")}`);
}

export const plasteringCitySlugs = selectedCities.map(city => city.slug);

function localizeAdvantages(city) {
  return plasteringPage.advantages.map(item => {
    if (item.value !== "7+") {
      return item;
    }

    return {
      ...item,
      description: `лет опыта - работаем на рынке ремонта в ${city.nameIn} и Московской области`,
    };
  });
}

function citySeo(city) {
  const canonical = `https://sk-rosa.ru/plastering-${city.slug}`;

  return {
    title: `Штукатурка стен в ${city.nameIn} — гипсовая и цементная под ключ | ROSA`,
    description: `Машинная штукатурка стен в ${city.nameIn} и Московской области. От 450 ₽/м². Гипсовая и цементная штукатурка под ключ. ➤ 7+ лет опыта ➤ Гарантия 3 года ➤ Бесплатный замер. ☎ 8 (985) 135-49-91`,
    canonical,
    ogTitle: `Штукатурные работы в ${city.nameIn} | ROSA — Машинная штукатурка под ключ`,
    ogDescription: `Профессиональная штукатурка стен в ${city.nameIn}. Гипсовая и цементная штукатурка по маякам, машинное нанесение. Гарантия 3 года, договор с фиксированной ценой.`,
    ogImageAlt: `Штукатурные работы в ${city.nameIn} - ROSA`,
  };
}

function serviceJsonLd(city, seo) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${seo.canonical}#service`,
    url: seo.canonical,
    serviceType: "Штукатурные работы",
    name: `Штукатурка стен в ${city.nameIn}`,
    description: `Машинная штукатурка стен в ${city.nameIn} и Московской области. Гипсовая и цементная штукатурка по маякам, фасады. Гарантия 3 года, договор с фиксированной ценой.`,
    provider: {
      "@type": "LocalBusiness",
      name: "ROSA - Ремонт под ключ",
      "@id": "https://sk-rosa.ru/#business",
    },
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Московская область",
      },
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: seo.canonical,
      servicePhone: "+79851354991",
      serviceSmsNumber: "+79851354991",
      availableLanguage: "Russian",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "450",
        priceCurrency: "RUB",
        unitCode: "MTK",
        unitText: "м²",
      },
      availability: "https://schema.org/InStock",
      url: seo.canonical,
    },
  };
}

function buildCityPage(city) {
  const seo = citySeo(city);

  return {
    ...plasteringPage,
    city,
    seo,
    jsonLd: serviceJsonLd(city, seo),
    complexes: complexesData.complexes[city.name] ?? [],
    hero: {
      ...plasteringPage.hero,
      title: `Механизированная штукатурка стен в ${city.nameIn}`,
      subtitle: `Гипсовая и цементная штукатурка под покраску, обои и плитку - ровно по маякам, по договору с фиксированной ценой. Работаем в ${city.nameIn} и Московской области.`,
    },
    advantages: localizeAdvantages(city),
    contact: {
      ...plasteringPage.contact,
      comments: `Заявка на штукатурные работы в ${city.nameIn}`,
      formSource: `Штукатурные работы (${city.name})`,
    },
    priceCalc: {
      ...plasteringPage.priceCalc,
      quizFormSource: `Калькулятор штукатурки (${city.name})`,
      miniCalcFormSource: `Мини-калькулятор штукатурки (${city.name})`,
    },
    runtime: {
      callBannerComments: `Заявка с баннера (10 сек) — ${city.name}`,
      callBannerSource: `Баннер 10 секунд (${city.name})`,
    },
    textBlock: {
      title: `Механизированная штукатурка стен под ключ в ${city.nameIn}`,
      subtitle: "Гипсовая и цементная штукатурка - от замера до сдачи под чистовую отделку",
      paragraphs: [
        `Основные наши заказчики - владельцы квартир в новостройках, частных домов и коммерческих объектов: коттеджей, офисов, магазинов и небольших производств. Машинная подача смеси через штукатурную станцию даёт скорость до 200 м² за смену - выгодно на крупных объёмах.`,
        `Гипсовая штукатурка - выбор для квартир, офисов и спален: даёт гладкую поверхность под покраску и обои, дышит, не нагружает перекрытия. Цементная штукатурка прочнее и не боится влаги - её ставим в ванных, кухнях, подвалах, гаражах и на фасадах. На замере бесплатно подскажем, какая смесь подойдёт под ваш объект.`,
        `Работаем штукатурными станциями PFT и Kaleta: смесь готовим прямо у объекта и подаём шлангом на этаж - без вёдер и грязи в подъезде. Геометрию выводим строго по маякам, а объём, сроки и цену фиксируем в договоре до начала работ. За 7 лет сдали 150+ объектов в ${city.nameIn} и Московской области.`,
      ],
    },
    service: {
      slug: "plastering",
      name: "Штукатурные работы",
      advantagesTitle: "Преимущества штукатурных работ",
      advantagesCtaLabel: "Цены на штукатурные работы",
      taskListTitle: "Штукатурим любые стены - под любые задачи",
      pricingTitle: "Цены на штукатурные работы",
      pricingContainerId: "pricing-table-container",
    },
  };
}

export const plasteringCityPages = selectedCities.map(city => ({
  route: `plastering-${city.slug}`,
  page: buildCityPage(city),
}));
