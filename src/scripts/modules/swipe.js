/**
 Универсальный модуль для свайпа на мобильных устройствах
 Используется для каруселей отзывов и полезных ссылок
 */
export function createSwipeHandler(config) {
  const { trackSelector, wrapperSelector, isMobile = () => window.innerWidth <= 768 } = config;

  function setupSwipe() {
    const track = document.querySelector(trackSelector);
    const wrapper = document.querySelector(wrapperSelector);

    if (!track || !wrapper) {
      return;
    }

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let index = 0;
    let touchHandlersAdded = false;

    const slides = Array.from(track.children);
    const total = slides.length;

    function updateTransform() {
      // Работаем ТОЛЬКО на мобильных - на десктопе вообще ничего не делаем
      if (!isMobile()) {
        return; // Не трогаем transform на десктопе
      }

      const swipeWidth = window.innerWidth <= 768 ? window.innerWidth - 36 : wrapper.clientWidth;
      track.style.transform = `translateX(${-index * swipeWidth}px)`;
    }

    function clampIndex(value) {
      return Math.max(0, Math.min(total - 1, value));
    }

    function addTouchHandlers() {
      if (touchHandlersAdded || !isMobile()) {
        return;
      }

      track.style.transition = "transform 0.3s ease";

      const touchStartHandler = e => {
        if (!isMobile()) {
          return;
        }
        isDragging = true;
        startX = e.touches[0].clientX;
        currentX = startX;
        track.style.transition = "none";
      };

      const touchMoveHandler = e => {
        if (!isDragging || !isMobile()) {
          return;
        }
        currentX = e.touches[0].clientX;
        const dx = currentX - startX;
        const swipeWidth = window.innerWidth <= 768 ? window.innerWidth - 36 : wrapper.clientWidth;
        track.style.transform = `translateX(${-index * swipeWidth + dx}px)`;
        e.preventDefault();
      };

      const endDrag = () => {
        if (!isDragging || !isMobile()) {
          return;
        }
        isDragging = false;
        const dx = currentX - startX;
        const swipeWidth = window.innerWidth <= 768 ? window.innerWidth - 36 : wrapper.clientWidth;
        const threshold = swipeWidth * 0.1; // 10%
        if (dx < -threshold) {
          index = clampIndex(index + 1);
        }
        if (dx > threshold) {
          index = clampIndex(index - 1);
        }
        track.style.transition = "transform 0.3s ease";
        updateTransform();
      };

      wrapper.addEventListener("touchstart", touchStartHandler, { passive: false });
      wrapper.addEventListener("touchmove", touchMoveHandler, { passive: false });
      wrapper.addEventListener("touchend", endDrag, { passive: true });
      wrapper.addEventListener("touchcancel", endDrag, { passive: true });

      touchHandlersAdded = true;
    }

    // Инициализация при загрузке
    if (isMobile()) {
      addTouchHandlers();
      updateTransform();
    }

    // Обработка изменения размера окна
    window.addEventListener("resize", () => {
      if (isMobile()) {
        // Переключились на мобильный - инициализируем свайп
        if (!touchHandlersAdded) {
          addTouchHandlers();
        }
        updateTransform();
      }
      // На десктопе ничего не делаем - пусть carousel.js управляет
    });
  }

  return { setupSwipe };
}
