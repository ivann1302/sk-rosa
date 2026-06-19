import citiesData from "./directus-cache/cities.json";
import { getLocalCityProfile } from "./local-city-profiles.js";

export const serviceHubLinks = {
  "turnkey-repair": {
    href: "/turnkey-repair",
    label: "Ремонт под ключ",
    description: "Полный цикл работ от демонтажа до чистовой отделки.",
  },
  plastering: {
    href: "/plastering",
    label: "Штукатурные работы",
    description: "Выравнивание стен под покраску, обои, плитку и декоративные покрытия.",
  },
  "airless-painting": {
    href: "/airless-painting",
    label: "Безвоздушная покраска",
    description: "Быстрая покраска стен, потолков, фасадов и металлоконструкций.",
  },
  "floor-screed": {
    href: "/floor-screed",
    label: "Стяжка пола",
    description: "Ровное основание под плитку, ламинат, паркет и теплый пол.",
  },
  "soft-roofing": {
    href: "/soft-roofing",
    label: "Мягкая кровля",
    description: "Монтаж и ремонт гибкой черепицы, мембранной и наплавляемой кровли.",
  },
  biozashchita: {
    href: "/biozashchita",
    label: "Огнебиозащита",
    description: "Огнезащита дерева, металлоконструкций, стропил, чердаков и складов.",
  },
  "fire-protection": {
    href: "/fire-protection",
    label: "Огнезащита конструкций",
    description:
      "Комплексная огнезащита металлоконструкций, воздуховодов, дымоудаления и деревянных элементов.",
  },
  "kompleksnaya-ognezashchita": {
    href: "/kompleksnaya-ognezashchita",
    label: "Комплексная огнезащита",
    description:
      "Огнезащита металлоконструкций, воздуховодов, дымоудаления и деревянных элементов в одном проекте.",
  },
  "ognezashchita-derevyannyh-konstruktsiy": {
    href: "/ognezashchita-derevyannyh-konstruktsiy",
    label: "Огнезащита деревянных конструкций",
    description: "Обработка стропил, чердаков, перекрытий, каркасных и несущих элементов.",
  },
  "ognezashchita-vozduhovodov": {
    href: "/ognezashchita-vozduhovodov",
    label: "Огнезащита воздуховодов",
    description: "Защита воздуховодов вентиляции, дымоудаления, коробов и транзитных участков.",
  },
  "ognezashchita-metallokonstruktsiy": {
    href: "/ognezashchita-metallokonstruktsiy",
    label: "Огнезащита металлоконструкций",
    description: "Защита колонн, балок, ферм, ригелей, лестниц и несущего металлического каркаса.",
  },
};

const cityServiceSlugs = [
  "turnkey-repair",
  "plastering",
  "airless-painting",
  "floor-screed",
  "soft-roofing",
  "biozashchita",
];

const relatedServicesBySlug = {
  "turnkey-repair": ["plastering", "floor-screed", "airless-painting"],
  plastering: ["floor-screed", "airless-painting", "turnkey-repair"],
  "airless-painting": ["plastering", "turnkey-repair", "floor-screed"],
  "floor-screed": ["turnkey-repair", "plastering", "airless-painting"],
  "soft-roofing": ["biozashchita", "turnkey-repair", "plastering"],
  biozashchita: [
    "fire-protection",
    "kompleksnaya-ognezashchita",
    "ognezashchita-derevyannyh-konstruktsiy",
  ],
  "ognezashchita-vozduhovodov": [
    "fire-protection",
    "kompleksnaya-ognezashchita",
    "ognezashchita-metallokonstruktsiy",
  ],
  "ognezashchita-metallokonstruktsiy": [
    "fire-protection",
    "kompleksnaya-ognezashchita",
    "ognezashchita-vozduhovodov",
  ],
  "fire-protection": [
    "kompleksnaya-ognezashchita",
    "ognezashchita-metallokonstruktsiy",
    "ognezashchita-vozduhovodov",
  ],
  "ognezashchita-derevyannyh-konstruktsiy": [
    "fire-protection",
    "kompleksnaya-ognezashchita",
    "biozashchita",
  ],
  "kompleksnaya-ognezashchita": [
    "fire-protection",
    "ognezashchita-metallokonstruktsiy",
    "ognezashchita-vozduhovodov",
  ],
};

