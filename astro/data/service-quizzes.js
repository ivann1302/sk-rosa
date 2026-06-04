export const serviceQuizzes = {
  plastering: {
    serviceName: "штукатурным работам",
    questions: [
      {
        key: "area",
        title: "Какая площадь стен?",
        fieldName: "AREA_RANGE",
        options: ["До 100 м²", "До 200 м²", "Свыше 200 м²", "Нужен расчет"],
      },
      {
        key: "height",
        title: "Какая высота стен?",
        fieldName: "WALL_HEIGHT",
        options: ["До 3 м", "Свыше 3 м", "Не знаю"],
      },
      {
        key: "thickness",
        title: "Какая толщина штукатурки?",
        fieldName: "PLASTER_THICKNESS",
        options: ["30 мм", "Больше 30 мм", "Не знаю"],
      },
    ],
  },
  "floor-screed": {
    serviceName: "стяжке пола",
    questions: [
      {
        key: "area",
        title: "Какая площадь пола?",
        fieldName: "AREA_RANGE",
        options: ["До 50 м²", "50-100 м²", "100-200 м²", "Больше 200 м²"],
      },
      {
        key: "object",
        title: "Где делаем стяжку?",
        fieldName: "OBJECT_TYPE",
        options: ["Квартира", "Частный дом", "Коммерческий объект", "Склад или цех"],
      },
      {
        key: "coating",
        title: "Что планируете сверху?",
        fieldName: "COATING_TYPE",
        options: ["Плитка", "Ламинат или паркет", "Тёплый пол", "Пока не знаю"],
      },
    ],
  },
  "airless-painting": {
    serviceName: "безвоздушной покраске",
    questions: [
      {
        key: "area",
        title: "Какая площадь под покраску?",
        fieldName: "AREA_RANGE",
        options: ["До 100 м²", "100-300 м²", "300-700 м²", "Больше 700 м²"],
      },
      {
        key: "surface",
        title: "Что красим?",
        fieldName: "SURFACE_TYPE",
        options: ["Стены", "Потолки", "Фасад", "Металл или конструкции"],
      },
      {
        key: "condition",
        title: "В каком состоянии поверхность?",
        fieldName: "SURFACE_CONDITION",
        options: ["Готова под покраску", "Нужна подготовка", "Есть старое покрытие", "Не знаю"],
      },
    ],
  },
  "soft-roofing": {
    serviceName: "мягкой кровле",
    questions: [
      {
        key: "area",
        title: "Какая площадь крыши?",
        fieldName: "AREA_RANGE",
        options: ["До 50 м²", "50-100 м²", "100-200 м²", "Больше 200 м²"],
      },
      {
        key: "roof",
        title: "Какой тип крыши?",
        fieldName: "ROOF_TYPE",
        options: ["Плоская", "Простая скатная", "Сложная с узлами", "Гараж или пристройка"],
      },
      {
        key: "task",
        title: "Что нужно сделать?",
        fieldName: "ROOF_TASK",
        options: ["Новая кровля", "Ремонт протечек", "Замена покрытия", "Не знаю"],
      },
    ],
  },
  biozashchita: {
    serviceName: "огнебиозащите",
    questions: [
      {
        key: "area",
        title: "Какая площадь обработки?",
        fieldName: "AREA_RANGE",
        options: ["До 100 м²", "100-300 м²", "300-700 м²", "Больше 700 м²"],
      },
      {
        key: "object",
        title: "Какой объект?",
        fieldName: "OBJECT_TYPE",
        options: ["Частный дом", "Склад или ангар", "Производство", "Коммерческое помещение"],
      },
      {
        key: "construction",
        title: "Что обрабатываем?",
        fieldName: "CONSTRUCTION_TYPE",
        options: ["Дерево", "Металл", "Стропила и чердак", "Комплексно"],
      },
    ],
  },
  "turnkey-repair": {
    serviceName: "ремонту под ключ",
    questions: [
      {
        key: "area",
        title: "Какая площадь объекта?",
        fieldName: "AREA_RANGE",
        options: ["До 50 м²", "50-80 м²", "80-120 м²", "Больше 120 м²"],
      },
      {
        key: "object",
        title: "Что ремонтируем?",
        fieldName: "OBJECT_TYPE",
        options: ["Квартира", "Вторичное жильё", "Частный дом", "Офис или коммерция"],
      },
      {
        key: "repair",
        title: "Какой тип ремонта нужен?",
        fieldName: "REPAIR_TYPE",
        options: ["Косметический", "Капитальный", "Под ключ с материалами", "Нужна консультация"],
      },
    ],
  },
};

export function getServiceQuiz(serviceSlug) {
  return serviceQuizzes[serviceSlug] ?? null;
}
