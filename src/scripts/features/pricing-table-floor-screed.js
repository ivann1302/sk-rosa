/**
 * Таблица цен для стяжки пола
 */

import { PricingTable } from "./pricing-table.js";

const floorScreedPricingData = [
  {
    service: "Грунтование пола бетоноконтактом 1 слой",
    price: "100",
    unit: "м²",
  },
  {
    service: "Грунтование пола акриловой грунтовкой 1 слой",
    price: "от 50",
    unit: "м²",
  },
  {
    service: "Монтаж армирующей сетки",
    price: "бесплатно при заливке и стяжке пола",
    unit: "м²",
  },
  {
    service: "Устройство стяжки цементно-песчаной смесью до 5 см",
    price: "от 900",
    unit: "м²",
  },
  {
    service: "Устройство стяжки цементно-песчаной смесью более 5 см",
    price: "от 1023",
    unit: "м²",
  },
  {
    service: "Подсыпка керамзита для поднятия уровня пола",
    price: "от 246",
    unit: "м²",
  },
  {
    service: "Выравнивание пола самонивелирующей смесью",
    price: "от 680",
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