const articleLinksByCluster = {
  "turnkey-repair": [
    { href: "/stoimost-remonta-kvartiry", label: "Сколько стоит ремонт квартиры" },
    { href: "/shtukaturka-sten-v-novostrojke", label: "Штукатурка стен в новостройке" },
    { href: "/vidy-styazhki-pola", label: "Какие бывают стяжки пола" },
    { href: "/pokraska-sten-bez-razvodov", label: "Как покрасить стены без разводов" },
  ],
  plastering: [
    { href: "/shtukaturka-sten-v-novostrojke", label: "Штукатурка стен в новостройке" },
    { href: "/vybor-shtukaturki", label: "Какую штукатурку выбрать" },
    { href: "/mashinnaya-ili-ruchnaya-shtukaturka", label: "Машинная или ручная штукатурка" },
    { href: "/armirovanie-shtukaturki-setkoj", label: "Армирование штукатурки сеткой" },
    { href: "/priemka-shtukaturnyh-rabot", label: "Приемка штукатурных работ" },
  ],
  "airless-painting": [
    { href: "/preimushestva-bezvozdushnoj-pokraski", label: "Преимущества airless-покраски" },
    { href: "/vybor-kraski-airless-painting", label: "Как выбрать краску для airless" },
    { href: "/pokraska-sten-bez-razvodov", label: "Покраска стен без разводов" },
    { href: "/pokraska-sten-dvumya-cvetami", label: "Покраска стен двумя цветами" },
  ],
  "floor-screed": [
    { href: "/vidy-styazhki-pola", label: "Виды стяжки пола" },
    { href: "/gidroizolyaciya-pola-pod-styazhku", label: "Гидроизоляция под стяжку" },
    { href: "/styazhka-pod-teply-pol", label: "Стяжка под теплый пол" },
  ],
  "soft-roofing": [
    { href: "/srok-sluzhby-ognezashchitnogo-pokrytiya", label: "Срок службы защитных покрытий" },
    { href: "/defekty-ognezashchitnogo-pokrytiya-metalla", label: "Дефекты защитного покрытия" },
    { href: "/fasad-shtukaturka", label: "Фасадная штукатурка" },
  ],
  biozashchita: [
    { href: "/defekty-ognezashchitnogo-pokrytiya-metalla", label: "Дефекты огнезащитного покрытия" },
    { href: "/srok-sluzhby-ognezashchitnogo-pokrytiya", label: "Срок службы огнезащитного покрытия" },
    { href: "/soft-roofing", label: "Мягкая кровля и защита конструкций" },
  ],
  "fire-protection": [
    { href: "/defekty-ognezashchitnogo-pokrytiya-metalla", label: "Дефекты огнезащитного покрытия" },
    { href: "/srok-sluzhby-ognezashchitnogo-pokrytiya", label: "Срок службы огнезащитного покрытия" },
    { href: "/ognezashchita-metallokonstruktsiy", label: "Огнезащита металлоконструкций" },
  ],
  "kompleksnaya-ognezashchita": [
    { href: "/srok-sluzhby-ognezashchitnogo-pokrytiya", label: "Срок службы огнезащитного покрытия" },
    { href: "/defekty-ognezashchitnogo-pokrytiya-metalla", label: "Дефекты огнезащитного покрытия" },
    { href: "/fire-protection", label: "Огнезащита конструкций" },
  ],
  "ognezashchita-derevyannyh-konstruktsiy": [
    { href: "/srok-sluzhby-ognezashchitnogo-pokrytiya", label: "Срок службы огнезащитного покрытия" },
    { href: "/biozashchita", label: "Огнебиозащита конструкций" },
    { href: "/soft-roofing", label: "Мягкая кровля и защита дерева" },
  ],
  "ognezashchita-metallokonstruktsiy": [
    { href: "/defekty-ognezashchitnogo-pokrytiya-metalla", label: "Дефекты огнезащитного покрытия" },
    { href: "/srok-sluzhby-ognezashchitnogo-pokrytiya", label: "Срок службы огнезащитного покрытия" },
    { href: "/ognezashchita-vozduhovodov", label: "Огнезащита воздуховодов" },
  ],
};
const articleClusterBySlug = {
  "stoimost-remonta-kvartiry": "turnkey-repair",
  "shtukaturka-sten-v-novostrojke": "plastering",
  "kak-rasscitat-raskhod-shtukaturki": "plastering",
  "podgotovka-sten-pod-dekorativnuyu-shtukaturku": "plastering",
  "vybor-shtukaturki": "plastering",
  "mashinnaya-ili-ruchnaya-shtukaturka": "plastering",
  "shtukaturka-guide": "plastering",
  "armirovanie-shtukaturki-setkoj": "plastering",
  "shpaklevka-sten-posle-shtukaturki": "plastering",
  "fasad-shtukaturka": "plastering",
  "trebovaniya-k-vypolneniyu-shtukaturnyh-rabot": "plastering",
  "priemka-shtukaturnyh-rabot": "plastering",
  "preimushestva-bezvozdushnoj-pokraski": "airless-painting",
  "vybor-kraski-airless-painting": "airless-painting",
  "pokraska-sten-bez-razvodov": "airless-painting",
  "pokraska-sten-dvumya-cvetami": "airless-painting",
  "vidy-styazhki-pola": "floor-screed",
  "gidroizolyaciya-pola-pod-styazhku": "floor-screed",
  "styazhka-pod-teply-pol": "floor-screed",
  "defekty-ognezashchitnogo-pokrytiya-metalla": "biozashchita",
  "srok-sluzhby-ognezashchitnogo-pokrytiya": "biozashchita",
};

