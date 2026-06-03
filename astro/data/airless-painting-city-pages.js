import process from "node:process";
import citiesData from "./directus-cache/cities.json";
import complexesData from "./directus-cache/residential-complexes.json";
import { airlessPaintingPage } from "./airless-painting.js";
import { buildLocalServiceContent } from "./local-service-content.js";

const citySlugsFilter = (process.env.ASTRO_AIRLESS_PAINTING_CITY_SLUGS ?? "")
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
    `Unknown ASTRO_AIRLESS_PAINTING_CITY_SLUGS value(s): ${missingCitySlugs.join(", ")}`,
  );
}

export const airlessPaintingCitySlugs = selectedCities.map(city => city.slug);

function localizeAdvantages(city) {
  return airlessPaintingPage.advantages.map(item => {
    if (item.value !== "7+") {
      return item;
    }

    return {
      ...item,
      description: `лет опыта — работаем на рынке ремонта в ${city.nameIn} и Московской области`,
    };
  });
}

function citySeo(city) {
  const canonical = `https://sk-rosa.ru/airless-painting-${city.slug}`;

  return {
    title: `Безвоздушная покраска в ${city.nameIn} — от 200 руб/м² | ROSA`,
    description: `Безвоздушная покраска стен и потолков в ${city.nameIn} и Московской области. Цена от 200 руб/м². ➤ 7+ лет опыта ➤ Гарантия 2 года ➤ Бесплатный замер. ☎ 8 (985) 135-49-91`,
    canonical,
    ogTitle: `Безвоздушная покраска в ${city.nameIn} | ROSA — Покраска стен и потолков`,
    ogDescription: `Профессиональная безвоздушная покраска в ${city.nameIn}. Покраска стен, потолков и фасадов без разводов и подтеков. Гарантия результата.`,
    ogImageAlt: `Безвоздушная покраска в ${city.nameIn} - ROSA`,
  };
}

function serviceJsonLd(city, seo) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${seo.canonical}#service`,
    url: seo.canonical,
    serviceType: "Безвоздушная покраска",
    name: `Безвоздушная покраска в ${city.nameIn}`,
    description: `Профессиональная безвоздушная покраска стен и потолков в ${city.nameIn} и Московской области. Качественное нанесение краски, ровное покрытие, гарантия результата.`,
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
        price: "200",
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
  const complexes = complexesData.complexes[city.name] ?? [];
  const localContent = buildLocalServiceContent({
    city,
    serviceSlug: "airless-painting",
    complexes,
  });

  return {
    ...airlessPaintingPage,
    city,
    seo,
    jsonLd: serviceJsonLd(city, seo),
    complexes,
    localContent,
    faq: [...airlessPaintingPage.faq, ...localContent.faq],
    hero: {
      ...airlessPaintingPage.hero,
      title: `Безвоздушная покраска стен и потолков в ${city.nameIn}`,
      subtitle: `Машинная покраска стен, потолков и фасадов — равномерно, без подтёков и разводов, в 5–10 раз быстрее валика. По договору с фиксированной ценой, в ${city.nameIn} и Московской области.`,
    },
    advantages: localizeAdvantages(city),
    contact: {
      ...airlessPaintingPage.contact,
      comments: `Заявка на безвоздушную покраску в ${city.nameIn}`,
      formSource: `Безвоздушная покраска (${city.name})`,
    },
    priceCalc: {
      ...airlessPaintingPage.priceCalc,
      quizFormSource: `Квиз-смета безвоздушной покраски (${city.name})`,
      miniCalcFormSource: `Мини-калькулятор покраски (${city.name})`,
    },
    runtime: {
      ...airlessPaintingPage.runtime,
      callBannerComments: `Заявка с баннера (10 сек) — ${city.name}`,
      callBannerSource: `Баннер 10 секунд (${city.name})`,
    },
    textBlock: {
      ...airlessPaintingPage.textBlock,
      title: `Безвоздушная покраска стен и потолков под ключ в ${city.nameIn}`,
      paragraphs: [
        "Основные наши заказчики — владельцы квартир в новостройках, частных домов, офисов и коммерческих помещений: магазинов, шоурумов, складов и производств. Безвоздушная технология даёт скорость до 200–400 м² за смену и заметную экономию краски — выгодно на крупных объёмах. Аппаратом Graco под высоким давлением краска ложится равномерным факелом без следов валика и кисти, без полос и наплывов на сложных переходах.",
        `Перед покраской бесплатно оцениваем основание: если стены ровные и зашпаклёваны — сразу красим, если есть дефекты — даём смету на подготовку. Объём, материал, сроки и цену фиксируем в договоре до начала работ — доплат в процессе не будет, на покраску даём 2 года гарантии на адгезию и качество. За 7 лет покрасили 150+ объектов в ${city.nameIn} и Московской области.`,
      ],
    },
  };
}

export const airlessPaintingCityPages = selectedCities.map(city => ({
  route: `airless-painting-${city.slug}`,
  page: buildCityPage(city),
}));
