import armirovanieShtukaturkiSetkojHtml from "../../src/pages/armirovanie-shtukaturki-setkoj.html?raw";
import fasadShtukaturkaHtml from "../../src/pages/fasad-shtukaturka.html?raw";
import gidroizolyaciyaPolaPodStyazhkuHtml from "../../src/pages/gidroizolyaciya-pola-pod-styazhku.html?raw";
import kakRasscitatRaskhodShtukaturkiHtml from "../../src/pages/kak-rasscitat-raskhod-shtukaturki.html?raw";
import mashinnayaIliRuchnayaShtukaturkaHtml from "../../src/pages/mashinnaya-ili-ruchnaya-shtukaturka.html?raw";
import pokraskaStenBezRazvodovHtml from "../../src/pages/pokraska-sten-bez-razvodov.html?raw";
import pokraskaStenDvumyaCvetamiHtml from "../../src/pages/pokraska-sten-dvumya-cvetami.html?raw";
import podgotovkaStenPodDekorativnuyuShtukaturkuHtml from "../../src/pages/podgotovka-sten-pod-dekorativnuyu-shtukaturku.html?raw";
import preimushestvaBezvozdushnojPokraskiHtml from "../../src/pages/preimushestva-bezvozdushnoj-pokraski.html?raw";
import shpaklevkaStenPosleShtukaturkiHtml from "../../src/pages/shpaklevka-sten-posle-shtukaturki.html?raw";
import shtukaturkaGuideHtml from "../../src/pages/shtukaturka-guide.html?raw";
import shtukaturkaStenVNovostrojkeHtml from "../../src/pages/shtukaturka-sten-v-novostrojke.html?raw";
import stoimostRemontaKvartiryHtml from "../../src/pages/stoimost-remonta-kvartiry.html?raw";
import styazhkaPodTeplyPolHtml from "../../src/pages/styazhka-pod-teply-pol.html?raw";
import trebovaniyaKVypolneniyuShtukaturnyhRabotHtml from "../../src/pages/trebovaniya-k-vypolneniyu-shtukaturnyh-rabot.html?raw";
import vidyStyazhkiPolaHtml from "../../src/pages/vidy-styazhki-pola.html?raw";
import vyborKraskiAirlessPaintingHtml from "../../src/pages/vybor-kraski-airless-painting.html?raw";
import vyborShtukaturkiHtml from "../../src/pages/vybor-shtukaturki.html?raw";

export const blogPage = {
  seo: {
    title: "Блог о ремонте | ROSA - Полезные статьи и советы",
    description:
      "Читайте полезные статьи о ремонте квартир, выборе материалов, технологиях отделки. Советы от профессионалов ROSA по ремонту и отделочным работам в Москве и МО.",
    canonical: "https://sk-rosa.ru/blog",
    ogTitle: "Блог о ремонте | ROSA - Полезные статьи и советы",
    ogDescription:
      "Читайте полезные статьи о ремонте квартир, выборе материалов, технологиях отделки. Советы от профессионалов ROSA.",
    ogImage: "https://sk-rosa.ru/assets/images/common/about-hero.webp",
    ogImageAlt: "Блог о ремонте - ROSA",
  },
};

export const blogCategories = [
  { slug: "all", label: "Все статьи" },
  { slug: "painting", label: "Покраска" },
  { slug: "plastering", label: "Штукатурные работы" },
  { slug: "floor-screed", label: "Стяжка пола" },
  { slug: "remont", label: "Ремонт и отделка" },
];

