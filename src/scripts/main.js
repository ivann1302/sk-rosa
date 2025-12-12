// Основной JS-файл. Логика для карты и карусели вынесена в отдельные файлы.

// Мобильное меню
document.addEventListener("DOMContentLoaded", function () {
  const burgerButton = document.querySelector("[data-js-header-burger-button]");
  const headerMenu = document.querySelector(".header__menu");
  const mobileContacts = document.querySelector("[data-js-mobile-contacts]");
  const header = document.querySelector("[data-js-header]");

  if (burgerButton && headerMenu && mobileContacts) {
    console.log("Burger button found:", burgerButton);
    console.log("Header menu found:", headerMenu);
    console.log("Mobile contacts found:", mobileContacts);

    burgerButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Burger button clicked!");

      const isActive = headerMenu.classList.contains("is-active");

      if (isActive) {
        // Закрываем обе плашки
        headerMenu.classList.remove("is-active");
        mobileContacts.classList.remove("is-active");
        burgerButton.classList.remove("is-active");
        document.body.style.overflow = "";
        console.log("Menu closed");
      } else {
        // Открываем обе плашки
        headerMenu.classList.add("is-active");
        mobileContacts.classList.add("is-active");
        burgerButton.classList.add("is-active");
        document.body.style.overflow = "hidden";
        console.log("Menu opened");
      }
    });

    // Закрываем меню при клике на ссылку (кроме "Другие услуги")
    const menuLinks = headerMenu.querySelectorAll("a");
    menuLinks.forEach(link => {
      link.addEventListener("click", function (e) {
        // Проверяем, не является ли это ссылкой "Другие услуги"
        const isSubmenuLink =
          link.closest(".header__menu-item--has-submenu") &&
          link.getAttribute("href") === "#services";

        if (!isSubmenuLink) {
          headerMenu.classList.remove("is-active");
          mobileContacts.classList.remove("is-active");
          burgerButton.classList.remove("is-active");
          document.body.style.overflow = "";
        }
      });
    });

    // Закрываем меню при клике вне его
    document.addEventListener("click", function (event) {
      if (!header.contains(event.target)) {
        headerMenu.classList.remove("is-active");
        mobileContacts.classList.remove("is-active");
        burgerButton.classList.remove("is-active");
        document.body.style.overflow = "";
      }
    });
  } else {
    console.log("Burger button, header menu, or mobile contacts not found");
    console.log("Burger button:", burgerButton);
    console.log("Header menu:", headerMenu);
    console.log("Mobile contacts:", mobileContacts);
  }

  // Новая логика для подменю "Другие услуги"
  const submenuItems = document.querySelectorAll(".header__menu-item--has-submenu");

  console.log("Found submenu items:", submenuItems.length);

  submenuItems.forEach((item, index) => {
    const toggleButton = item.querySelector(".header__menu-toggle");
    const submenu = item.querySelector(".header__submenu");
    const arrow = item.querySelector(".header__menu-arrow");

    console.log(`Submenu item ${index}:`, item);
    console.log(`Toggle button:`, toggleButton);
    console.log(`Submenu:`, submenu);

    if (toggleButton && submenu) {
      // Обработка клика на кнопку переключения (мобильные устройства)
      toggleButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        console.log("Toggle button clicked!");

        // Переключаем состояние подменю
        const isActive = submenu.classList.contains("is-active");
        console.log("Is active before:", isActive);

        if (isActive) {
          // Закрываем подменю
          submenu.classList.remove("is-active");
          item.classList.remove("is-active");
          toggleButton.setAttribute("aria-expanded", "false");
          console.log("Submenu deactivated");
        } else {
          // Открываем подменю
          submenu.classList.add("is-active");
          item.classList.add("is-active");
          toggleButton.setAttribute("aria-expanded", "true");
          console.log("Submenu activated");
        }

        console.log("Is active after:", submenu.classList.contains("is-active"));
      });
    }
  });

  // Обработка hover для десктопа
  function setupDesktopHover() {
    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
      submenuItems.forEach(item => {
        const submenu = item.querySelector(".header__submenu");

        if (submenu) {
          // Убираем активное состояние на десктопе
          submenu.classList.remove("is-active");
          item.classList.remove("is-active");

          // Добавляем hover эффекты
          item.addEventListener("mouseenter", function () {
            submenu.classList.add("is-active");
          });

          item.addEventListener("mouseleave", function () {
            submenu.classList.remove("is-active");
          });
        }
      });
    }
  }

  // Обработка изменения размера окна
  window.addEventListener("resize", function () {
    const isMobile = window.innerWidth <= 768;
    const submenuItems = document.querySelectorAll(".header__menu-item--has-submenu");

    submenuItems.forEach(item => {
      const submenu = item.querySelector(".header__submenu");
      const toggleButton = item.querySelector(".header__menu-toggle");

      if (submenu && toggleButton) {
        if (isMobile) {
          // На мобильных убираем активное состояние при изменении размера
          submenu.classList.remove("is-active");
          item.classList.remove("is-active");
          toggleButton.setAttribute("aria-expanded", "false");
        } else {
          // На десктопе настраиваем hover эффекты
          setupDesktopHover();
        }
      }
    });
  });

  // Инициализация: закрываем все подменю при загрузке на мобильных
  function initializeSubmenu() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const submenuItems = document.querySelectorAll(".header__menu-item--has-submenu");
      submenuItems.forEach(item => {
        const submenu = item.querySelector(".header__submenu");
        const toggleButton = item.querySelector(".header__menu-toggle");

        if (submenu && toggleButton) {
          submenu.classList.remove("is-active");
          item.classList.remove("is-active");
          toggleButton.setAttribute("aria-expanded", "false");
        }
      });
    } else {
      // На десктопе настраиваем hover эффекты
      setupDesktopHover();
    }
  }

  // Вызываем инициализацию после загрузки DOM
  initializeSubmenu();
});

