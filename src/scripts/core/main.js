// Основной JS-файл. Использует модули для организации кода.
// Стили подключаются напрямую в HTML для немедленной загрузки

import { initMobileMenu } from "../modules/menu.js";
import { initSubmenu } from "../modules/submenu.js";
import { createSwipeHandler } from "../modules/swipe.js";
import { initCarouselPosition } from "../modules/carousel-position.js";

// 6.1: Динамические импорты для редко используемых модулей
async function loadFeatureModules() {
  // Загружаем calculator только если есть соответствующий элемент
  if (document.querySelector(".calculator") || document.querySelector(".price-calc")) {
    try {
      await import("../features/calculator/calculator.js");
    } catch (error) {
      console.warn("Не удалось загрузить модуль calculator:", error);
    }
  }

  // Загружаем portfolio только если есть соответствующий элемент
  if (document.querySelector(".portfolio") || document.querySelector(".portfolio-filter")) {
    try {
      await import("../features/portfolio/portfolio-filter.js");
    } catch (error) {
      console.warn("Не удалось загрузить модуль portfolio:", error);
    }
  }

  // Загружаем FAQ только если есть соответствующий элемент
  if (document.querySelector(".faq") || document.querySelector("[data-faq]")) {
    try {
      await import("../features/faq/faq.js");
    } catch (error) {
      console.warn("Не удалось загрузить модуль FAQ:", error);
    }
  }
}

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", function () {
  // Инициализация мобильного меню
  initMobileMenu();

  // Инициализация подменю
  initSubmenu();

  // Инициализация свайпа для полезных ссылок
  const usefulLinksSwipe = createSwipeHandler({
    trackSelector: ".useful-links__grid",
    wrapperSelector: ".useful-links__container",
  });
  usefulLinksSwipe.setupSwipe();

  // Инициализация позиции карусели
  initCarouselPosition();

  // Анимация появления блока "О компании" при скролле
  initCompanyDescriptionReveal();

  // Анимация появления блока "Отзывы" при скролле
  initReviewsReveal();

  // Анимация появления текста portfolio-description__text при скролле
  initPortfolioDescriptionTextReveal();

  // Анимация появления блока portfolio-description__container при скролле (справа)
  initPortfolioDescriptionContainerReveal();

  // Анимация появления блока portfolio-service__container при скролле (слева)
  initPortfolioServiceReveal();

  // Анимация появления блока reviews__content при скролле (справа)
  initReviewsContentReveal();

  // Анимация появления блока calculator-info__section при скролле (слева)
  initCalculatorInfoSectionReveal();

  // Анимация появления элементов портфолио при скролле (слева)
  initPortfolioFilterReveal();

  // Параллакс-эффект для изображения услуг
  initServiceImageParallax();

  // Круговая карусель статей
  initArticlesCarousel();

  // Фиксированный блок соцсетей: клик — раскрыть, скролл — свернуть
  initSocialFixed();

  // Загружаем редко используемые модули динамически
  loadFeatureModules();
});

// Параллакс-эффект для services__img--first при движении курсора
function initServiceImageParallax() {
  const img = document.querySelector(".services__img--first");

  if (!img || window.innerWidth <= 768) {
    return;
  }

  const container = img.closest(".services__item");

  if (!container) {
    return;
  }

  const maxOffset = 12;
  let rafId = null;

  container.addEventListener("mousemove", e => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      img.style.transform = `translate(${x * maxOffset}px, ${y * maxOffset}px)`;
      rafId = null;
    });
  });

  container.addEventListener("mouseleave", () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    img.style.transform = "translate(0, 0)";
  });
}

