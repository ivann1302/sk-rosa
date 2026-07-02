import process from "node:process";
import citiesData from "./directus-cache/cities.json";
import complexesData from "./directus-cache/residential-complexes.json";
import { buildLocalServiceContent } from "./local-service-content.js";
import { softRoofingPage } from "./soft-roofing.js";
import { serviceJsonLd as buildServiceJsonLd } from "../lib/seo.js";

const citySlugsFilter = (process.env.ASTRO_SOFT_ROOFING_CITY_SLUGS ?? "")
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
    `Unknown ASTRO_SOFT_ROOFING_CITY_SLUGS value(s): ${missingCitySlugs.join(", ")}`,
  );
}

export const softRoofingCitySlugs = selectedCities.map(city => city.slug);

function citySeo(city) {
  const canonical = `https://sk-rosa.ru/soft-roofing-${city.slug}`;

  return {
    title: `Мягкая кровля в ${city.nameIn} от 350 ₽/м² | ROSA`,
    description: `Монтаж и ремонт мягкой кровли в ${city.nameIn}: гибкая черепица, ПВХ-мембрана, наплавляемая кровля. От 350 ₽/м², договор и акт.`,
    canonical,
    ogTitle: `Монтаж мягкой кровли в ${city.nameIn} под ключ | ROSA`,
    ogDescription: `Монтаж и ремонт мягкой кровли в ${city.nameIn}: от 350 ₽/м², гибкая черепица, ПВХ-мембрана, договор и гарантия 5 лет.`,
    ogImageAlt: `Монтаж мягкой кровли в ${city.nameIn} - ROSA`,
  };
}

function serviceJsonLd(city, seo) {
  return buildServiceJsonLd({
    canonical: seo.canonical,
    serviceType: "Мягкая кровля",
    name: `Монтаж и ремонт мягкой кровли в ${city.nameIn}`,
    description: `Монтаж мягкой кровли в ${city.nameIn} и Московской области под ключ. Укладка гибкой черепицы, ПВХ-мембраны, наплавляемой кровли. Ремонт мягкой кровли, демонтаж старого покрытия, договор, акт и гарантия 5 лет.`,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Московская область",
      },
    },
    price: "350",
  });
}

function buildCityPage(city) {
  const seo = citySeo(city);
  const complexes = complexesData.complexes[city.name] ?? [];
  const localContent = buildLocalServiceContent({
    city,
    serviceSlug: "soft-roofing",
    complexes,
  });

  return {
    ...softRoofingPage,
    city,
    seo,
    jsonLd: serviceJsonLd(city, seo),
    complexes,
    localContent,
    faq: [...softRoofingPage.faq, ...localContent.faq],
    faqDescription: localContent.faqDescription,
    hero: {
      ...softRoofingPage.hero,
      title: `Монтаж мягкой кровли в ${city.nameIn} под ключ`,
      subtitle: `Мягкая кровля в ${city.nameIn} — это гибкая черепица, наплавляемые материалы и мембраны для скатных, плоских и малоуклонных крыш. Укладываем новое покрытие, ремонтируем протечки, фиксируем смету до начала работ и передаём договор с актом сдачи.`,
    },
    contact: {
      ...softRoofingPage.contact,
      comments: `Заявка на мягкую кровлю в ${city.nameIn}`,
      formSource: `Мягкая кровля (${city.name})`,
    },
    priceCalc: {
      ...softRoofingPage.priceCalc,
      quizFormSource: `Квиз-смета мягкой кровли (${city.name})`,
      miniCalcFormSource: `Мини-калькулятор мягкой кровли (${city.name})`,
    },
    runtime: {
      ...softRoofingPage.runtime,
      callBannerComments: `Заявка с баннера (10 сек) — ${city.name}`,
      callBannerSource: `Баннер 10 секунд (${city.name})`,
    },
    textBlock: {
      ...softRoofingPage.textBlock,
      title: `Монтаж и ремонт мягкой кровли в ${city.nameIn}`,
      paragraphs: [
        `Для объектов в ${city.nameIn} подбираем мягкую кровлю под конструкцию крыши: гибкую черепицу для скатных крыш, наплавляемые материалы и мембраны для плоских и малоуклонных оснований.`,
        "Выполняем как монтаж новой мягкой кровли, так и ремонт существующего покрытия: устраняем протечки, меняем повреждённые участки, обновляем примыкания и восстанавливаем кровельный пирог.",
        `Мягкая кровля особенно выгодна для крыш со сложной геометрией, малым уклоном, множеством ендов и примыканий. Бесплатно выезжаем на объект в ${city.nameIn}, делаем замер и готовим смету с разбивкой по работам.`,
        "Ориентир начинается от 350 ₽/м² для наплавляемой кровли. Итоговая цена зависит от площади, уклона, основания, количества узлов, демонтажа, водостока и выбранного материала; после сдачи передаём акт и гарантию.",
      ],
    },
  };
}

export const softRoofingCityPages = selectedCities.map(city => ({
  route: `soft-roofing-${city.slug}`,
  page: buildCityPage(city),
}));
