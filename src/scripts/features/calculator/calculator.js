// Калькулятор стоимости ремонта
class Calculator {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.calculate();
  }

  initializeElements() {
    // Форма калькулятора
    this.form = document.querySelector(".calculator-form");
    this.objectTypeInputs = document.querySelectorAll('input[name="object-type"]');
    this.areaInput = document.querySelector('.calculator-form__input[value="63"]');
    this.heightInput = document.querySelector('.calculator-form__input[value="2.5"]');
    this.propertyClassInputs = document.querySelectorAll('input[name="property-class"]');
    this.locationInputs = document.querySelectorAll('input[name="location"]');

    // Результаты
    this.roomInputs = document.querySelectorAll(".calculator-results__input");
    this.roomPrices = document.querySelectorAll(".calculator-results__price");
    this.totalPrice = document.querySelector(".calculator-results__total-price");
  }

  bindEvents() {
    // Слушаем изменения в форме
    this.objectTypeInputs.forEach(input => {
      input.addEventListener("change", () => this.calculate());
    });

    this.areaInput.addEventListener("input", () => this.calculate());
    this.heightInput.addEventListener("input", () => this.calculate());

    this.propertyClassInputs.forEach(input => {
      input.addEventListener("change", () => this.calculate());
    });

    this.locationInputs.forEach(input => {
      input.addEventListener("change", () => this.calculate());
    });

    // Слушаем изменения в полях комнат
    this.roomInputs.forEach(input => {
      input.addEventListener("input", () => this.calculate());
    });
  }

  calculate() {
    // Получаем значения из формы
    const objectType = this.getSelectedValue("object-type");
    const area = parseFloat(this.areaInput.value) || 0;
    const height = parseFloat(this.heightInput.value) || 0;
    const propertyClass = this.getSelectedValue("property-class");
    const location = this.getSelectedValue("location");

    // Обновляем количество комнат в зависимости от типа объекта
    this.updateRoomsByObjectType(objectType);

    // Обновляем площади комнат в зависимости от общей площади
    this.updateRoomAreas(area, objectType);

    // Базовые цены за м² для разных типов помещений
    const basePrices = {
      bathroom: 69000, // Ванная + Туалет
      corridor: 11400, // Коридор
      kitchen: 13200, // Кухня
      living: 9320, // Гостиная
      bedroom: 12430, // Спальни
    };

    // Множители для класса недвижимости
    const classMultipliers = {
      medium: 1.0,
      business: 1.3,
      premium: 1.6,
    };

    // Множитель для высоты потолков
    const heightMultiplier = height > 2.7 ? 1.15 : 1.0;

    // Общий множитель
    const totalMultiplier = classMultipliers[propertyClass] * heightMultiplier;

    // Рассчитываем стоимость для каждой комнаты
    let totalCost = 0;
    let totalArea = 0;

    // Получаем обновленные элементы после изменения структуры
    const visibleRoomInputs = document.querySelectorAll(
      ".calculator-results__room:not(.hidden) .calculator-results__input"
    );
    const visibleRoomPrices = document.querySelectorAll(
      ".calculator-results__room:not(.hidden) .calculator-results__price"
    );

    visibleRoomInputs.forEach((input, index) => {
      const roomArea = parseFloat(input.value) || 0;
      totalArea += roomArea;

      let roomPrice = 0;
      switch (index) {
        case 0: // Ванная + Туалет
          roomPrice = roomArea * basePrices.bathroom;
          break;
        case 1: // Коридор
          roomPrice = roomArea * basePrices.corridor;
          break;
        case 2: // Кухня
          roomPrice = roomArea * basePrices.kitchen;
          break;
        case 3: // Гостиная
          roomPrice = roomArea * basePrices.living;
          break;
        case 4: // 2-я Комната
          roomPrice = roomArea * basePrices.bedroom;
          break;
        case 5: // 3-я Комната
          roomPrice = roomArea * basePrices.bedroom;
          break;
        case 6: // 4-я Комната
          roomPrice = roomArea * basePrices.bedroom;
          break;
      }

      // Применяем множители
      roomPrice = Math.round(roomPrice * totalMultiplier);

      // Обновляем цену в интерфейсе
      if (visibleRoomPrices[index]) {
        visibleRoomPrices[index].textContent = this.formatPrice(roomPrice);
      }

      totalCost += roomPrice;
    });

    // Дополнительная корректировка на основе общей площади и высоты потолков
    const formArea = parseFloat(this.areaInput.value) || 0;
    const formHeight = parseFloat(this.heightInput.value) || 0;

    // Если общая площадь из формы больше суммы площадей комнат, применяем коэффициент
    if (formArea > totalArea && formArea > 0) {
      const areaRatio = formArea / totalArea;
      totalCost = Math.round(totalCost * areaRatio);
    }

    // Дополнительная корректировка на высоту потолков (если высота больше 2.7м)
    if (formHeight > 2.7) {
      const heightBonus = (formHeight - 2.7) * 0.1; // +10% за каждые 0.1м выше 2.7м
      totalCost = Math.round(totalCost * (1 + heightBonus));
    }

    // Обновляем общую стоимость
    if (this.totalPrice) {
      this.totalPrice.textContent = this.formatPrice(totalCost);
    }
  }

  updateRoomsByObjectType(objectType) {
    const rooms = document.querySelectorAll(".calculator-results__room");

    // Скрываем все комнаты сначала
    rooms.forEach(room => {
      room.classList.add("hidden");
    });

    // Показываем нужные комнаты в зависимости от типа объекта
    switch (objectType) {
      case "1-room":
        // 1-к квартира: Ванная, Коридор, Кухня, Гостиная
        if (rooms[0]) rooms[0].classList.remove("hidden"); // Ванная
        if (rooms[1]) rooms[1].classList.remove("hidden"); // Коридор
        if (rooms[2]) rooms[2].classList.remove("hidden"); // Кухня
        if (rooms[3]) rooms[3].classList.remove("hidden"); // Гостиная
        break;

      case "2-room":
        // 2-к квартира: Ванная, Коридор, Кухня, Гостиная, 2-я Комната
        if (rooms[0]) rooms[0].classList.remove("hidden"); // Ванная
        if (rooms[1]) rooms[1].classList.remove("hidden"); // Коридор
        if (rooms[2]) rooms[2].classList.remove("hidden"); // Кухня
        if (rooms[3]) rooms[3].classList.remove("hidden"); // Гостиная
        if (rooms[4]) rooms[4].classList.remove("hidden"); // 2-я Комната
        break;

      case "3-room":
        // 3-к квартира: Ванная, Коридор, Кухня, Гостиная, 2-я Комната, 3-я Комната
        if (rooms[0]) rooms[0].classList.remove("hidden"); // Ванная
        if (rooms[1]) rooms[1].classList.remove("hidden"); // Коридор
        if (rooms[2]) rooms[2].classList.remove("hidden"); // Кухня
        if (rooms[3]) rooms[3].classList.remove("hidden"); // Гостиная
        if (rooms[4]) rooms[4].classList.remove("hidden"); // 2-я Комната
        if (rooms[5]) rooms[5].classList.remove("hidden"); // 3-я Комната
        break;

      case "4-room":
        // 4-к квартира: Ванная, Коридор, Кухня, Гостиная, 2-я Комната, 3-я Комната, 4-я Комната
        if (rooms[0]) rooms[0].classList.remove("hidden"); // Ванная
        if (rooms[1]) rooms[1].classList.remove("hidden"); // Коридор
        if (rooms[2]) rooms[2].classList.remove("hidden"); // Кухня
        if (rooms[3]) rooms[3].classList.remove("hidden"); // Гостиная
        if (rooms[4]) rooms[4].classList.remove("hidden"); // 2-я Комната
        if (rooms[5]) rooms[5].classList.remove("hidden"); // 3-я Комната
        if (rooms[6]) rooms[6].classList.remove("hidden"); // 4-я Комната
        break;
    }
  }

  updateRoomAreas(totalArea, objectType) {
    // Коэффициенты распределения площади для разных типов квартир
    const areaDistribution = {
      "1-room": {
        bathroom: 0.08, // 8% - Ванная + Туалет
        corridor: 0.12, // 12% - Коридор
        kitchen: 0.25, // 25% - Кухня
        living: 0.55, // 55% - Гостиная
      },
      "2-room": {
        bathroom: 0.08, // 8% - Ванная + Туалет
        corridor: 0.12, // 12% - Коридор
        kitchen: 0.2, // 20% - Кухня
        living: 0.35, // 35% - Гостиная
        bedroom: 0.25, // 25% - 2-я Комната
      },
      "3-room": {
        bathroom: 0.08, // 8% - Ванная + Туалет
        corridor: 0.12, // 12% - Коридор
        kitchen: 0.18, // 18% - Кухня
        living: 0.25, // 25% - Гостиная
        bedroom1: 0.2, // 20% - 2-я Комната
        bedroom2: 0.17, // 17% - 3-я Комната
      },
      "4-room": {
        bathroom: 0.08, // 8% - Ванная + Туалет
        corridor: 0.12, // 12% - Коридор
        kitchen: 0.16, // 16% - Кухня
        living: 0.2, // 20% - Гостиная
        bedroom1: 0.18, // 18% - 2-я Комната
        bedroom2: 0.15, // 15% - 3-я Комната
        bedroom3: 0.11, // 11% - 4-я Комната
      },
    };

    const distribution = areaDistribution[objectType];
    if (!distribution) return;

    // Получаем видимые комнаты
    const visibleRooms = document.querySelectorAll(".calculator-results__room:not(.hidden)");
    const roomInputs = document.querySelectorAll(
      ".calculator-results__room:not(.hidden) .calculator-results__input"
    );

    // Обновляем площади комнат
    roomInputs.forEach((input, index) => {
      let roomArea = 0;

      switch (index) {
        case 0: // Ванная + Туалет
          roomArea = totalArea * distribution.bathroom;
          break;
        case 1: // Коридор
          roomArea = totalArea * distribution.corridor;
          break;
        case 2: // Кухня
          roomArea = totalArea * distribution.kitchen;
          break;
        case 3: // Гостиная
          roomArea = totalArea * distribution.living;
          break;
        case 4: // 2-я Комната
          roomArea = totalArea * (distribution.bedroom || distribution.bedroom1);
          break;
        case 5: // 3-я Комната
          roomArea = totalArea * (distribution.bedroom2 || 0);
          break;
        case 6: // 4-я Комната
          roomArea = totalArea * (distribution.bedroom3 || 0);
          break;
      }

      // Округляем до 2 знаков после запятой
      input.value = roomArea.toFixed(2);
    });
  }

  getSelectedValue(name) {
    const input = document.querySelector(`input[name="${name}"]:checked`);
    return input ? input.value : "";
  }

  formatPrice(price) {
    return price.toLocaleString("ru-RU") + " ₽";
  }
}

// Инициализация калькулятора при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".calculator-form")) {
    new Calculator();
  }
});
