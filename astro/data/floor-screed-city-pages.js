import process from "node:process";
import citiesData from "./directus-cache/cities.json";
import complexesData from "./directus-cache/residential-complexes.json";
import { floorScreedPage } from "./floor-screed.js";
import { buildLocalServiceContent } from "./local-service-content.js";
import { serviceJsonLd as buildServiceJsonLd } from "../lib/seo.js";

const citySlugsFilter = (process.env.ASTRO_FLOOR_SCREED_CITY_SLUGS ?? "")
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
    `Unknown ASTRO_FLOOR_SCREED_CITY_SLUGS value(s): ${missingCitySlugs.join(", ")}`,
  );
}

export const floorScreedCitySlugs = selectedCities.map(city => city.slug);

function localizeAdvantages(city) {
  return floorScreedPage.advantages.map(item => {
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
  const canonical = `https://sk-rosa.ru/floor-screed-${city.slug}`;

  return {
    title: `Стяжка пола в ${city.nameIn} от 900 ₽/м² | ROSA`,
    description: `Полусухая и цементная стяжка пола в ${city.nameIn}. От 900 ₽/м², лазерный контроль, гарантия 3 года, бесплатный замер.`,
    canonical,
    ogTitle: `Стяжка пола в ${city.nameIn} | ROSA — Профессиональная стяжка под ключ`,
    ogDescription: `Профессиональная стяжка пола в ${city.nameIn}. Полусухая и цементная стяжка, лазерный контроль ровности. Гарантия 3 года, договор с фиксированной ценой.`,
    ogImageAlt: `Стяжка пола в ${city.nameIn} - ROSA`,
  };
}

function serviceJsonLd(city, seo) {
  return buildServiceJsonLd({
    canonical: seo.canonical,
    serviceType: "Стяжка пола",
    name: `Стяжка пола в ${city.nameIn}`,
    description: `Механизированная стяжка пола в ${city.nameIn} и Московской области. Полусухая и цементная стяжка, лазерный контроль ровности. Гарантия 3 года, договор с фиксированной ценой.`,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Московская область",
      },
    },
    price: "900",
  });
}

function buildCityPage(city) {
  const seo = citySeo(city);
  const complexes = complexesData.complexes[city.name] ?? [];
  const localContent = buildLocalServiceContent({
    city,
    serviceSlug: "floor-screed",
    complexes,
  });

  return {
    ...floorScreedPage,
    city,
    seo,
    jsonLd: serviceJsonLd(city, seo),
    complexes,
    localContent,
    faq: [...floorScreedPage.faq, ...localContent.faq],
    hero: {
      ...floorScreedPage.hero,
      title: `Механизированная стяжка пола в ${city.nameIn}`,
      subtitle: `Полусухая и цементная стяжка под любое покрытие — ровно, с лазерным контролем уровня, по договору с фиксированной ценой. Работаем в ${city.nameIn} и Московской области.`,
    },
    advantages: localizeAdvantages(city),
    contact: {
      ...floorScreedPage.contact,
      comments: `Заявка на стяжку пола в ${city.nameIn}`,
      formSource: `Стяжка пола (${city.name})`,
    },
    priceCalc: {
      ...floorScreedPage.priceCalc,
      quizFormSource: `Квиз-смета стяжки пола (${city.name})`,
      miniCalcFormSource: `Мини-калькулятор стяжки (${city.name})`,
    },
    runtime: {
      ...floorScreedPage.runtime,
      callBannerComments: `Заявка с баннера (10 сек) — ${city.name}`,
      callBannerSource: `Баннер 10 секунд (${city.name})`,
    },
    textBlock: {
      ...floorScreedPage.textBlock,
      title: `Механизированная стяжка пола под ключ в ${city.nameIn}`,
      paragraphs: [
        `Основные наши заказчики — владельцы частных домов и коммерческих объектов: коттеджей, офисов, магазинов, складов, автосервисов и производственных помещений. Механизированная технология создана именно под такие объёмы — до 150 м² готовой стяжки за смену.`,
        `Полусухая стяжка — выбор для коттеджей с тёплым полом и коммерческой отделки: сохнет 7 дней, не боится небольших минусовых температур в межсезонье. Цементная стяжка прочнее и выдерживает высокие нагрузки — заливаем её в гаражи, паркинги, склады и цеха. На замере бесплатно подскажем, какая технология подойдёт под ваш объект.`,
        `Работаем на профессиональном пневмонагнетателе: смесь готовим на улице и подаём по шлангу прямо на этаж — без грязи в подъезде и мусора на площадке. Ровность контролируем лазерным нивелиром, допуск ±2 мм на 2 метра. За 7 лет сдали 150+ объектов в ${city.nameIn} и Московской области.`,
      ],
    },
  };
}

export const floorScreedCityPages = selectedCities.map(city => ({
  route: `floor-screed-${city.slug}`,
  page: buildCityPage(city),
}));
