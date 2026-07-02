/**
 * Таблица цен для стяжки пола
 */

import { PricingTable } from "./pricing-table.js";

const floorScreedPricingData = [
  {
    service: "Полусухая стяжка пола до 5 см",
    price: "от 900",
    unit: "м²",
  },
  {
    service: "Цементно-песчаная стяжка более 5 см",
    price: "от 1023",
    unit: "м²",
  },
  {
    service: "Стяжка под тёплый пол",
    price: "от 1100",
    unit: "м²",
  },
  {
    service: "Выравнивание пола самонивелирующей смесью",
    price: "от 680",
    unit: "м²",
  },
  {
    service: "Подсыпка керамзита для поднятия уровня пола",
    price: "от 246",
    unit: "м²",
  },
  {
    service: "Грунтование основания",
    price: "от 50",
    unit: "м²",
  },
  {
    service: "Монтаж армирующей сетки",
    price: "бесплатно при заливке и стяжке пола",
    unit: "м²",
  },
  {
    service: "Монтаж демпферной ленты",
    price: "бесплатно при заливке и стяжке пола",
    unit: "м²",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("pricing-table-floor-screed");

  if (container) {
    new PricingTable("pricing-table-floor-screed", floorScreedPricingData);
  }
});
