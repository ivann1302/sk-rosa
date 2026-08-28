import instrumentSourceA from "../../docs/rent4work-instrument-a.json" with { type: "json" };
import instrumentSourceB from "../../docs/rent4work-instrument-b.json" with { type: "json" };
import constructionSource from "../../docs/rent4work-construction.json" with { type: "json" };

const SOURCE_CHECKED_AT = "2026-08-27";
const GENERIC_PREVIEW_IMAGE = "/assets/images/rental-preview/rental-service-hero.webp";
const GENERIC_PREVIEW_SIZE = [1536, 1024];
const categoryPhotoProfiles = {
  Краскопульты: {
    src: "/assets/images/rental-preview/aktispray-avs-6001hd-real.webp",
    size: [1200, 900],
    alt: "Реальный окрасочный аппарат AktiSpray AvS-6001HD на белом фоне",
  },
  "Монтажные пистолеты": {
    src: "/assets/images/rental-preview/gas-nailer.webp",
    size: [450, 450],
    alt: "Реальный газовый монтажный пистолет TOUA на белом фоне",
  },
  "Монтажный инструмент для труб": {
    src: "/assets/images/rental-preview/pipe-bender.webp",
    size: [1400, 934],
    alt: "Реальный гидравлический трубогиб Gigant на белом фоне",
  },
  Перфораторы: {
    src: "/assets/images/rental-preview/makita-hr2470-real.webp",
    size: [1000, 1000],
    alt: "Реальный перфоратор Makita HR2470 на белом фоне",
  },
  Штроборезы: {
    src: "/assets/images/rental-preview/wall-chaser-photo-v2.webp",
    size: [1536, 1024],
    alt: "Реальный штроборез ATLET на нейтральном фоне мастерской",
  },
  "Бензорезы и бетонорезы": {
    src: "/assets/images/rental-preview/cutoff-saw.webp",
    size: [750, 500],
    alt: "Реальный бензорез Steviman на белом фоне",
  },
  Бетоносмесители: {
    src: "/assets/images/rental-preview/mixer.webp",
    size: [1080, 1080],
    alt: "Реальный бетоносмеситель на производственной площадке",
  },
  "Осушители воздуха": {
    src: "/assets/images/rental-preview/dehumidifier.webp",
    size: [709, 750],
    alt: "Реальный промышленный осушитель воздуха Master на белом фоне",
  },
  Плиткорезы: {
    src: "/assets/images/rental-preview/tile-cutter.webp",
    size: [500, 400],
    alt: "Реальный ручной плиткорез KRAFTOOL на белом фоне",
  },
  "Строительные и моющие пылесосы": {
    src: "/assets/images/rental-preview/vacuum.webp",
    size: [1400, 1400],
    alt: "Реальный строительный пылесос Karcher с комплектом насадок",
  },
};

function photoProfileForCategory(category) {
  return categoryPhotoProfiles[category] ?? {
    src: GENERIC_PREVIEW_IMAGE,
    size: GENERIC_PREVIEW_SIZE,
    alt: "Реальный набор профессионального инструмента в мастерской",
  };
}

const existingModelAliases = [
  "сбмини80",
  "masterdh92",
  "сварогarc200realsmart",
  "stevimangs940",
  "karcherwd3pworkshop",
  "atletpwc180j",
  "makitahr2470",
  "touagsn50e",
  "kraftoolgrand1200",
  "gigantmhpj16",
  "messerecf350",
  "aktisprayavs6001hd",
];

const existingSlugs = new Set([
  "arenda-betonosmesitelya-prinuditelnogo-deystviya",
  "arenda-osushitelya-vozduha-master-dh-92",
  "arenda-svarochnogo-invertora-svarog-arc-200-real-smart",
  "arenda-benzoreza-steviman-gs940-16",
  "arenda-stroitelnogo-pylesosa-karcher-wd3-p-workshop",
  "arenda-shtroboreza-atlet-pwc180j",
  "arenda-perforatora-makita-hr2470",
  "arenda-gazovogo-montazhnogo-pistoleta-toua-gsn50e",
  "arenda-ruchnogo-plitkoreza-kraftool-grand-1200",
  "arenda-gidravlicheskogo-trubogiba-gigant-mhpj-16",
  "arenda-betonoreza-messer-ecf350",
  "arenda-okrasochnogo-apparata-aktispray-avs-6001hd",
]);

