import process from "node:process";
import citiesData from "./directus-cache/cities.json";
import complexesData from "./directus-cache/residential-complexes.json";
import { airlessPaintingPage } from "./airless-painting.js";
import { buildLocalServiceContent } from "./local-service-content.js";
import { serviceJsonLd as buildServiceJsonLd } from "../lib/seo.js";

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
    title: `Безвоздушная покраска в ${city.nameIn} от 200 ₽/м² | ROSA`,
    description: `Безвоздушная покраска в ${city.nameIn}: стены, потолки, фасады. От 200 ₽/м², гарантия 2 года, договор и акт.`,
    canonical,
    ogTitle: `Безвоздушная покраска в ${city.nameIn} | ROSA — Покраска стен и потолков`,
    ogDescription: `Профессиональная безвоздушная покраска в ${city.nameIn}: от 200 ₽/м², стены, потолки и фасады без разводов, договор и акт.`,
    ogImageAlt: `Безвоздушная покраска в ${city.nameIn} - ROSA`,
  };
}

function serviceJsonLd(city, seo) {
  return buildServiceJsonLd({
    canonical: seo.canonical,
    serviceType: "Безвоздушная покраска",
    name: `Безвоздушная покраска в ${city.nameIn}`,
    description: `Профессиональная безвоздушная покраска стен и потолков в ${city.nameIn} и Московской области. Машинное нанесение краски, подготовка основания, договор, акт и гарантия результата.`,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Московская область",
      },
    },
    price: "200",
  });
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
    faqDescription: localContent.faqDescription,
    hero: {
      ...airlessPaintingPage.hero,
      title: `Безвоздушная покраска стен и потолков в ${city.nameIn}`,
      subtitle: `Безвоздушная покраска в ${city.nameIn} — это машинное нанесение краски аппаратом высокого давления: покрытие ложится ровным факелом без следов валика, подтёков и полос. Красим стены, потолки, фасады и коммерческие площади, фиксируем цену в договоре и сдаём работу по акту.`,
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
        `Для объектов в ${city.nameIn} безвоздушный метод особенно выгоден на больших и ровных поверхностях: в квартирах под чистовую приёмку, офисах, шоурумах, складах, производственных помещениях и на фасадах. Скорость нанесения достигает 200–400 м² за смену, а слой получается равномерным на стыках, углах и сложных переходах.`,
        "Перед покраской оцениваем основание: если стены ровные и зашпаклёваны, можно сразу планировать нанесение; если есть дефекты, включаем подготовку в смету отдельно. Работаем с матовыми, глубокоматовыми и шёлковистыми красками под условия помещения и требования к износостойкости.",
        "Ориентир по цене начинается от 200 ₽/м² для стен. Итоговая стоимость зависит от площади, высоты, числа цветов, укрывных работ, подготовки основания, типа краски, количества слоёв и доступа к объекту; сроки, материал и цену фиксируем в договоре.",
      ],
    },
  };
}

export const airlessPaintingCityPages = selectedCities.map(city => ({
  route: `airless-painting-${city.slug}`,
  page: buildCityPage(city),
}));
