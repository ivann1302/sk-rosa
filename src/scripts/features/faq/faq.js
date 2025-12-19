// Аккордеон для FAQ с независимым открытием элементов
document.addEventListener("DOMContentLoaded", function () {
  const faqItems = document.querySelectorAll(".faq__item");
  const faqList = document.querySelector(".faq__list");

  // Функция для выравнивания высоты элементов в парах (только для закрытых)
  function syncClosedItemsHeights() {
    if (!faqList) return;

    // Сбрасываем высоту всех закрытых элементов
    faqItems.forEach(item => {
      // Не трогаем открытые элементы - они всегда должны иметь auto высоту
      if (!item.classList.contains("active")) {
        item.style.height = "auto";
      }
    });

    // Выравниваем высоту закрытых элементов в парах
    for (let i = 0; i < faqItems.length; i += 2) {
      const item1 = faqItems[i];
      const item2 = faqItems[i + 1];

      // Выравниваем ТОЛЬКО если оба элемента закрыты
      // Если хотя бы один открыт - пропускаем эту пару полностью
      if (
        item1 &&
        item2 &&
        !item1.classList.contains("active") &&
        !item2.classList.contains("active")
      ) {
        // Используем двойной requestAnimationFrame для гарантии получения актуальных высот
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Проверяем еще раз, что элементы все еще закрыты
            if (!item1.classList.contains("active") && !item2.classList.contains("active")) {
              const height1 = item1.offsetHeight;
              const height2 = item2.offsetHeight;
              const maxHeight = Math.max(height1, height2);

              if (maxHeight > 0) {
                item1.style.height = maxHeight + "px";
                item2.style.height = maxHeight + "px";
              }
            }
          });
        });
      }
    }
  }

  // Инициализация: выравниваем высоту закрытых элементов
  syncClosedItemsHeights();

  // Выравниваем при изменении размера окна
  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(syncClosedItemsHeights, 100);
  });

  // Обработка клика по элементам
  faqItems.forEach((item, index) => {
    item.addEventListener("click", function (e) {
      e.stopPropagation();
      const isActive = this.classList.contains("active");

      // Если элемент уже открыт - просто закрываем его
      if (isActive) {
        this.classList.remove("active");
        this.style.height = "auto";
      } else {
        // Если элемент закрыт - закрываем все остальные и открываем текущий
        faqItems.forEach(otherItem => {
          if (otherItem !== this && otherItem.classList.contains("active")) {
            otherItem.classList.remove("active");
            otherItem.style.height = "auto";
          }
        });

        // Открываем текущий элемент
        this.style.height = "auto";
        this.classList.add("active");
      }

      // После анимации выравниваем только закрытые элементы
      setTimeout(() => {
        syncClosedItemsHeights();
      }, 450); // Увеличиваем время ожидания для завершения CSS transition
    });
  });
});
