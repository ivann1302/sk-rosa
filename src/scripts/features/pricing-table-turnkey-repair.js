/**
 * Таблица цен для ремонта под ключ
 */

import { PricingTable } from "./pricing-table.js";

const turnkeyRepairPricingData = [
  {
    service: "Косметический ремонт",
    price: "от 10000",
    unit: "м²",
  },
  {
    service: "Капитальный ремонт",
    price: "от 15000",
    unit: "м²",
  },
  {
    service: "Ремонт новостройки под ключ",
    price: "от 12000",
    unit: "м²",
  },
  {
    service: "Ремонт дома или коттеджа",
    price: "от 18000",
    unit: "м²",
  },
  {
    service: "Коммерческий ремонт",
    price: "от 9000",
    unit: "м²",
  },
  {
    service: "Бесплатный выезд и смета",
    price: "бесплатно",
    unit: "шт",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("pricing-table-turnkey-repair");

  if (container) {
    new PricingTable("pricing-table-turnkey-repair", turnkeyRepairPricingData);
  }
});
