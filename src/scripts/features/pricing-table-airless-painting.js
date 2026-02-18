/**
 * Таблица цен для безвоздушной покраски
 */

import { PricingTable } from "./pricing-table.js";

const airlessPaintingPricingData = [
  {
    service: "Механизированная покраска стен",
    price: "от 90",
    unit: "м²",
  },
  {
    service: "Безвоздушная покраска потолка",
    price: "от 130",
    unit: "м²",
  },
  {
    service: "Покраска фасада",
    price: "от 120",
    unit: "м²",
  },
  {
    service: "Покраска стен и потолков с разделением цвета",
    price: "от 350",
    unit: "м²",
  },
  {
    service: "Покраска металлоконструкции",
    price: "от 400",
    unit: "пог.м",
  },
  {
    service: "Нанесение грунтовки",
    price: "от 50",
    unit: "м²",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("pricing-table-airless-painting");

  if (container) {
    new PricingTable("pricing-table-airless-painting", airlessPaintingPricingData);
  }
});