export const blogArticles = [
  {
    slug: "trebovaniya-k-vypolneniyu-shtukaturnyh-rabot",
    href: "/trebovaniya-k-vypolneniyu-shtukaturnyh-rabot",
    category: "plastering",
    categoryLabel: "Штукатурные работы",
    title: "Требования к выполнению штукатурных работ: как проверить качество стен",
    excerpt:
      "Что проверить при приемке стен, какие дефекты недопустимы и почему требования к качеству штукатурки зависят от будущей финишной отделки.",
    date: "2026-06-03",
    dateLabel: "3 июня 2026",
    readTime: "5 мин чтения",
    image: "/assets/images/common/plastering-quality-requirements.webp",
    imageAlt: "Проверка качества штукатурных работ мастерами ROSA",
    width: 600,
    height: 400,
  },
  {
    slug: "podgotovka-sten-pod-dekorativnuyu-shtukaturku",
    href: "/podgotovka-sten-pod-dekorativnuyu-shtukaturku",
    category: "plastering",
    categoryLabel: "Штукатурные работы",
    title:
      "Подготовка стен под декоративную штукатурку: что действительно влияет на результат",
    excerpt:
      "Как проверить основание, когда нужна шпаклевка или штукатурка, зачем грунтовать стены и какие ошибки портят декоративное покрытие через несколько месяцев.",
    date: "2026-06-03",
    dateLabel: "3 июня 2026",
    readTime: "6 мин чтения",
    image: "/assets/images/common/decorative-plastering.webp",
    imageAlt: "Подготовка стен под декоративную штукатурку мастерами ROSA",
    width: 600,
    height: 400,
  },
  {
    slug: "stoimost-remonta-kvartiry",
    href: "/stoimost-remonta-kvartiry",
    category: "remont",
    categoryLabel: "Ремонт и отделка",
    title: "Сколько стоит ремонт квартиры в Москве в 2026 году: реальные цены и расчёт бюджета",
    excerpt:
      "Три уровня цен, таблицы бюджета для однушки, двушки и трёшки, расценки по видам работ, на чём сэкономить и на чём нельзя. Опыт 6 лет — сотни объектов в Москве.",
    date: "2026-03-31",
    dateLabel: "31 марта 2026",
    readTime: "15 мин чтения",
    image: "/assets/images/turnkey/repair_price.webp",
    imageAlt: "Сколько стоит ремонт квартиры в Москве в 2026 году",
    width: 600,
    height: 350,
  },
  {
    slug: "kak-rasscitat-raskhod-shtukaturki",
    href: "/kak-rasscitat-raskhod-shtukaturki",
    category: "plastering",
    categoryLabel: "Штукатурные работы",
    title: "Как рассчитать, сколько нужно штукатурки на стены и потолок",
    excerpt:
      "Формула расчёта, таблицы норм расхода по типам смеси, примеры для комнаты и фасада, типичные ошибки и советы по запасу — всё для точной закупки.",
    date: "2026-03-20",
    dateLabel: "20 марта 2026",
    readTime: "18 мин чтения",
    image: "/assets/images/common/how-to-count-plastering.png",
    imageAlt: "Как рассчитать, сколько нужно штукатурки на стены и потолок",
    width: 600,
    height: 350,
  },
  {
    slug: "pokraska-sten-dvumya-cvetami",
    href: "/pokraska-sten-dvumya-cvetami",
    category: "painting",
    categoryLabel: "Покраска",
    title: "Как покрасить стену двумя цветами и не запороть ремонт",
    excerpt:
      "Выбор метода, подбор сочетаний, разметка по уровню и работа с малярной лентой. Таблицы ошибок и стоимости для комнаты 15 м².",
    date: "2026-03-20",
    dateLabel: "20 марта 2026",
    readTime: "16 мин чтения",
    image: "/assets/images/common/how-to-paint-to-color.png",
    imageAlt: "Как покрасить стену двумя цветами и не запороть ремонт",
    width: 600,
    height: 350,
  },
  {
    slug: "styazhka-pod-teply-pol",
    href: "/styazhka-pod-teply-pol",
    category: "floor-screed",
    categoryLabel: "Стяжка пола",
    title: "Стяжка под тёплый пол: как сделать правильно, чтобы не треснула и хорошо грела",
    excerpt:
      "Толщина над трубами, марка бетона, демпферная лента, ошибки при заливке — всё, что нужно знать для правильной стяжки под водяной и электрический тёплый пол.",
    date: "2026-03-13",
    dateLabel: "13 марта 2026",
    readTime: "16 мин чтения",
    image: "/assets/images/common/floor-screed-underfloor-heating.webp",
    imageAlt: "Стяжка под тёплый пол: как сделать правильно, чтобы не треснула и хорошо грела",
    width: 600,
    height: 350,
  },
  {
    slug: "shpaklevka-sten-posle-shtukaturki",
    href: "/shpaklevka-sten-posle-shtukaturki",
    category: "plastering",
    categoryLabel: "Штукатурные работы",
    title: "Как правильно шпаклевать стены после штукатурки: пошаговая инструкция от мастеров",
    excerpt:
      "Когда начинать шпаклевать, как выбрать смесь под обои и покраску, сколько слоёв делать и как избежать типичных ошибок — полное руководство с советами мастеров.",
    date: "2026-03-12",
    dateLabel: "12 марта 2026",
    readTime: "18 мин чтения",
    image: "/assets/images/common/skimming-wall-after-plaster.webp",
    imageAlt: "Как правильно шпаклевать стены после штукатурки: пошаговая инструкция",
    width: 600,
    height: 350,
  },
  {
    slug: "pokraska-sten-bez-razvodov",
    href: "/pokraska-sten-bez-razvodov",
    category: "painting",
    categoryLabel: "Покраска",
    title: "Как правильно покрасить стены без разводов: пошаговая инструкция от мастеров",
    excerpt:
      "Подготовка стен, выбор краски и валика, техника мокрого края и квадратов. Таблицы дефектов, инструментов и расчёт материалов для комнаты 15 м².",
    date: "2026-03-12",
    dateLabel: "12 марта 2026",
    readTime: "16 мин чтения",
    image: "/assets/images/common/streak-free-wall-painting.webp",
    imageAlt: "Как правильно покрасить стены без разводов: пошаговая инструкция",
    width: 600,
    height: 350,
  },
  {
    slug: "armirovanie-shtukaturki-setkoj",
    href: "/armirovanie-shtukaturki-setkoj",
    category: "plastering",
    categoryLabel: "Штукатурные работы",
    title: "Как армировать штукатурку сеткой: полная инструкция",
    excerpt:
      "Разбираем виды армирующих сеток, способы крепления к разным основаниям, пошаговую технологию нанесения слоёв и типичные ошибки, которые приводят к трещинам.",
    date: "2026-03-10",
    dateLabel: "10 марта 2026",
    readTime: "11 мин чтения",
    image: "/assets/images/common/plaster-reinforcement-mesh.webp",
    imageAlt: "Армирование штукатурки сеткой — виды сеток и технология",
    width: 600,
    height: 350,
  },
  {
    slug: "gidroizolyaciya-pola-pod-styazhku",
    href: "/gidroizolyaciya-pola-pod-styazhku",
    category: "floor-screed",
    categoryLabel: "Стяжка пола",
    title: "Гидроизоляция пола под стяжку: какие варианты есть и что выбрать",
    excerpt:
      "Обмазочная, рулонная, пленочная, проникающая гидроизоляция под стяжку — разбираем виды, сценарии применения и типичные ошибки.",
    date: "2026-03-05",
    dateLabel: "5 марта 2026",
    readTime: "19 мин чтения",
    image: "/assets/images/common/waterproof-panel.webp",
    imageAlt: "Гидроизоляция пола под стяжку — виды и технология",
    width: 600,
    height: 350,
  },
  {
    slug: "vidy-styazhki-pola",
    href: "/vidy-styazhki-pola",
    category: "floor-screed",
    categoryLabel: "Стяжка пола",
    title: "Какие есть стяжки пола и какую стяжку выбрать под вашу задачу",
    excerpt:
      "Разбираем все виды стяжек по технологии и материалу: мокрая, полусухая, сухая, гипсовая, наливная. Пошаговый алгоритм выбора для квартиры, дома и теплого пола.",
    date: "2026-03-05",
    dateLabel: "5 марта 2026",
    readTime: "11 мин чтения",
    image: "/assets/images/common/how-to-choose-floor-screed.webp",
    imageAlt: "Виды стяжки пола: мокрая, полусухая, сухая — как выбрать",
    width: 600,
    height: 350,
  },
  {
    slug: "fasad-shtukaturka",
    href: "/fasad-shtukaturka",
    category: "plastering",
    categoryLabel: "Штукатурные работы",
    title:
      "Наружная штукатурка фасадов здания: как выбрать материал и сделать долговечный штукатурный фасад",
    excerpt:
      "Полный гид по фасадной штукатурке: виды материалов, устройство мокрого фасада, технология работ, типичные ошибки и как принять работу у подрядчика.",
    date: "2026-03-04",
    dateLabel: "4 марта 2026",
    readTime: "16 мин чтения",
    image: "/assets/images/common/fasad-plastering.webp",
    imageAlt: "Наружная штукатурка фасадов здания",
    width: 600,
    height: 350,
  },
  {
    slug: "preimushestva-bezvozdushnoj-pokraski",
    href: "/preimushestva-bezvozdushnoj-pokraski",
    category: "painting",
    categoryLabel: "Покраска",
    title: "Преимущества безвоздушной покраски",
    excerpt:
      "Безвоздушная покраска — передовой способ нанесения покрытия под сильным напором, который ускоряет процесс отделки в 5–10 раз относительно валика или кисти. Гладкий слой без изъянов и экономия краски на 30%.",
    date: "2026-02-11",
    dateLabel: "11 февраля 2026",
    readTime: "5 мин чтения",
    image: "/assets/images/common/airless-paint.webp",
    imageAlt: "Преимущества безвоздушной покраски",
    width: 600,
    height: 350,
  },
  {
    slug: "shtukaturka-sten-v-novostrojke",
    href: "/shtukaturka-sten-v-novostrojke",
    category: "plastering",
    categoryLabel: "Штукатурные работы",
    title: "Штукатурка стен в новостройке: полное руководство по выбору смесей и технологий",
    excerpt:
      "Документы оформлены, квартира в новостройке ваша. С чего стартовать ремонт? С подготовки стен и потолков под финишную отделку. Штукатурка здесь — фундамент всего процесса.",
    date: "2026-02-09",
    dateLabel: "9 февраля 2026",
    readTime: "4 мин чтения",
    image: "/assets/images/common/plastering-hero.webp",
    imageAlt: "Штукатурка стен в новостройке: полное руководство по выбору смесей и технологий",
    width: 600,
    height: 350,
  },
  {
    slug: "vybor-kraski-airless-painting",
    href: "/vybor-kraski-airless-painting",
    category: "painting",
    categoryLabel: "Покраска",
    title: "Как выбрать краску для безвоздушной покраски в Москве в 2026 году",
    excerpt:
      "Вы стоите с аппаратом для безвоздушного напыления и думаете: какая краска не забьет сопло, ляжет ровно и не отслоится через год? Выбираем идеальную краску для airless за 5 минут.",
    date: "2026-02-09",
    dateLabel: "9 февраля 2026",
    readTime: "4 мин чтения",
    image: "/assets/images/common/how-to-choose-paint.webp",
    imageAlt: "Как выбрать краску для безвоздушной покраски в Москве в 2026 году",
    width: 600,
    height: 400,
  },
  {
    slug: "shtukaturka-guide",
    href: "/shtukaturka-guide",
    category: "plastering",
    categoryLabel: "Штукатурные работы",
    title: "Как правильно штукатурить стены: пошаговое руководство",
    excerpt:
      "Пошаговое руководство по штукатурке стен в квартире. Как выбрать смесь, подготовить поверхность и избежать типичных ошибок.",
    date: "2026-02-04",
    dateLabel: "4 февраля 2026",
    readTime: "3 мин чтения",
    image: "/assets/images/common/how-to-plastering.webp",
    imageAlt: "Как правильно штукатурить стены: пошаговое руководство",
    width: 600,
    height: 350,
  },
  {
    slug: "mashinnaya-ili-ruchnaya-shtukaturka",
    href: "/mashinnaya-ili-ruchnaya-shtukaturka",
    category: "plastering",
    categoryLabel: "Штукатурные работы",
    title: "Механизированная (машинная) или ручная штукатурка: что лучше для ремонта",
    excerpt:
      "Сравнение механизированного и ручного оштукатуривания стен. Когда выбрать штукатурную станцию для скорости, а когда шпатель для точности.",
    date: "2026-02-03",
    dateLabel: "3 февраля 2026",
    readTime: "12 мин чтения",
    image: "/assets/images/common/article-machine-shtukaturka.webp",
    imageAlt: "Механизированная (машинная) или ручная штукатурка: что лучше для ремонта",
    width: 600,
    height: 350,
  },
  {
    slug: "vybor-shtukaturki",
    href: "/vybor-shtukaturki",
    category: "plastering",
    categoryLabel: "Штукатурные работы",
    title: "Какую штукатурку выбрать для стен: гид по типам и применению",
    excerpt:
      "Гипсовая, цементная или полимерная штукатурка — какую выбрать для стен в квартире. Сравнение свойств, плюсов и минусов для сухих и влажных помещений.",
    date: "2026-01-20",
    dateLabel: "20 января 2026",
    readTime: "4 мин чтения",
    image: "/assets/images/common/article-how-to-choose-plastering.webp",
    imageAlt: "Какую штукатурку выбрать для стен: гид по типам и применению",
    width: 600,
    height: 350,
  },
];

