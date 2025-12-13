// Основной JS-файл. Использует модули для организации кода.

// Импортируем модули
import { initMobileMenu } from "./modules/menu.js";
import { initSubmenu } from "./modules/submenu.js";
import { createSwipeHandler } from "./modules/swipe.js";
import { initCarouselPosition } from "./modules/carousel-position.js";

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
});

// Анимация появления блока "О компании" при скролле
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

// Анимация появления блока "Отзывы" при скролле (справа)
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