const detailedCategoryBySlug = {
  "arenda-betonosmesitelya-prinuditelnogo-deystviya": [
    "Строительное оборудование",
    "Бетоносмесители",
  ],
  "arenda-osushitelya-vozduha-master-dh-92": ["Строительное оборудование", "Осушители воздуха"],
  "arenda-svarochnogo-invertora-svarog-arc-200-real-smart": [
    "Силовая техника",
    "Сварочное оборудование",
  ],
  "arenda-benzoreza-steviman-gs940-16": [
    "Строительное оборудование",
    "Бензорезы и бетонорезы",
  ],
  "arenda-stroitelnogo-pylesosa-karcher-wd3-p-workshop": [
    "Строительное оборудование",
    "Строительные и моющие пылесосы",
  ],
  "arenda-shtroboreza-atlet-pwc180j": ["Инструмент", "Штроборезы"],
  "arenda-perforatora-makita-hr2470": ["Инструмент", "Перфораторы"],
  "arenda-gazovogo-montazhnogo-pistoleta-toua-gsn50e": [
    "Инструмент",
    "Монтажные пистолеты",
  ],
  "arenda-ruchnogo-plitkoreza-kraftool-grand-1200": [
    "Строительное оборудование",
    "Плиткорезы",
  ],
  "arenda-gidravlicheskogo-trubogiba-gigant-mhpj-16": [
    "Инструмент",
    "Монтажный инструмент для труб",
  ],
  "arenda-betonoreza-messer-ecf350": [
    "Строительное оборудование",
    "Бензорезы и бетонорезы",
  ],
  "arenda-okrasochnogo-apparata-aktispray-avs-6001hd": ["Инструмент", "Краскопульты"],
};

const detailedRentalNamesBySlug = {
  "arenda-betonosmesitelya-prinuditelnogo-deystviya":
    "бетоносмесителя принудительного действия СБ-мини 80",
  "arenda-osushitelya-vozduha-master-dh-92": "осушителя воздуха Master DH 92",
  "arenda-svarochnogo-invertora-svarog-arc-200-real-smart":
    "сварочного инвертора Сварог ARC 200 REAL SMART",
  "arenda-benzoreza-steviman-gs940-16": "бензореза Steviman GS940 16″",
  "arenda-stroitelnogo-pylesosa-karcher-wd3-p-workshop":
    "строительного пылесоса Karcher WD3 P Workshop",
  "arenda-shtroboreza-atlet-pwc180j": "штробореза ATLET PWC180J",
  "arenda-perforatora-makita-hr2470": "перфоратора Makita HR2470",
  "arenda-gazovogo-montazhnogo-pistoleta-toua-gsn50e":
    "газового монтажного пистолета TOUA GSN50E",
  "arenda-ruchnogo-plitkoreza-kraftool-grand-1200":
    "ручного плиткореза KRAFTOOL Grand-1200",
  "arenda-gidravlicheskogo-trubogiba-gigant-mhpj-16":
    "гидравлического трубогиба Gigant MHPJ-16",
  "arenda-betonoreza-messer-ecf350": "бетонореза MESSER ECF350, 350 мм",
  "arenda-okrasochnogo-apparata-aktispray-avs-6001hd":
    "окрасочного аппарата AktiSpray AvS-6001HD",
};

const detailedSeoRentalNamesBySlug = {
  "arenda-betonosmesitelya-prinuditelnogo-deystviya": "бетоносмесителя СБ-мини 80",
  "arenda-osushitelya-vozduha-master-dh-92": "осушителя Master DH 92",
  "arenda-svarochnogo-invertora-svarog-arc-200-real-smart": "инвертора Сварог ARC 200",
  "arenda-benzoreza-steviman-gs940-16": "бензореза Steviman GS940",
  "arenda-stroitelnogo-pylesosa-karcher-wd3-p-workshop": "пылесоса Karcher WD3 P",
  "arenda-shtroboreza-atlet-pwc180j": "штробореза ATLET PWC180J",
  "arenda-perforatora-makita-hr2470": "перфоратора Makita HR2470",
  "arenda-gazovogo-montazhnogo-pistoleta-toua-gsn50e": "пистолета TOUA GSN50E",
  "arenda-ruchnogo-plitkoreza-kraftool-grand-1200": "плиткореза KRAFTOOL Grand-1200",
  "arenda-gidravlicheskogo-trubogiba-gigant-mhpj-16": "трубогиба Gigant MHPJ-16",
  "arenda-betonoreza-messer-ecf350": "бетонореза MESSER ECF350",
  "arenda-okrasochnogo-apparata-aktispray-avs-6001hd": "аппарата AktiSpray AvS-6001HD",
};

