// Основной JS-файл. Использует модули для организации кода.
// Стили подключаются напрямую в HTML для немедленной загрузки

import { initMobileMenu } from "../modules/menu.js";
import { initSubmenu } from "../modules/submenu.js";
import { createSwipeHandler } from "../modules/swipe.js";
import { initCarouselPosition } from "../modules/carousel-position.js";

// Запуск задачи когда браузер свободен (фолбэк для Safari < 16)
const scheduleIdle = cb => {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(cb, { timeout: 2000 });
  } else {
    setTimeout(cb, 200);
  }
};

// Динамические импорты для редко используемых модулей
async function loadFeatureModules() {
  if (document.querySelector(".calculator") || document.querySelector(".price-calc")) {
    try {
      await import("../features/calculator/calculator.js");
    } catch (error) {
      console.warn("Не удалось загрузить модуль calculator:", error);
    }
  }

  if (document.querySelector(".portfolio") || document.querySelector(".portfolio-filter")) {
    try {
      await import("../features/portfolio/portfolio-filter.js");
    } catch (error) {
      console.warn("Не удалось загрузить модуль portfolio:", error);
    }
  }

  if (document.querySelector(".faq") || document.querySelector("[data-faq]")) {
    try {
      await import("../features/faq/faq.js");
    } catch (error) {
      console.warn("Не удалось загрузить модуль FAQ:", error);
    }
  }
}

// Один общий IntersectionObserver для всех анимаций появления при скролле.
// Раньше было 8 отдельных Observer — теперь один на все элементы.
function initScrollReveal() {
  const selectors = [
    "company-description__container",
    "reviews__header",
    "portfolio-description__text",
    "portfolio-description__container",
    "portfolio-service__container",
    "reviews__content",
    "calculator-info__section",
    "portfolio-filter__title",
    "portfolio-filter__intro-text",
    "portfolio-filter__why-title",
    "portfolio-filter__why-list",
  ];

  const elements = [];
  selectors.forEach(cls => {
    document.querySelectorAll(`.${cls}`).forEach(el => {
      el.dataset.revealClass = `${cls}--revealed`;
      elements.push(el);
    });
  });

  if (elements.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(entry.target.dataset.revealClass);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
  );

  elements.forEach(el => observer.observe(el));
}

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

  document
    .querySelector(".articles-carousel__arrow--prev")
    .addEventListener("click", () => navigate(-1));
  document
    .querySelector(".articles-carousel__arrow--next")
    .addEventListener("click", () => navigate(1));
}

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", () => {
  // ─── КРИТИЧНЫЕ: нужны сразу для интерактивности ───────────────────────────
  initMobileMenu();
  initSubmenu();

  const usefulLinksSwipe = createSwipeHandler({
    trackSelector: ".useful-links__grid",
    wrapperSelector: ".useful-links__container",
  });
  usefulLinksSwipe.setupSwipe();

  initCarouselPosition();
  initArticlesCarousel();
  initSocialFixed();

  // Динамические импорты — калькулятор, портфолио, FAQ
  loadFeatureModules();

  // ─── ОТЛОЖЕННЫЕ: анимации и эффекты — запускаем когда браузер свободен ────
  scheduleIdle(() => {
    initScrollReveal();
    initServiceImageParallax();
  });
});
