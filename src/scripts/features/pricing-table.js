/**
 * Интерактивная таблица цен для штукатурных работ
 */

const pricingData = [
  {
    service: "Механизированная штукатурка стен гипсовой смесью",
    price: "от 430",
    unit: "м²",
    description:
      "Быстрое нанесение гипсовой штукатурки машинным способом. Подходит для внутренних работ.",
  },
  {
    service: "Механизированная штукатурка стен цементно-песчаной смесью",
    price: "от 500",
    unit: "м²",
    description:
      "Прочная цементная штукатурка для помещений с повышенной влажностью (ванная, кухня).",
  },
  {
    service: "Механизированная штукатурка фасада",
    price: "от 1000",
    unit: "м²",
    description: "Наружные работы с использованием атмосферостойких составов.",
  },
  {
    service: "Механизированная стяжка пола",
    price: "от 600",
    unit: "м²",
    description: "Выравнивание пола полусухой или мокрой стяжкой с использованием техники.",
  },
  {
    service: "Утепление откосов",
    price: "от 600",
    unit: "пог.м",
    description: "Монтаж утеплителя на откосы окон и дверей с последующей отделкой.",
  },
  {
    service: "Штукатурка откосов",
    price: "от 550",
    unit: "пог.м",
    description: "Выравнивание откосов штукатурным раствором под дальнейшую отделку.",
  },
  {
    service: "Монтаж углозащитных углов (работа)",
    price: "бесплатно",
    unit: "пог.м",
    description: "Установка металлических или пластиковых уголков для защиты внешних углов.",
  },
  {
    service: "Монтаж профиля примыкания",
    price: "бесплатно",
    unit: "пог.м",
    description: "Установка профиля в местах примыкания стен к потолку или полу.",
  },
  {
    service: "Монтаж перегородок 50мм,75мм,100мм,150мм",
    price: "от 1000",
    unit: "м²",
    description: "Возведение гипсокартонных перегородок различной толщины.",
  },
  {
    service: "Установка перемычек",
    price: "от 1000",
    unit: "шт",
    description: "Монтаж дверных и оконных перемычек в перегородках.",
  },
  {
    service: "Глянцевание стен",
    price: "бесплатно",
    unit: "м²",
    description: "Финишная обработка гипсовой штукатурки для получения гладкой поверхности.",
  },
  {
    service: "Обследование тепловизором",
    price: "бесплатно",
    unit: "шт",
    description: "Диагностика теплопотерь и выявление скрытых дефектов.",
  },
];

class PricingTable {
  constructor(containerId, data) {
    this.container = document.getElementById(containerId);
    this.data = data;

    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    this.init();
  }

  init() {
    this.render();
    this.handleResize();

    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }

  handleResize() {
    const isMobile = window.innerWidth < 768;

    if (isMobile && this.container.querySelector("table")) {
      this.render();
    } else if (!isMobile && this.container.querySelector(".pricing-cards")) {
      this.render();
    }
  }

  render() {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      this.renderCards();
    } else {
      this.renderTable();
    }
  }

  renderTable() {
    const tableHTML = `
      <div class="pricing-table-wrapper">
        <table class="pricing-table">
          <thead>
            <tr>
              <th>Услуга</th>
              <th>Цена</th>
              <th>Ед.изм</th>
            </tr>
          </thead>
          <tbody>
            ${this.data
              .map(
                row => `
              <tr class="pricing-table__row">
                <td><span class="pricing-table__service-name">${row.service}</span></td>
                <td>${row.price} руб</td>
                <td>${row.unit}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    this.container.innerHTML = tableHTML;
  }

  renderCards() {
    const cardsHTML = `
      <div class="pricing-cards">
        ${this.data
          .map(
            row => `
          <div class="pricing-card">
            <div class="pricing-card__service">${row.service}</div>
            <div class="pricing-card__details">
              <span class="pricing-card__price">Цена: ${row.price} руб</span>
              <span class="pricing-card__separator">|</span>
              <span class="pricing-card__unit">Ед: ${row.unit}</span>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    this.container.innerHTML = cardsHTML;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const pricingTableContainer = document.getElementById("pricing-table-container");

  if (pricingTableContainer) {
    new PricingTable("pricing-table-container", pricingData);
  }
});

export { PricingTable, pricingData };
