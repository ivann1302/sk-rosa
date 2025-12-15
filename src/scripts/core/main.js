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

  // Инициализация свайпа для карусели отзывов
  const reviewsSwipe = createSwipeHandler({
    trackSelector: ".reviews-carousel__track",
    wrapperSelector: ".reviews-carousel__wrapper",
  });
  reviewsSwipe.setupSwipe();

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

  // Загружаем редко используемые модули динамически
  loadFeatureModules();
});

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