// Анимация появления блока "О компании" при скролле
function initCompanyDescriptionReveal() {
  const container = document.querySelector(".company-description__container");

  if (!container) {
    return;
  }

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

// Анимация появления блока "Отзывы" при скролле (справа)
function initReviewsReveal() {
  const header = document.querySelector(".reviews__header");

  if (!header) {
    return;
  }

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

// Анимация появления текста portfolio-description__text при скролле (слева)
function initPortfolioDescriptionTextReveal() {
  const textElement = document.querySelector(".portfolio-description__text");

  if (!textElement) {
    return;
  }

  // Настройки Intersection Observer
  const observerOptions = {
    threshold: 0.1, // Срабатывает, когда 10% элемента видно
    rootMargin: "0px 0px -100px 0px", // Срабатывает немного раньше
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Добавляем класс для анимации появления
        entry.target.classList.add("portfolio-description__text--revealed");
        // Отключаем наблюдение после первого появления
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Начинаем наблюдение за элементом
  observer.observe(textElement);
}

// Анимация появления блока portfolio-description__container при скролле (справа)
function initPortfolioDescriptionContainerReveal() {
  const container = document.querySelector(".portfolio-description__container");

  if (!container) {
    return;
  }

  // Настройки Intersection Observer
  const observerOptions = {
    threshold: 0.1, // Срабатывает, когда 10% элемента видно
    rootMargin: "0px 0px -100px 0px", // Срабатывает немного раньше
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Добавляем класс для анимации появления
        entry.target.classList.add("portfolio-description__container--revealed");
        // Отключаем наблюдение после первого появления
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Начинаем наблюдение за элементом
  observer.observe(container);
}

// Анимация появления блока portfolio-service__container при скролле (слева)
function initPortfolioServiceReveal() {
  const container = document.querySelector(".portfolio-service__container");

  if (!container) {
    return;
  }

  // Настройки Intersection Observer
  const observerOptions = {
    threshold: 0.1, // Срабатывает, когда 10% элемента видно
    rootMargin: "0px 0px -100px 0px", // Срабатывает немного раньше
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Добавляем класс для анимации появления
        entry.target.classList.add("portfolio-service__container--revealed");
        // Отключаем наблюдение после первого появления
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Начинаем наблюдение за элементом
  observer.observe(container);
}

// Анимация появления блока reviews__content при скролле (справа)
function initReviewsContentReveal() {
  const content = document.querySelector(".reviews__content");

  if (!content) {
    return;
  }

  // Настройки Intersection Observer
  const observerOptions = {
    threshold: 0.1, // Срабатывает, когда 10% элемента видно
    rootMargin: "0px 0px -100px 0px", // Срабатывает немного раньше
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Добавляем класс для анимации появления
        entry.target.classList.add("reviews__content--revealed");
        // Отключаем наблюдение после первого появления
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Начинаем наблюдение за элементом
  observer.observe(content);
}

// Анимация появления блока calculator-info__section при скролле (слева)
function initCalculatorInfoSectionReveal() {
  const sections = document.querySelectorAll(".calculator-info__section");

  if (sections.length === 0) {
    return;
  }

  // Настройки Intersection Observer
  const observerOptions = {
    threshold: 0.1, // Срабатывает, когда 10% элемента видно
    rootMargin: "0px 0px -100px 0px", // Срабатывает немного раньше
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Добавляем класс для анимации появления
        entry.target.classList.add("calculator-info__section--revealed");
        // Отключаем наблюдение после первого появления
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Начинаем наблюдение за каждым элементом
  sections.forEach(section => {
    observer.observe(section);
  });
}

// Анимация появления элементов портфолио при скролле (слева)
function initPortfolioFilterReveal() {
  const title = document.querySelector(".portfolio-filter__title");
  const introText = document.querySelector(".portfolio-filter__intro-text");
  const whyTitle = document.querySelector(".portfolio-filter__why-title");
  const whyList = document.querySelector(".portfolio-filter__why-list");

  if (!title && !introText && !whyTitle && !whyList) {
    return;
  }

  // Настройки Intersection Observer
  const observerOptions = {
    threshold: 0.1, // Срабатывает, когда 10% элемента видно
    rootMargin: "0px 0px -100px 0px", // Срабатывает немного раньше
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        // Добавляем класс для анимации появления в зависимости от класса элемента
        if (target.classList.contains("portfolio-filter__title")) {
          target.classList.add("portfolio-filter__title--revealed");
        } else if (target.classList.contains("portfolio-filter__intro-text")) {
          target.classList.add("portfolio-filter__intro-text--revealed");
        } else if (target.classList.contains("portfolio-filter__why-title")) {
          target.classList.add("portfolio-filter__why-title--revealed");
        } else if (target.classList.contains("portfolio-filter__why-list")) {
          target.classList.add("portfolio-filter__why-list--revealed");
        }
        // Отключаем наблюдение после первого появления
        observer.unobserve(target);
      }
    });
  }, observerOptions);

  // Начинаем наблюдение за каждым элементом
  if (title) {
    observer.observe(title);
  }
  if (introText) {
    observer.observe(introText);
  }
  if (whyTitle) {
    observer.observe(whyTitle);
  }
  if (whyList) {
    observer.observe(whyList);
  }
}

// Фиксированный блок соцсетей: toggle по клику, скрытие при скролле
function initSocialFixed() {
  const panel = document.querySelector("[data-js-social-fixed]");
  const toggle = document.querySelector("[data-js-social-toggle]");

  if (!panel || !toggle || window.innerWidth <= 768) {
    return;
  }

  toggle.addEventListener("click", () => {
    panel.classList.toggle("social-fixed--open");
  });

  window.addEventListener(
    "scroll",
    () => {
      if (panel.classList.contains("social-fixed--open")) {
        panel.classList.remove("social-fixed--open");
      }
    },
    { passive: true }
  );
}

// Круговая карусель статей
function initArticlesCarousel() {
  const track = document.querySelector(".articles-carousel__track");

  if (!track) {
    return;
  }

  const cards = Array.from(track.querySelectorAll(".articles-carousel__card"));
  const total = cards.length;
  let current = 0;
  let isAnimating = false;

  function updatePositions() {
    const prev = (current - 1 + total) % total;
    const next = (current + 1) % total;

    cards.forEach((card, i) => {
      if (i === current) {
        card.setAttribute("data-pos", "active");
      } else if (i === prev) {
        card.setAttribute("data-pos", "prev");
      } else if (i === next) {
        card.setAttribute("data-pos", "next");
      } else {
        card.setAttribute("data-pos", "hidden");
      }
    });
  }

  function navigate(direction) {
    if (isAnimating) {
      return;
    }

    isAnimating = true;

    const prevIdx = (current - 1 + total) % total;
    const nextIdx = (current + 1) % total;

    // Задержки зависят от направления: карточки движутся волной
    const delays = new Map();

    if (direction === 1) {
      delays.set(prevIdx, 0);
      delays.set(current, 90);
      delays.set(nextIdx, 180);
    } else {
      delays.set(nextIdx, 0);
      delays.set(current, 90);
      delays.set(prevIdx, 180);
    }

    cards.forEach((card, i) => {
      card.style.transitionDelay = `${delays.get(i) ?? 270}ms`;
    });

    current = (current + direction + total) % total;
    updatePositions();

    setTimeout(() => {
      cards.forEach(card => {
        card.style.transitionDelay = "";
      });
      isAnimating = false;
    }, 850);
  }

  updatePositions();

  document.querySelector(".articles-carousel__arrow--prev").addEventListener("click", () => navigate(-1));
  document.querySelector(".articles-carousel__arrow--next").addEventListener("click", () => navigate(1));
}
