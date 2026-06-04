import process from "node:process";
import citiesData from "./directus-cache/cities.json";
import complexesData from "./directus-cache/residential-complexes.json";
import { biozashchitaPage } from "./biozashchita.js";
import { buildLocalServiceContent } from "./local-service-content.js";

const citySlugsFilter = (process.env.ASTRO_BIOZASHCHITA_CITY_SLUGS ?? "")
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
    `Unknown ASTRO_BIOZASHCHITA_CITY_SLUGS value(s): ${missingCitySlugs.join(", ")}`,
  );
}

export const biozashchitaCitySlugs = selectedCities.map(city => city.slug);

function citySeo(city) {
  const canonical = `https://sk-rosa.ru/biozashchita-${city.slug}`;

  return {
    title: `Огнебиозащита конструкций в ${city.nameIn} — обработка дерева и металла | ROSA`,
    description: `Огнезащитная и биозащитная обработка конструкций в ${city.nameIn} и Московской области. Стропила, чердаки, склады, цеха, металлоконструкции. Выезд, смета и работа по договору. ☎ 8 (985) 135-49-91`,
    canonical,
    ogTitle: `Огнебиозащита конструкций в ${city.nameIn} | ROSA`,
    ogDescription: `Огнебиозащитная обработка дерева и металлоконструкций в ${city.nameIn}. Работаем с частными, коммерческими и промышленными объектами.`,
    ogImageAlt: `Огнебиозащита конструкций в ${city.nameIn} - ROSA`,
  };
}

function serviceJsonLd(city, seo) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${seo.canonical}#service`,
    url: seo.canonical,
    serviceType: "Огнебиозащита конструкций",
    name: `Огнезащитная и биозащитная обработка конструкций в ${city.nameIn}`,
    description: `Огнебиозащитная обработка деревянных и металлических конструкций в ${city.nameIn} и Московской области. Стропила, чердаки, склады, производственные и коммерческие объекты. Бесплатный выезд и смета.`,
    priceRange: "от 180 ₽/м²",
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
        price: "180",
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
    serviceSlug: "biozashchita",
    complexes,
  });

  return {
    ...biozashchitaPage,
    city,
    seo,
    jsonLd: serviceJsonLd(city, seo),
    complexes,
    localContent,
    faq: [...biozashchitaPage.faq, ...localContent.faq],
    hero: {
      ...biozashchitaPage.hero,
      title: `Огнебиозащита конструкций в ${city.nameIn}`,
      subtitle: `Обрабатываем деревянные стропила, чердаки, металлокаркасы, склады и коммерческие объекты в ${city.nameIn} и Московской области. Подбираем состав под материал, фиксируем смету до начала работ.`,
    },
    contact: {
      ...biozashchitaPage.contact,
      comments: `Заявка на огнебиозащиту в ${city.nameIn}`,
      formSource: `Огнебиозащита (${city.name})`,
    },
    priceCalc: {
      ...biozashchitaPage.priceCalc,
      quizFormSource: `Квиз-смета огнебиозащиты (${city.name})`,
      miniCalcFormSource: `Мини-калькулятор огнебиозащиты (${city.name})`,
    },
    runtime: {
      ...biozashchitaPage.runtime,
      callBannerComments: `Заявка с баннера (10 сек) — ${city.name}`,
      callBannerSource: `Баннер 10 секунд (${city.name})`,
    },
    textBlock: {
      ...biozashchitaPage.textBlock,
      title: `Огнебиозащитная обработка конструкций в ${city.nameIn}`,
      paragraphs: [
        `Нужна огнебиозащита конструкций в ${city.nameIn}? Работаем с частными домами, коттеджами, складами, ангарами и коммерческими объектами, где важно защитить дерево или металл от огня, влаги и биопоражения.`,
        "Перед началом работ осматриваем объект, уточняем материал конструкций, доступность узлов, состояние поверхности и требования к защите. После этого подбираем состав и способ нанесения: кисть, валик или распыление.",
        `Стоимость зависит от площади, высоты работ, типа материала, расхода состава и подготовки поверхности. Бесплатно выезжаем на объект в ${city.nameIn}, рассчитываем объём и фиксируем цену в смете до старта.`,
      ],
    },
  };
}

export const biozashchitaCityPages = selectedCities.map(city => ({
  route: `biozashchita-${city.slug}`,
  page: buildCityPage(city),
}));
