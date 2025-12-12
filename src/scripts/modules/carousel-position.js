/**
 * Модуль для установки начальной позиции карусели отзывов на мобильном
 * Устанавливает начальную позицию скролла в 0, чтобы был виден padding-left
 */
export function initCarouselPosition() {
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
}
