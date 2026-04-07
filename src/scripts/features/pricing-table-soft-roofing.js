/**
 * Таблица цен для мягкой кровли
 */

import { PricingTable } from "./pricing-table.js";

const softRoofingPricingData = [
  {
    service: "Монтаж наплавляемой кровли (1 слой)",
    price: "от 350",
    unit: "м²",
  },
  {
    service: "Монтаж наплавляемой кровли (2 слоя)",
    price: "от 550",
    unit: "м²",
  },
  {
    service: "Монтаж ПВХ-мембраны",
    price: "от 450",
    unit: "м²",
  },
  {
    service: "Монтаж ЭПДМ-мембраны",
    price: "от 500",
    unit: "м²",
  },
  {
    service: "Укладка гибкой черепицы",
    price: "от 400",
    unit: "м²",
  },
  {
    service: "Устройство подкладочного ковра",
    price: "от 120",
    unit: "м²",
  },
  {
    service: "Монтаж ендов",
    price: "от 700",
    unit: "п.м",
  },
  {
    service: "Устройство примыканий",
    price: "от 800",
    unit: "п.м",
  },
  {
    service: "Монтаж конькового элемента",
    price: "от 600",
    unit: "п.м",
  },
  {
    service: "Устройство водостока",
    price: "от 600",
    unit: "п.м",
  },
  {
    service: "Ремонт мягкой кровли (частичный)",
    price: "от 250",
    unit: "м²",
  },
  {
    service: "Ремонт мягкой кровли (полный)",
    price: "от 400",
    unit: "м²",
  },
  {
    service: "Демонтаж старого покрытия",
    price: "от 150",
    unit: "м²",
  },
  {
    service: "Бесплатный выезд и замер",
    price: "бесплатно",
    unit: "шт",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("pricing-table-soft-roofing");

  if (container) {
    new PricingTable("pricing-table-soft-roofing", softRoofingPricingData);
  }
});
