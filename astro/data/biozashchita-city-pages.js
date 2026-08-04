import process from "node:process";
import citiesData from "./directus-cache/cities.json";
import complexesData from "./directus-cache/residential-complexes.json";
import { biozashchitaPage } from "./biozashchita.js";
import { getBiozashchitaCityTemplate } from "./biozashchita-city-templates.js";
import { buildLocalServiceContent } from "./local-service-content.js";
import { getPriorityBiozashchitaCityContent } from "./biozashchita-priority-city-content.js";
import { serviceJsonLd as buildServiceJsonLd } from "../lib/seo.js";

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
  throw new Error(`Unknown ASTRO_BIOZASHCHITA_CITY_SLUGS value(s): ${missingCitySlugs.join(", ")}`);
}

export const biozashchitaCitySlugs = selectedCities.map(city => city.slug);

function citySeo(city) {
  const canonical = `https://sk-rosa.ru/biozashchita-${city.slug}`;

  return {
    title: `Огнебиозащита в ${city.nameIn} от 200 ₽/м² | ROSA`,
    description: `Огнебиозащитная обработка в ${city.nameIn}: дерево, стропила, чердаки, металлоконструкции. От 200 ₽/м², смета, договор и акты.`,
    canonical,
    ogTitle: `Огнебиозащита конструкций в ${city.nameIn} | ROSA`,
    ogDescription: `Огнебиозащитная обработка дерева и металлоконструкций в ${city.nameIn}: от 200 ₽/м², договор, акты и документы по работам.`,
    ogImageAlt: `Огнебиозащита конструкций в ${city.nameIn} - ROSA`,
  };
}

function serviceJsonLd(city, seo) {
  return buildServiceJsonLd({
    canonical: seo.canonical,
    serviceType: "Огнебиозащита конструкций",
    name: `Огнезащитная и биозащитная обработка конструкций в ${city.nameIn}`,
    description: `Огнебиозащитная обработка деревянных и металлических конструкций в ${city.nameIn} и Московской области. Стропила, чердаки, склады, производственные и коммерческие объекты. Смета, договор, акты и документы на применяемые составы.`,
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
    serviceSlug: "biozashchita",
    complexes,
  });
  const priorityContent = getPriorityBiozashchitaCityContent(city.slug);
  const cityTemplate = getBiozashchitaCityTemplate(city.slug);

  if (priorityContent) {
    localContent.title = priorityContent.guide.title;
    localContent.subtitle = priorityContent.guide.subtitle;
    localContent.lead = priorityContent.guide.lead;
    localContent.blocks = [...priorityContent.guide.blocks, ...localContent.blocks];
  }

  return {
    ...biozashchitaPage,
    city,
    seo,
    jsonLd: serviceJsonLd(city, seo),
    complexes,
    localContent,
    faq: [...cityTemplate.faq, ...localContent.faq],
    faqDescription: localContent.faqDescription,
    advantages:
      (priorityContent?.existingBlocks?.advantages ?? cityTemplate.advantages)
        ? biozashchitaPage.advantages.map((item, index) => ({
            ...item,
            ...(priorityContent?.existingBlocks?.advantages ?? cityTemplate.advantages)[index],
          }))
        : biozashchitaPage.advantages,
    stages:
      (priorityContent?.existingBlocks?.stages ?? cityTemplate.stages)
        ? {
            ...biozashchitaPage.stages,
            ...(priorityContent?.existingBlocks?.stages ?? cityTemplate.stages),
          }
        : biozashchitaPage.stages,
    hero: {
      ...biozashchitaPage.hero,
      title: `Огнебиозащита конструкций в ${city.nameIn}`,
      subtitle:
        priorityContent?.heroSubtitle ??
        `Огнебиозащита в ${city.nameIn} — это обработка дерева и металла составами, которые снижают горючесть и помогают защитить деревянные элементы от грибка, плесени и насекомых. Работаем со стропилами, чердаками, металлокаркасами, складами и коммерческими объектами; фиксируем смету до начала работ, после сдачи передаём акты и документы.`,
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
      title:
        priorityContent?.textBlock.title ??
        `Огнебиозащитная обработка конструкций в ${city.nameIn}`,
      paragraphs: priorityContent?.textBlock.paragraphs ?? [
        `Нужна огнебиозащита конструкций в ${city.nameIn}? Работаем с частными домами, коттеджами, складами, ангарами и коммерческими объектами, где важно защитить дерево или металл от огня, влаги и биопоражения.`,
        "Перед началом работ осматриваем объект, уточняем материал конструкций, доступность узлов, состояние поверхности и требования к защите. После этого подбираем состав и способ нанесения: кисть, валик или распыление.",
        `Ориентир по огнебиозащите начинается от 200 ₽/м². Итоговая стоимость зависит от площади, высоты работ, типа материала, расхода состава и подготовки поверхности. После выполнения передаём договор, смету, акты и согласованные документы на применяемые составы.`,
      ],
    },
  };
}

export const biozashchitaCityPages = selectedCities.map(city => ({
  route: `biozashchita-${city.slug}`,
  page: buildCityPage(city),
}));
