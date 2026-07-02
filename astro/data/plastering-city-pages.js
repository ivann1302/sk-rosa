import process from "node:process";
import citiesData from "./directus-cache/cities.json";
import complexesData from "./directus-cache/residential-complexes.json";
import { buildLocalServiceContent } from "./local-service-content.js";
import { plasteringPage } from "./plastering.js";
import { serviceJsonLd as buildServiceJsonLd } from "../lib/seo.js";

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
    title: `Штукатурка стен в ${city.nameIn} от 600 ₽/м² | ROSA`,
    description: `Машинная штукатурка стен в ${city.nameIn}: гипсовая и цементная, по маякам. От 600 ₽/м², гарантия от 2 лет, договор и акт.`,
    canonical,
    ogTitle: `Штукатурные работы в ${city.nameIn} | ROSA — Машинная штукатурка под ключ`,
    ogDescription: `Профессиональная штукатурка стен в ${city.nameIn}: от 600 ₽/м², гипсовая и цементная штукатурка по маякам, договор и гарантия от 2 лет.`,
    ogImageAlt: `Штукатурные работы в ${city.nameIn} - ROSA`,
  };
}

function serviceJsonLd(city, seo) {
  return buildServiceJsonLd({
    canonical: seo.canonical,
    serviceType: "Штукатурные работы",
    name: `Штукатурка стен в ${city.nameIn}`,
    description: `Машинная штукатурка стен в ${city.nameIn} и Московской области. Гипсовая и цементная штукатурка по маякам, фасады, смета, договор, акт и гарантия от 2 лет.`,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Московская область",
      },
    },
    price: "600",
  });
}

function buildCityPage(city) {
  const seo = citySeo(city);
  const complexes = complexesData.complexes[city.name] ?? [];
  const localContent = buildLocalServiceContent({
    city,
    serviceSlug: "plastering",
    complexes,
  });

  return {
    ...plasteringPage,
    city,
    seo,
    jsonLd: serviceJsonLd(city, seo),
    complexes,
    localContent,
    faq: [...plasteringPage.faq, ...localContent.faq],
    faqDescription: localContent.faqDescription,
    hero: {
      ...plasteringPage.hero,
      title: `Механизированная штукатурка стен в ${city.nameIn}`,
      subtitle: `Штукатурка стен в ${city.nameIn} — это выравнивание основания гипсовой или цементной смесью под обои, покраску, плитку или декоративную отделку. Работаем по маякам, фиксируем цену в договоре и сдаём готовые поверхности по акту.`,
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
        `Основные заказчики в ${city.nameIn} — владельцы квартир в новостройках, частных домов и коммерческих объектов: коттеджей, офисов, магазинов и небольших производств. Машинная подача смеси через штукатурную станцию даёт скорость до 200 м² за смену и помогает держать одинаковое качество на большом объёме.`,
        "Гипсовая штукатурка подходит для сухих помещений и подготовки под обои или покраску. Цементная штукатурка прочнее и устойчивее к влаге, поэтому её используем в санузлах, кухнях, подвалах, гаражах и на фасадах.",
        `Работаем штукатурными станциями PFT и Kaleta: смесь готовим у объекта и подаём шлангом на этаж без ручного переноса мешков. Геометрию выводим по маякам, а площадь, толщину слоя, материалы, сроки и цену фиксируем в смете и договоре.`,
        "Ориентир по стоимости — от 600 ₽/м² для гипсовой машинной штукатурки. На итоговую цену влияют площадь, толщина слоя, материал основания, подготовка, армирование, откосы, углы, фасадные зоны и требования к финишной отделке.",
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
