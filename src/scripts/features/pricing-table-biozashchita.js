/**
 * Таблица цен для огнебиозащиты
 */

import { PricingTable } from "./pricing-table.js";

const biozashchitaPricingData = [
  {
    service: "Биозащитная обработка деревянных конструкций",
    price: "от 120",
    unit: "м²",
  },
  {
    service: "Огнебиозащитная обработка деревянных конструкций",
    price: "от 180",
    unit: "м²",
  },
  {
    service: "Обработка стропильной системы",
    price: "от 220",
    unit: "м²",
  },
  {
    service: "Обработка чердачного пространства",
    price: "от 200",
    unit: "м²",
  },
  {
    service: "Огнезащитная обработка металлоконструкций",
    price: "от 450",
    unit: "м²",
  },
  {
    service: "Подготовка деревянного основания",
    price: "от 80",
    unit: "м²",
  },
  {
    service: "Подготовка металлического основания",
    price: "от 180",
    unit: "м²",
  },
  {
    service: "Нанесение состава распылением",
    price: "от 150",
    unit: "м²",
  },
  {
    service: "Выезд специалиста и предварительная смета",
    price: "бесплатно",
    unit: "шт",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("pricing-table-biozashchita");

  if (container) {
    new PricingTable("pricing-table-biozashchita", biozashchitaPricingData);
  }
});