// Свайп для карусели отзывов на мобильных
(function () {
  function setupReviewsSwipe() {
    const isMobile = window.innerWidth <= 768;
    const track = document.querySelector(".reviews-carousel__track");
    const wrapper = document.querySelector(".reviews-carousel__wrapper");
    if (!isMobile || !track || !wrapper) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let index = 0;

    const slides = Array.from(track.children);
    const total = slides.length;

    function updateTransform() {
      const width = window.innerWidth <= 768 ? window.innerWidth - 48 : wrapper.clientWidth;
      const swipeWidth = window.innerWidth <= 768 ? window.innerWidth - 36 : wrapper.clientWidth;
      track.style.transform = `translateX(${-index * swipeWidth}px)`;
    }

    function clampIndex(value) {
      return Math.max(0, Math.min(total - 1, value));
    }

    track.style.transition = "transform 0.3s ease";

    wrapper.addEventListener(
      "touchstart",
      e => {
        isDragging = true;
        startX = e.touches[0].clientX;
        currentX = startX;
        track.style.transition = "none";
      },
      { passive: false }
    );

    wrapper.addEventListener(
      "touchmove",
      e => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const dx = currentX - startX;
        const width = window.innerWidth <= 768 ? window.innerWidth - 48 : wrapper.clientWidth;
        const swipeWidth = window.innerWidth <= 768 ? window.innerWidth - 36 : wrapper.clientWidth;
        track.style.transform = `translateX(${-index * swipeWidth + dx}px)`;
        e.preventDefault();
      },
      { passive: false }
    );

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      const dx = currentX - startX;
      const width = window.innerWidth <= 768 ? window.innerWidth - 48 : wrapper.clientWidth;
      const swipeWidth = window.innerWidth <= 768 ? window.innerWidth - 36 : wrapper.clientWidth;
      const threshold = swipeWidth * 0.1; // 10%
      if (dx < -threshold) index = clampIndex(index + 1);
      if (dx > threshold) index = clampIndex(index - 1);
      track.style.transition = "transform 0.3s ease";
      updateTransform();
    }

    wrapper.addEventListener("touchend", endDrag, { passive: true });
    wrapper.addEventListener("touchcancel", endDrag, { passive: true });

    window.addEventListener("resize", () => {
      if (window.innerWidth <= 768) {
        updateTransform();
      }
    });

    updateTransform();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupReviewsSwipe);
  } else {
    setupReviewsSwipe();
  }
})();

