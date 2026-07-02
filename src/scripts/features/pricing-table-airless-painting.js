/**
 * Таблица цен для безвоздушной покраски
 */

import { PricingTable } from "./pricing-table.js";

const airlessPaintingPricingData = [
  {
    service: "Безвоздушная покраска стен",
    price: "от 200",
    unit: "м²",
  },
  {
    service: "Безвоздушная покраска потолка",
    price: "от 250",
    unit: "м²",
  },
  {
    service: "Покраска фасада",
    price: "от 350",
    unit: "м²",
  },
  {
    service: "Покраска стен и потолков с разделением цвета",
    price: "от 350",
    unit: "м²",
  },
  {
    service: "Покраска металлоконструкций",
    price: "от 400",
    unit: "пог.м",
  },
  {
    service: "Нанесение грунтовки",
    price: "от 50",
    unit: "м²",
  },
  {
    service: "Выезд специалиста и предварительная смета",
    price: "бесплатно",
    unit: "шт",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("pricing-table-airless-painting");

  if (container) {
    new PricingTable("pricing-table-airless-painting", airlessPaintingPricingData);
  }
});
