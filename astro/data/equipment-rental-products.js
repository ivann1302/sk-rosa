import rentalCatalogImages from "./equipment-rental-images.json" with { type: "json" };
import rentalCatalogProducts from "./equipment-rental-products.json" with { type: "json" };

const genericPreview = {
  src: "/assets/images/rental-preview/rental-service-hero.webp",
  size: [1536, 1024],
  alt: "Профессиональный инструмент на белом фоне",
};

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
  "arenda-benzoreza-steviman-gs940-16": ["Строительное оборудование", "Бензорезы и бетонорезы"],
  "arenda-stroitelnogo-pylesosa-karcher-wd3-p-workshop": [
    "Строительное оборудование",
    "Строительные и моющие пылесосы",
  ],
  "arenda-shtroboreza-atlet-pwc180j": ["Инструмент", "Штроборезы"],
  "arenda-perforatora-makita-hr2470": ["Инструмент", "Перфораторы"],
  "arenda-gazovogo-montazhnogo-pistoleta-toua-gsn50e": ["Инструмент", "Монтажные пистолеты"],
  "arenda-ruchnogo-plitkoreza-kraftool-grand-1200": ["Строительное оборудование", "Плиткорезы"],
  "arenda-gidravlicheskogo-trubogiba-gigant-mhpj-16": [
    "Инструмент",
    "Монтажный инструмент для труб",
  ],
  "arenda-betonoreza-messer-ecf350": ["Строительное оборудование", "Бензорезы и бетонорезы"],
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
  "arenda-gazovogo-montazhnogo-pistoleta-toua-gsn50e": "газового монтажного пистолета TOUA GSN50E",
  "arenda-ruchnogo-plitkoreza-kraftool-grand-1200": "ручного плиткореза KRAFTOOL Grand-1200",
  "arenda-gidravlicheskogo-trubogiba-gigant-mhpj-16": "гидравлического трубогиба Gigant MHPJ-16",
  "arenda-betonoreza-messer-ecf350": "бетонореза MESSER ECF350, 350 мм",
  "arenda-okrasochnogo-apparata-aktispray-avs-6001hd": "окрасочного аппарата AktiSpray AvS-6001HD",
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

function priceLabel(price) {
  return `от ${price.toLocaleString("ru-RU")} ₽/сутки`;
}

function slugify(value) {
  return [...value.toLocaleLowerCase("ru-RU")]
    .map(character => transliteration[character] ?? character)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
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
      useCases: [
        "сверление металла",
        "монтаж металлоконструкций",
        "работы на строительном объекте",
      ],
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

function createCatalogItem(product) {
  const categoryName = mergedCategoryName(product.category);
  const categorySlug = slugify(categoryName);
  const profile = profileFor(categoryName);
  const photo = rentalCatalogImages[product.slug] ?? genericPreview;
  const normalizedPriceLabel = priceLabel(product.priceFrom);
  const unavailable = product.availability === "unavailable";
  const summary = unavailable
    ? `${product.name} для ${profile.task}. Позиция временно недоступна — уточните срок поступления у менеджера.`
    : `${product.name} в аренду для ${profile.task}. Стоимость ${normalizedPriceLabel}. Наличие и итоговые условия на выбранные даты подтверждает менеджер.`;

  return {
    slug: product.slug,
    name: product.name,
    shortName: product.name,
    type: product.category,
    popularName: null,
    alternateNames: [],
    group: product.group,
    groupSlug: slugify(product.group),
    categoryName,
    categorySlug,
    visualKind: profile.visualKind,
    visualLabel: product.category,
    visualAlt: photo.alt,
    previewImage: photo.src,
    previewImageSize: photo.size,
    representativeImage: false,
    priceFrom: product.priceFrom,
    priceLabel: normalizedPriceLabel,
    priceCaption: "наличие и итоговый тариф уточняйте",
    summary,
    task: profile.task,
    useCases: profile.useCases,
    selectionPrompt: selectionPromptFor(categoryName),
    availabilityMode: unavailable ? "unavailable" : "on-request",
    catalogEntry: true,
  };
}

export const rentalCatalogEquipment = rentalCatalogProducts.map(createCatalogItem);

export const rentalCatalogDataStats = {
  catalogEntryCount: rentalCatalogEquipment.length,
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