const articleSources = {
  "armirovanie-shtukaturki-setkoj": armirovanieShtukaturkiSetkojHtml,
  "fasad-shtukaturka": fasadShtukaturkaHtml,
  "gidroizolyaciya-pola-pod-styazhku": gidroizolyaciyaPolaPodStyazhkuHtml,
  "kak-rasscitat-raskhod-shtukaturki": kakRasscitatRaskhodShtukaturkiHtml,
  "mashinnaya-ili-ruchnaya-shtukaturka": mashinnayaIliRuchnayaShtukaturkaHtml,
  "pokraska-sten-bez-razvodov": pokraskaStenBezRazvodovHtml,
  "pokraska-sten-dvumya-cvetami": pokraskaStenDvumyaCvetamiHtml,
  "podgotovka-sten-pod-dekorativnuyu-shtukaturku":
    podgotovkaStenPodDekorativnuyuShtukaturkuHtml,
  "preimushestva-bezvozdushnoj-pokraski": preimushestvaBezvozdushnojPokraskiHtml,
  "shpaklevka-sten-posle-shtukaturki": shpaklevkaStenPosleShtukaturkiHtml,
  "shtukaturka-guide": shtukaturkaGuideHtml,
  "shtukaturka-sten-v-novostrojke": shtukaturkaStenVNovostrojkeHtml,
  "stoimost-remonta-kvartiry": stoimostRemontaKvartiryHtml,
  "styazhka-pod-teply-pol": styazhkaPodTeplyPolHtml,
  "trebovaniya-k-vypolneniyu-shtukaturnyh-rabot":
    trebovaniyaKVypolneniyuShtukaturnyhRabotHtml,
  "vidy-styazhki-pola": vidyStyazhkiPolaHtml,
  "vybor-kraski-airless-painting": vyborKraskiAirlessPaintingHtml,
  "vybor-shtukaturki": vyborShtukaturkiHtml,
};