// Свайп для карусели полезных ссылок на мобильных
(function () {
  function setupUsefulLinksSwipe() {
    const isMobile = window.innerWidth <= 768;
    const track = document.querySelector(".useful-links__grid");
    const wrapper = document.querySelector(".useful-links__container");
    if (!isMobile || !track || !wrapper) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let index = 0;

    const slides = Array.from(track.children);
    const total = slides.length;

    function updateTransform() {
      const width = window.innerWidth <= 768 ? window.innerWidth - 48 : wrapper.clientWidth;
      const swipeWidth = window.innerWidth <= 768 ? window.innerWidth - 36 : wrapper.clientWidth;
      track.style.transform = `translateX(${-index * swipeWidth}px)`;
    }

    function clampIndex(value) {
      return Math.max(0, Math.min(total - 1, value));
    }

    track.style.transition = "transform 0.3s ease";

    wrapper.addEventListener(
      "touchstart",
      e => {
        isDragging = true;
        startX = e.touches[0].clientX;
        currentX = startX;
        track.style.transition = "none";
      },
      { passive: false }
    );

    wrapper.addEventListener(
      "touchmove",
      e => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const dx = currentX - startX;
        const width = window.innerWidth <= 768 ? window.innerWidth - 48 : wrapper.clientWidth;
        const swipeWidth = window.innerWidth <= 768 ? window.innerWidth - 36 : wrapper.clientWidth;
        track.style.transform = `translateX(${-index * swipeWidth + dx}px)`;
        e.preventDefault();
      },
      { passive: false }
    );

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      const dx = currentX - startX;
      const width = window.innerWidth <= 768 ? window.innerWidth - 48 : wrapper.clientWidth;
      const swipeWidth = window.innerWidth <= 768 ? window.innerWidth - 36 : wrapper.clientWidth;
      const threshold = swipeWidth * 0.1; // 10%
      if (dx < -threshold) index = clampIndex(index + 1);
      if (dx > threshold) index = clampIndex(index - 1);
      track.style.transition = "transform 0.3s ease";
      updateTransform();
    }

    wrapper.addEventListener("touchend", endDrag, { passive: true });
    wrapper.addEventListener("touchcancel", endDrag, { passive: true });

    window.addEventListener("resize", () => {
      if (window.innerWidth <= 768) {
        updateTransform();
      }
    });

    updateTransform();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupUsefulLinksSwipe);
  } else {
    setupUsefulLinksSwipe();
  }
})();

// Установка начальной позиции для reviews карусели на мобильном
(function () {
  function setInitialReviewsPosition() {
    if (window.innerWidth <= 768) {
      const wrapper = document.querySelector(".reviews-carousel__wrapper");
      if (wrapper) {
        // Устанавливаем начальную позицию скролла в 0, чтобы был виден padding-left
        wrapper.scrollLeft = 0;
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setInitialReviewsPosition);
  } else {
    setInitialReviewsPosition();
  }

  // Также устанавливаем позицию при изменении размера окна
  window.addEventListener("resize", setInitialReviewsPosition);
})();

// Анимация появления блока "О компании" при скролле
(function () {
  function initCompanyDescriptionReveal() {
    const container = document.querySelector(".company-description__container");

    if (!container) return;

    // Настройки Intersection Observer
    const observerOptions = {
      threshold: 0.1, // Срабатывает, когда 10% элемента видно
      rootMargin: "0px 0px -100px 0px", // Срабатывает немного раньше
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Добавляем класс для анимации появления
          entry.target.classList.add("company-description__container--revealed");
          // Отключаем наблюдение после первого появления
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Начинаем наблюдение за элементом
    observer.observe(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCompanyDescriptionReveal);
  } else {
    initCompanyDescriptionReveal();
  }
})();

// Анимация появления блока "Отзывы" при скролле (справа)
(function () {
  function initReviewsReveal() {
    const header = document.querySelector(".reviews__header");

    if (!header) return;

    // Настройки Intersection Observer
    const observerOptions = {
      threshold: 0.1, // Срабатывает, когда 10% элемента видно
      rootMargin: "0px 0px -100px 0px", // Срабатывает немного раньше
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Добавляем класс для анимации появления
          entry.target.classList.add("reviews__header--revealed");
          // Отключаем наблюдение после первого появления
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Начинаем наблюдение за элементом
    observer.observe(header);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReviewsReveal);
  } else {
    initReviewsReveal();
  }
})();
