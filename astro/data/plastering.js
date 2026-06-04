import { serviceReviews } from "./service-reviews.js";

export const plasteringPage = {
  seo: {
    title: "Штукатурка стен в Москве — машинное нанесение | ROSA",
    description:
      "Гипсовая и цементная штукатурка стен в Москве ➤ Машинное нанесение, работа с маяками. Цена от 450 руб/м². Бесплатный замер. ☎ 8(985) 135-49-91",
    canonical: "https://sk-rosa.ru/plastering",
    ogTitle: "Штукатурные работы в Москве и МО | ROSA - Штукатурка стен и потолков от 450 рублей",
    ogDescription:
      "Профессиональные штукатурные работы в Москве и МО. Штукатурка стен и потолков, выравнивание поверхностей. Цена от 450 руб Гарантия качества.",
    ogImageAlt: "Штукатурные работы в Москве и МО - ROSA",
  },
  hero: {
    title: "Механизированная штукатурка в Москве и области",
    subtitle:
      "Гипсовая и цементная штукатурка под покраску, обои и плитку - ровно по маякам, по договору с фиксированной ценой. Работаем в Москве и Московской области.",
    badges: ["от 450 ₽/м²"],
    ctaLabel: "Заказать штукатурку",
    ctaHref: "#contact-request",
    image: {
      webp: "/assets/images/common/plastering-hero.webp",
      fallback: "/assets/images/common/plastering-hero.webp",
      alt: "Штукатурные работы",
    },
    video:
      "/assets/videos/social_u2928876119_Realistic_close-up._A_male_hand_in_a_work_glove_a_d7ad7413-90d7-499d-9b47-d5efe2543202_1.mp4",
  },
  advantages: [
    {
      icon: "/assets/icons/features/advantages/hourglass-empty.svg",
      alt: "7+ лет опыта",
      value: "7+",
      description: "лет опыта - работаем на рынке ремонта в Москве и Московской области",
    },
    {
      icon: "/assets/icons/features/advantages/checks.svg",
      alt: "Более 150 сданных объектов",
      value: "150+",
      description: "объектов оштукатурено в квартирах, домах и коммерческих помещениях",
    },
    {
      icon: "/assets/icons/features/advantages/badge-check.svg",
      alt: "Гарантия 3 года по договору",
      value: "3 года",
      description: "гарантии - фиксируем в официальном договоре, без скрытых условий",
    },
    {
      icon: "/assets/icons/features/advantages/circle-dashed-check.svg",
      alt: "Бесплатный выезд специалиста",
      value: "0 ₽",
      description: "за выезд - бесплатный замер и точный расчёт стоимости на объекте",
    },
  ],
  stages: {
    title: "Этапы штукатурных работ",
    subtitle:
      "Штукатурные работы - это технологичный способ выравнивания стен и потолков, обеспечивающий идеальную поверхность для дальнейшей отделки. Работы выполняются в 5 этапов:",
    items: [
      {
        title: "Замер и точный расчет стоимости",
        description:
          "Приезжаем на объект, оцениваем состояние стен, считаем площадь и подбираем технологию. После замера фиксируем понятную смету по материалам и работам.",
      },
      {
        title: "Заключение договора",
        description:
          "Согласовываем сроки, стоимость, состав работ и условия оплаты. Все договоренности закрепляем в договоре до начала работ.",
      },
      {
        title: "Выполнение работ",
        description:
          "Подготавливаем основание, выставляем маяки и выполняем штукатурку по выбранной технологии. Контролируем геометрию стен на каждом этапе.",
      },
      {
        title: "Сдача и приемка работ",
        description:
          "Проверяем качество поверхности, убираем рабочую зону и передаем объект заказчику. Работы принимаются после финального осмотра.",
      },
    ],
  },
  taskList: [
    {
      name: "Штукатурка по маякам",
      description: "Самый популярный способ - идеально ровные стены под покраску и плитку",
    },
    {
      name: "Черновая штукатурка (кирпич, бетон, блоки)",
      description: "Быстрое и прочное выравнивание основания в новостройках и при ремонте",
    },
    {
      name: "Финишная шпаклёвка",
      description: "Завершающий этап перед обоями, покраской или декоративной отделкой",
    },
    {
      name: "Восстановление старых стен",
      description: "Выравнивание и ремонт снесённых, кривых или осыпающихся поверхностей",
    },
  ],
  workCases: {
    title: "Кейсы по штукатурным работам",
    subtitle:
      "Примеры объектов с разным объёмом, назначением и геометрией помещений. В каждом кейсе - несколько фотографий с объекта.",
    items: [
      {
        title: "Коттедж в Красногорске",
        location: "Красногорск",
        description:
          "Выполнили штукатурку стен по маякам в коттедже и подготовили поверхности под дальнейшую чистовую отделку.",
        images: [
          {
            src: "/assets/images/plastering-example/11.webp",
            alt: "Штукатурные работы в коттедже в Красногорске",
            width: 960,
            height: 1280,
          },
          {
            src: "/assets/images/plastering-example/111.webp",
            alt: "Оштукатуренные стены коттеджа в Красногорске",
            width: 960,
            height: 1280,
          },
          {
            src: "/assets/images/plastering-example/1111.webp",
            alt: "Финишная геометрия стен в коттедже в Красногорске",
            width: 960,
            height: 1280,
          },
        ],
        facts: [
          { label: "Площадь стен", value: "215 м²" },
          { label: "Объект", value: "коттедж" },
          { label: "Технология", value: "по маякам" },
        ],
      },
      {
        title: "Ресторан в историческом здании",
        location: "Рядом с Белорусским вокзалом",
        description:
          "Подготовили стены ресторана в историческом здании с учётом сложных проёмов, ниш и будущей декоративной отделки.",
        images: [
          {
            src: "/assets/images/plastering-example/333.webp",
            alt: "Штукатурные работы в ресторане рядом с Белорусским вокзалом",
            width: 960,
            height: 1280,
          },
          {
            src: "/assets/images/plastering-example/3333.webp",
            alt: "Помещение ресторана после штукатурных работ",
            width: 960,
            height: 1280,
          },
        ],
        facts: [
          { label: "Объект", value: "ресторан" },
          { label: "Здание", value: "историческое" },
          { label: "Локация", value: "Белорусская" },
        ],
      },
      {
        title: "Частный дом в Одинцово",
        location: "Одинцово",
        description:
          "Механизированная штукатурка стен в частном доме с большим объёмом и высокими помещениями.",
        images: [
          {
            src: "/assets/images/plastering-example/22.webp",
            alt: "Штукатурка стен в частном доме в Одинцово",
            width: 960,
            height: 1280,
          },
          {
            src: "/assets/images/plastering-example/222.webp",
            alt: "Высокое помещение частного дома в Одинцово после штукатурки",
            width: 960,
            height: 1280,
          },
          {
            src: "/assets/images/plastering-example/22222.webp",
            alt: "Штукатурные работы в частном доме в Одинцово",
            width: 960,
            height: 1280,
          },
        ],
        facts: [
          { label: "Площадь стен", value: "348 м²" },
          { label: "Объект", value: "частный дом" },
          { label: "Зоны", value: "жилые" },
        ],
      },
      {
        title: "Загородный дом в Королёве",
        location: "Королёв",
        description:
          "Большой загородный дом: вывели стены по плоскости на площади более 500 м² и подготовили объект к следующим этапам отделки.",
        images: [
          {
            src: "/assets/images/plastering-example/44.webp",
            alt: "Штукатурка стен в загородном доме в Королёве",
            width: 960,
            height: 1280,
          },
          {
            src: "/assets/images/plastering-example/444.webp",
            alt: "Подготовленные стены загородного дома в Королёве",
            width: 960,
            height: 1280,
          },
          {
            src: "/assets/images/plastering-example/4444.webp",
            alt: "Штукатурные работы в загородном доме в Королёве",
            width: 960,
            height: 1280,
          },
        ],
        facts: [
          { label: "Площадь стен", value: "500+ м²" },
          { label: "Объект", value: "загородный дом" },
          { label: "Контроль", value: "по плоскости" },
        ],
      },
    ],
  },
  priceCalc: {
    serviceSlug: "plastering",
    quizTitle: "Предварительная смета штукатурки за 1 минуту",
    areaPresets: [
      { label: "до 50 м²", value: "40" },
      { label: "50-100 м²", value: "80" },
      { label: "100-200 м²", value: "150" },
      { label: "200-300 м²", value: "250" },
      { label: "более 300 м²", value: "400" },
    ],
    propertyTypes: [
      "Квартира / новостройка",
      "Частный дом / коттедж",
      "Офис / магазин / кафе",
      "Склад / цех / автосервис",
    ],
    coatings: ["Под обои", "Под покраску", "Под плитку", "Не знаю — подскажите"],
    quizFormSource: "Калькулятор штукатурки",
    miniCalcFormSource: "Мини-калькулятор штукатурки",
    articles: [
      { href: "/shtukaturka-sten-v-novostrojke", label: "Штукатурка стен в новостройке" },
      { href: "/vybor-shtukaturki", label: "Какую штукатурку выбрать для стен" },
      { href: "/mashinnaya-ili-ruchnaya-shtukaturka", label: "Машинная или ручная штукатурка" },
    ],
    plasterTypes: [
      { label: "Гипсовая машинная - 450 ₽/м²", value: "Гипсовая машинная", rate: "450" },
      { label: "Цементная машинная - 500 ₽/м²", value: "Цементная машинная", rate: "500" },
      { label: "Фасадная - 1000 ₽/м²", value: "Штукатурка фасада", rate: "1000" },
    ],
  },
  contact: {
    title: "Оставить заявку на бесплатную консультацию",
    subtitle:
      "Получите бесплатную консультацию и расчет стоимости штукатурки. Наши специалисты свяжутся с вами в течение 15 минут и ответят на все вопросы.",
    features: [
      "Бесплатный выезд специалиста",
      "Точный расчет стоимости",
      "Гарантия качества работ",
    ],
    comments: "Заявка на штукатурные работы",
    formSource: "Штукатурные работы",
  },
  reviews: serviceReviews,
  faqDescription:
    "Перед началом штукатурных работ у клиентов часто возникают схожие вопросы. Мы подготовили подробные разъяснения по видам штукатурки, этапам работ и техническим нюансам.",
  faq: [
    {
      question: "Какая штукатурка лучше - гипсовая или цементная?",
      answer:
        "Гипсовая - для сухих помещений, гладкая и лёгкая. Цементная - влагостойкая и прочная, подходит для ванных, кухонь и фасадов.",
    },
    {
      question: "Нужно ли шпаклевать после штукатурки?",
      answer:
        "Да, если хотите идеально гладкую поверхность под покраску или обои. Шпаклёвка - финальный выравнивающий слой.",
    },
    {
      question: "Выравниваете ли стены по маякам?",
      answer:
        "Да, работаем строго по маякам. Это обеспечивает точную геометрию, вертикальность и ровные стены без перепадов.",
    },
    {
      question: "Сколько стоит доставка материалов?",
      answer:
        "В пределах МКАД доставка материалов бесплатная. За МКАД - 4 000 ₽, за ЦКАД - рассчитываем индивидуально.",
    },
    {
      question: "Бесплатный ли выезд замерщика?",
      answer:
        "Да. Если начинаем работы, выезд замерщика входит в стоимость и фиксируется в договоре. Если работы не запускаем, стоимость выезда - 5 000 ₽.",
    },
    {
      question: "Цена окончательная?",
      answer:
        "После согласования цена фиксируется в договоре. При большом объёме и продолжении сотрудничества с нами действуют гибкие скидки.",
    },
  ],
  articles: [
    {
      href: "/shtukaturka-sten-v-novostrojke",
      title: "Штукатурка стен в новостройке: полное руководство по выбору смесей и технологий",
      image: "/assets/images/common/plastering-hero.webp",
      alt: "Штукатурка стен в новостройке",
      width: 600,
      height: 350,
    },
    {
      href: "/armirovanie-shtukaturki-setkoj",
      title: "Как армировать штукатурку сеткой: полная инструкция",
      image: "/assets/images/common/plaster-reinforcement-mesh.webp",
      alt: "Армирование штукатурки сеткой",
      width: 600,
      height: 350,
    },
    {
      href: "/shtukaturka-guide",
      title: "Как правильно штукатурить стены: пошаговое руководство",
      image: "/assets/images/common/how-to-plastering.webp",
      alt: "Как правильно штукатурить стены",
      width: 600,
      height: 350,
    },
    {
      href: "/mashinnaya-ili-ruchnaya-shtukaturka",
      title: "Механизированная или ручная штукатурка: что лучше для ремонта",
      image: "/assets/images/common/article-machine-shtukaturka.webp",
      alt: "Механизированная или ручная штукатурка",
      width: 600,
      height: 350,
    },
    {
      href: "/priemka-shtukaturnyh-rabot",
      title: "Приемка штукатурных работ: что проверить перед подписанием акта",
      image: "/assets/images/common/priemka-shtukaturki.webp",
      alt: "Приемка штукатурных работ",
      width: 600,
      height: 350,
    },
  ],
};

export const plasteringJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://sk-rosa.ru/plastering#service",
  url: "https://sk-rosa.ru/plastering",
  serviceType: "Штукатурные работы",
  name: "Профессиональные штукатурные работы",
  description:
    "Профессиональные штукатурные работы в Москве и Московской области. Штукатурка стен и потолков, выравнивание поверхностей. Качественные материалы, гарантия качества.",
  provider: {
    "@type": "LocalBusiness",
    name: "ROSA - Ремонт под ключ",
    "@id": "https://sk-rosa.ru/#business",
  },
  areaServed: [
    { "@type": "City", name: "Москва" },
    { "@type": "AdministrativeArea", name: "Московская область" },
  ],
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://sk-rosa.ru/plastering",
    servicePhone: "+79851354991",
    serviceSmsNumber: "+79851354991",
    availableLanguage: "Russian",
  },
  offers: {
    "@type": "Offer",
    priceCurrency: "RUB",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "430",
      priceCurrency: "RUB",
      unitCode: "MTK",
      unitText: "м²",
    },
    availability: "https://schema.org/InStock",
    url: "https://sk-rosa.ru/plastering",
  },
};