const transliteration = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "j",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function sourceProducts(source) {
  return Array.isArray(source) ? source : source.products;
}

function normalizeText(value) {
  return value
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е")
    .replace(/[^a-zа-я0-9]+/gu, "");
}

function slugify(value) {
  return [...value.toLocaleLowerCase("ru-RU")]
    .map(character => transliteration[character] ?? character)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function sourceSlug(product) {
  try {
    const pathname = new URL(product.sourceUrl).pathname.replace(/\/$/, "");
    const sourceSegment = decodeURIComponent(pathname.split("/").at(-1) ?? "");
    const segment = slugify(sourceSegment);

    return segment.startsWith("arenda-") ? segment : `arenda-${segment}`;
  } catch {
    return `arenda-${slugify(product.name)}`;
  }
}

function categoryPreference(category) {
  if (category === "Шуруповерты" || category === "Монтажный инструмент REHAU") {
    return 2;
  }

  return 1;
}

const mergedCategoryBySource = {
  Дрели: "Дрели и шуруповерты",
  Шуруповерты: "Дрели и шуруповерты",
  "Монтажный инструмент REHAU": "Монтажный инструмент для труб",
  "Монтажный инструмент для труб": "Монтажный инструмент для труб",
  Штроборезы: "Штроборезы",
  "Штроборезы с пылесосом": "Штроборезы",
  Бензорезы: "Бензорезы и бетонорезы",
  "Электрические бетонорезы": "Бензорезы и бетонорезы",
  "Моющие пылесосы": "Строительные и моющие пылесосы",
  "Промышленные пылесосы": "Строительные и моющие пылесосы",
};

function mergedCategoryName(sourceCategory) {
  return mergedCategoryBySource[sourceCategory] ?? sourceCategory;
}

function deduplicateSourceProducts(products) {
  const byUrl = new Map();

  for (const product of products) {
    const existing = byUrl.get(product.sourceUrl);

    if (!existing || categoryPreference(product.category) > categoryPreference(existing.category)) {
      byUrl.set(product.sourceUrl, { ...product, name: product.name.trim() });
    }
  }

  const seenNames = new Set();

  return [...byUrl.values()].filter(product => {
    const normalizedName = normalizeText(product.name);

    if (existingModelAliases.some(alias => normalizedName.includes(alias))) {
      return false;
    }

    if (seenNames.has(normalizedName)) {
      return false;
    }

    seenNames.add(normalizedName);
    return true;
  });
}

function profileFor(category) {
  const normalizedCategory = category.toLocaleLowerCase("ru-RU");

  if (/краскопульт|штукатурн/.test(normalizedCategory)) {
    return {
      visualKind: "airless-sprayer",
      task: "нанесения совместимых строительных и отделочных составов",
      useCases: ["отделочные работы", "ремонт помещений", "работы на строительном объекте"],
    };
  }

  if (/штроборез/.test(normalizedCategory)) {
    return {
      visualKind: "wall-chaser",
      task: "штробления и подготовки каналов в строительных основаниях",
      useCases: ["прокладка инженерных коммуникаций", "ремонт помещений", "монтажные работы"],
    };
  }

  if (/пылесос/.test(normalizedCategory)) {
    return {
      visualKind: "vacuum",
      task: "сбора строительной пыли и загрязнений",
      useCases: ["уборка после ремонта", "пылеудаление при работе", "подготовка помещений"],
    };
  }

  if (/осушител|теплов/.test(normalizedCategory)) {
    return {
      visualKind: "dehumidifier",
      task: "поддержания требуемых условий на строительном объекте",
      useCases: ["просушка помещений", "ремонт и отделка", "временное климатическое оборудование"],
    };
  }

  if (/плиткорез/.test(normalizedCategory)) {
    return {
      visualKind: "tile-cutter",
      task: "резки плитки и совместимых облицовочных материалов",
      useCases: ["укладка плитки", "работа с облицовочными материалами", "отделочные работы"],
    };
  }

  if (/труб|клупп|опрессов/.test(normalizedCategory)) {
    return {
      visualKind: "pipe-bender",
      task: "монтажа и обработки трубных систем",
      useCases: ["монтаж труб", "инженерные системы", "сантехнические работы"],
    };
  }

  if (/монтажн.*пистолет|шпилько|скобозабив/.test(normalizedCategory)) {
    return {
      visualKind: "gas-nailer",
      task: "прямого монтажа и крепёжных работ",
      useCases: ["прямой монтаж", "крепёжные работы", "монтаж конструкций"],
    };
  }

  if (/бетоносмес|миксер|вибратор|виброрей|затироч/.test(normalizedCategory)) {
    return {
      visualKind: "mixer",
      task: "бетонных, растворных и общестроительных работ",
      useCases: ["приготовление и обработка смесей", "бетонные работы", "устройство оснований"],
    };
  }

  if (/болгар|бензорез|бетонорез|резчик швов|ножниц|пилы/.test(normalizedCategory)) {
    return {
      visualKind: "cutoff-saw",
      task: "резки и обработки совместимых строительных материалов",
      useCases: ["резка строительных материалов", "демонтаж", "ремонтные работы"],
    };
  }

  if (/магнит.*сверл/.test(normalizedCategory)) {
    return {
      visualKind: "rotary-hammer",
      task: "точного сверления отверстий в металлоконструкциях",
      useCases: ["сверление металла", "монтаж металлоконструкций", "работы на строительном объекте"],
    };
  }

  if (/перфорат|дрел|бурен|сверл|отбой/.test(normalizedCategory)) {
    return {
      visualKind: "rotary-hammer",
      task: "сверления, бурения и демонтажных работ",
      useCases: ["бурение отверстий", "монтажные работы", "локальный демонтаж"],
    };
  }

  if (/шлифов|реноватор|рубанк|рейсмус|фрезер/.test(normalizedCategory)) {
    return {
      visualKind: "wall-chaser",
      task: "обработки и подготовки строительных поверхностей",
      useCases: ["обработка поверхностей", "подготовка основания", "ремонтные работы"],
    };
  }

  return {
    visualKind: "rotary-hammer",
    task: "профессиональных строительных и монтажных работ",
    useCases: ["строительство", "ремонт", "монтажные работы"],
  };
}

function selectionPromptFor(category) {
  const normalizedCategory = category.toLocaleLowerCase("ru-RU");

  if (/краскопульт|штукатурн/.test(normalizedCategory)) {
    return "Сообщите тип состава, площадь нанесения, требуемую фактуру и доступное питание на объекте.";
  }

  if (/болгар|бензорез|бетонорез|резчик швов|ножниц|пилы/.test(normalizedCategory)) {
    return "Укажите материал, его толщину, требуемую глубину реза и условия работы внутри или снаружи помещения.";
  }

  if (/магнит.*сверл/.test(normalizedCategory)) {
    return "Укажите марку и толщину металла, требуемые диаметр и глубину отверстий, а также условия установки станка.";
  }

  if (/перфорат|дрел|бурен|сверл|отбой/.test(normalizedCategory)) {
    return "Укажите материал основания, диаметр и глубину отверстий либо объём демонтажа.";
  }

  if (/труб|клупп|опрессов/.test(normalizedCategory)) {
    return "Сообщите материал и диаметр трубы, тип соединения и требуемое рабочее давление.";
  }

  if (/пылесос/.test(normalizedCategory)) {
    return "Укажите тип загрязнения, объём уборки и нужна ли совместная работа с электроинструментом.";
  }

  if (/осушител|теплов/.test(normalizedCategory)) {
    return "Сообщите площадь и высоту помещения, текущую температуру, влажность и доступную электросеть.";
  }

  if (/плиткорез/.test(normalizedCategory)) {
    return "Укажите вид плитки, максимальный формат, толщину материала и требуемый тип реза.";
  }

  if (/монтажн.*пистолет|шпилько|скобозабив/.test(normalizedCategory)) {
    return "Сообщите материал основания, тип крепежа, толщину закрепляемой детали и объём монтажа.";
  }

  if (/бетоносмес|миксер|вибратор|виброрей|затироч/.test(normalizedCategory)) {
    return "Укажите вид смеси или бетона, объём работ, толщину слоя и доступное питание на объекте.";
  }

  if (/шлифов|реноватор|рубанк|рейсмус|фрезер/.test(normalizedCategory)) {
    return "Сообщите материал, площадь обработки, требуемый результат и возможность подключения пылеудаления.";
  }

  return "Укажите материал, объём работ, условия на объекте и доступное питание — этого достаточно для первичного подбора.";
}

function createImportedItem(product, group, slug) {
  const categoryName = mergedCategoryName(product.category);
  const categorySlug = slugify(categoryName);
  const profile = profileFor(categoryName);
  const photo = photoProfileForCategory(categoryName);
  const summary = `${product.name} в аренду для ${profile.task}. ${product.priceLabel}. Наличие и итоговые условия на выбранные даты подтверждает менеджер.`;

  return {
    slug,
    name: product.name,
    shortName: product.name,
    type: product.category,
    popularName: null,
    alternateNames: [],
    group,
    groupSlug: slugify(group),
    categoryName,
    categorySlug,
    sourceCategoryName: product.category,
    visualKind: profile.visualKind,
    visualLabel: product.category,
    visualAlt: photo.alt,
    previewImage: photo.src,
    previewImageSize: photo.size,
    representativeImage: true,
    priceFrom: product.priceFrom,
    priceLabel: product.priceLabel,
    priceCaption: "наличие и итоговый тариф уточняйте",
    summary,
    task: profile.task,
    useCases: profile.useCases,
    selectionPrompt: selectionPromptFor(categoryName),
    availabilityMode: "on-request",
    importedFrom: "Rent4Work",
    sourceCheckedAt: SOURCE_CHECKED_AT,
    sourceAvailability: product.availability,
    sourceUrl: product.sourceUrl,
  };
}

const rawProducts = [
  ...sourceProducts(instrumentSourceA).map(product => ({ ...product, group: "Инструмент" })),
  ...sourceProducts(instrumentSourceB).map(product => ({ ...product, group: "Инструмент" })),
  ...sourceProducts(constructionSource).map(product => ({
    ...product,
    group: "Строительное оборудование",
  })),
];
const deduplicatedProducts = deduplicateSourceProducts(rawProducts);
const usedSlugs = new Set(existingSlugs);
const sourceUniqueCount = new Set(rawProducts.map(product => product.sourceUrl)).size;

export const importedRentalEquipment = deduplicatedProducts.map(product => {
  const baseSlug = sourceSlug(product);
  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return createImportedItem(product, product.group, slug);
});

export const rentalImportStats = {
  sourceCount: rawProducts.length,
  sourceUniqueCount,
  sourceDuplicateCount: rawProducts.length - sourceUniqueCount,
  importedCount: importedRentalEquipment.length,
  existingMatchesExcluded: sourceUniqueCount - deduplicatedProducts.length,
};

export function enrichDetailedRentalEquipment(items) {
  return items.map(item => {
    const [group = "Другое", categoryName = item.type] = detailedCategoryBySlug[item.slug] ?? [];
    const mergedCategory = mergedCategoryName(categoryName);
    const rentalName = detailedRentalNamesBySlug[item.slug];
    const seoRentalName = detailedSeoRentalNamesBySlug[item.slug];

    return {
      ...item,
      rentalName,
      seoRentalName,
      serviceType: `Аренда ${rentalName}`,
      seo: {
        ...item.seo,
        title: `Аренда ${seoRentalName} — Москва, Долгопрудный | ROSA`,
        description: `Аренда ${rentalName} в Москве и Долгопрудном: ${item.priceLabel}. Самовывоз, доставка по Москве и МО, договор; наличие на выбранные даты.`,
      },
      group,
      groupSlug: slugify(group),
      categoryName: mergedCategory,
      categorySlug: slugify(mergedCategory),
      availabilityMode: "in-stock",
      representativeImage: false,
    };
  });
}
