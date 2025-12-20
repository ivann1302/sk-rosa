document.addEventListener("DOMContentLoaded", function () {
  // Функция для получения значения фильтра (поддерживает и select, и custom-select)
  function getFilterValue(filterType) {
    const customSelect = document.querySelector(`.custom-select[data-filter="${filterType}"]`);
    if (customSelect) {
      const hiddenInput = customSelect.querySelector('input[type="hidden"]');
      return hiddenInput ? hiddenInput.value : "";
    }
    const select = document.querySelector(`select[data-filter="${filterType}"]`);
    return select ? select.value : "";
  }

  // Получаем элементы фильтров
  const typeFilter =
    document.querySelector('.custom-select[data-filter="type"]') ||
    document.querySelector('select[data-filter="type"]');
  const areaFilter = document.querySelector('input[type="number"]');
  const priceFilter =
    document.querySelector('.custom-select[data-filter="price"]') ||
    document.querySelector('select[data-filter="price"]');
  const findButton = document.querySelector(".portfolio-filter__button--primary");

  // Получаем все элементы портфолио
  const portfolioItems = document.querySelectorAll(".portfolio-gallery__item");

  // Функция фильтрации
  function filterPortfolio() {
    const selectedType = getFilterValue("type");
    const selectedArea = areaFilter ? parseInt(areaFilter.value) : 0;
    const selectedPrice = getFilterValue("price");

    let visibleCount = 0;

    portfolioItems.forEach(item => {
      let showItem = true;

      // Фильтр по типу помещения
      if (selectedType && selectedType !== "") {
        // Все работы у нас "ремонт под ключ", поэтому этот фильтр пока не работает
        // В будущем можно добавить data-type атрибуты к карточкам
      }

      // Фильтр по площади
      if (selectedArea > 0) {
        const itemArea = parseInt(item.dataset.area);
        if (isNaN(itemArea) || itemArea < selectedArea * 0.8 || itemArea > selectedArea * 1.2) {
          showItem = false;
        }
      }

      // Фильтр по стоимости
      if (selectedPrice && selectedPrice !== "") {
        const itemPrice = parseInt(item.dataset.price);
        if (isNaN(itemPrice)) {
          showItem = false;
        } else {
          switch (selectedPrice) {
            case "0-1000000":
              if (itemPrice > 1000000) showItem = false;
              break;
            case "1000000-2000000":
              if (itemPrice < 1000000 || itemPrice > 2000000) showItem = false;
              break;
            case "2000000-3000000":
              if (itemPrice < 2000000 || itemPrice > 3000000) showItem = false;
              break;
            case "3000000-5000000":
              if (itemPrice < 3000000 || itemPrice > 5000000) showItem = false;
              break;
            case "5000000+":
              if (itemPrice < 5000000) showItem = false;
              break;
          }
        }
      }

      // Показываем/скрываем элемент
      if (showItem) {
        item.style.display = "block";
        visibleCount++;
      } else {
        item.style.display = "none";
      }
    });
  }

  // Функция сброса фильтров
  function resetFilters() {
    // Сброс кастомных select'ов
    const customSelects = document.querySelectorAll(".custom-select");
    customSelects.forEach(select => {
      const firstOption = select.querySelector('.custom-select__option[data-value=""]');
      if (firstOption) {
        firstOption.click();
      }
    });

    // Сброс обычных select'ов
    const selects = document.querySelectorAll("select[data-filter]");
    selects.forEach(select => {
      select.value = "";
    });

    if (areaFilter) areaFilter.value = "";

    // Показываем все элементы
    portfolioItems.forEach(item => {
      item.style.display = "block";
    });
  }

  // Добавляем обработчики событий
  if (findButton) {
    findButton.addEventListener("click", filterPortfolio);
  }

  // Автоматическая фильтрация при изменении значений
  // Слушаем изменения в кастомных select'ах
  document.addEventListener("change", function (e) {
    if (e.target.closest(".custom-select")) {
      filterPortfolio();
    }
  });

  // Слушаем изменения в обычных select'ах (для обратной совместимости)
  if (typeFilter && typeFilter.tagName === "SELECT") {
    typeFilter.addEventListener("change", filterPortfolio);
  }

  if (areaFilter) {
    areaFilter.addEventListener("input", filterPortfolio);
  }

  if (priceFilter && priceFilter.tagName === "SELECT") {
    priceFilter.addEventListener("change", filterPortfolio);
  }

  // Добавляем анимацию появления элементов (начиная с 3-й карточки)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  portfolioItems.forEach((item, index) => {
    if (index >= 2) {
      // Начинаем с 3-й карточки (индекс 2)
      item.style.opacity = "0";
      item.style.transform = "translateY(20px)";
      item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(item);
    } else {
      // Первые две карточки сразу видны
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }
  });
});