const cityByName = new Map(citiesData.cities.map(city => [city.name, city]));

function cityServiceHref(serviceSlug, city) {
  return city?.slug ? `/${serviceSlug}-${city.slug}` : serviceHubLinks[serviceSlug]?.href;
}

function compactGroups(groups) {
  return groups
    .map(group => ({
      ...group,
      links: group.links.filter(Boolean),
    }))
    .filter(group => group.links.length > 0);
}

export function getServiceInterlinkGroups(serviceSlug) {
  return compactGroups([
    {
      title: "Смежные услуги",
      links: (relatedServicesBySlug[serviceSlug] ?? []).map(slug => serviceHubLinks[slug]),
    },
    {
      title: "География работ",
      links: [
        {
          href: "/where-we-work",
          label: "Где работаем",
          description: "Выберите город и посмотрите страницы услуг по Москве и Подмосковью.",
        },
      ],
    },
  ]);
}

export function getCityInterlinkGroups(serviceSlug, city) {
  const localProfile = getLocalCityProfile(city);
  const sameCityLinks = cityServiceSlugs
    .filter(slug => slug !== serviceSlug)
    .map(slug => ({
      ...serviceHubLinks[slug],
      href: cityServiceHref(slug, city),
      label: `${serviceHubLinks[slug].label} в ${city.nameIn}`,
    }));
  const nearbyCityLinks = (localProfile.nearby ?? [])
    .map(cityName => {
      if (cityName === "Москва") {
        return {
          href: serviceHubLinks[serviceSlug].href,
          label: `${serviceHubLinks[serviceSlug].label} в Москве`,
        };
      }

      const nearbyCity = cityByName.get(cityName);

      return nearbyCity
        ? {
            href: cityServiceHref(serviceSlug, nearbyCity),
            label: `${serviceHubLinks[serviceSlug].label} в ${nearbyCity.nameIn}`,
          }
        : null;
    })
    .filter(Boolean)
    .slice(0, 3);

  return compactGroups([
    {
      title: `Другие услуги в ${city.nameIn}`,
      links: sameCityLinks,
    },
    {
      title: "Рядом с вами",
      links: nearbyCityLinks,
    },
    {
      title: "Основные разделы",
      links: [
        serviceHubLinks[serviceSlug],
        {
          href: "/where-we-work",
          label: "Все города и направления",
          description: "Общий список городов, где ROSA выполняет ремонтные работы.",
        },
      ],
    },
  ]);
}

export function getArticleInterlinkGroups(article) {
  const serviceSlug = articleClusterBySlug[article.slug] ?? "turnkey-repair";
  const serviceLink = serviceHubLinks[serviceSlug];
  const relatedArticles = (articleLinksByCluster[serviceSlug] ?? [])
    .filter(link => link.href !== article.href)
    .slice(0, 4);

  return compactGroups([
    {
      title: "Услуга по теме",
      links: [serviceLink],
    },
    {
      title: "Еще по теме",
      links: relatedArticles,
    },
  ]);
}

export function getArticleServiceLink(article) {
  const serviceSlug = articleClusterBySlug[article.slug] ?? "turnkey-repair";

  return serviceHubLinks[serviceSlug];
}

export const blogServiceLinks = [
  serviceHubLinks.plastering,
  serviceHubLinks["airless-painting"],
  serviceHubLinks["floor-screed"],
  serviceHubLinks["turnkey-repair"],
  serviceHubLinks.biozashchita,
  serviceHubLinks["fire-protection"],
  serviceHubLinks["kompleksnaya-ognezashchita"],
  serviceHubLinks["ognezashchita-metallokonstruktsiy"],
  serviceHubLinks["ognezashchita-vozduhovodov"],
];