function attrValue(tag, name) {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(pattern);

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function tagText(html, pattern) {
  return (html.match(pattern)?.[1] ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metaValue(html, name) {
  const tag = html.match(
    new RegExp(`<meta\\b(?=[^>]*(?:name|property)=["']${name}["'])[^>]*>`, "i")
  )?.[0];

  return tag ? attrValue(tag, "content") : "";
}

function canonicalValue(html) {
  return attrValue(html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/i)?.[0] ?? "", "href");
}

function jsonLd(html) {
  return [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ].map(match => JSON.parse(match[1].trim()));
}

function articleHeadHtml(html) {
  return [...html.matchAll(/<meta\b(?=[^>]*property=["']article:[^"']+["'])[^>]*>/gi)]
    .map(match => match[0])
    .join("\n");
}

function sourceFor(slug) {
  const sourceHtml = articleSources[slug];

  if (!sourceHtml) {
    throw new Error(`Missing legacy article source for ${slug}`);
  }

  return sourceHtml;
}

export const blogArticlePages = blogArticles.map(article => {
  const sourceHtml = sourceFor(article.slug);

  return {
    ...article,
    sourceHtml,
    seo: {
      title: tagText(sourceHtml, /<title[^>]*>([\s\S]*?)<\/title>/i),
      description: metaValue(sourceHtml, "description"),
      canonical: canonicalValue(sourceHtml),
      ogType: metaValue(sourceHtml, "og:type") || "article",
      ogTitle: metaValue(sourceHtml, "og:title"),
      ogDescription: metaValue(sourceHtml, "og:description"),
      ogImage: metaValue(sourceHtml, "og:image"),
      ogImageWidth: metaValue(sourceHtml, "og:image:width") || "1200",
      ogImageHeight: metaValue(sourceHtml, "og:image:height") || "630",
      ogImageType: metaValue(sourceHtml, "og:image:type") || "image/webp",
      ogImageAlt: metaValue(sourceHtml, "og:image:alt"),
      ogSiteName: metaValue(sourceHtml, "og:site_name"),
      extraHeadHtml: articleHeadHtml(sourceHtml),
    },
    jsonLd: jsonLd(sourceHtml),
  };
});

export const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Блог ROSA",
  description:
    "Полезные статьи о ремонте квартир, выборе материалов, технологиях отделки. Советы от профессионалов.",
  url: "https://sk-rosa.ru/blog",
  publisher: {
    "@type": "Organization",
    name: "ROSA",
    logo: {
      "@type": "ImageObject",
      url: "https://sk-rosa.ru/assets/images/common/rosa-logo.png",
    },
  },
};
