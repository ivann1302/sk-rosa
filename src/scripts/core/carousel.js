// Инициализация карусели портфолио
document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.querySelector(".portfolio-carousel__wrapper");
  const track = document.querySelector(".portfolio-carousel__track");
  const leftBtn = document.querySelector(".portfolio-carousel__arrow--left");
  const rightBtn = document.querySelector(".portfolio-carousel__arrow--right");
  let current = 0;
  const cards = track ? track.querySelectorAll('div[style*="position:relative"]') : [];
  const visible = 3;
  function update() {
    const card = cards[0];
    // eslint-disable-next-line prefer-const
    let cardWidth = card ? card.offsetWidth : 0;
    if (track) {
      track.style.transform = `translateX(${-current * (cardWidth + 24)}px)`;
    }
  }
  if (carousel && track && leftBtn && rightBtn) {
    leftBtn.addEventListener("click", function () {
      if (current > 0) {
        current--;
        update();
      }
    });
    rightBtn.addEventListener("click", function () {
      if (current < cards.length - visible) {
        current++;
        update();
      }
    });
    window.addEventListener("resize", update);
    update();
  }

  // Инициализация карусели отзывов
  const reviewsCarousel = document.querySelector(".reviews-carousel__wrapper");
  const reviewsTrack = document.querySelector(".reviews-carousel__track");
  const reviewsLeftBtn = document.querySelector(".reviews-carousel__arrow--left");
  const reviewsRightBtn = document.querySelector(".reviews-carousel__arrow--right");

  let reviewsCurrent = 0;
  const reviewsCards = reviewsTrack ? reviewsTrack.querySelectorAll(".reviews-card") : [];
  const reviewsVisible = 4;

  const isMobileReviews = () => window.innerWidth <= 768;

  function updateArrowsState() {
    if (!reviewsLeftBtn || !reviewsRightBtn) {
      return;
    }
    if (isMobileReviews()) {
      const atStart = reviewsCarousel.scrollLeft <= 0;
      const atEnd =
        reviewsCarousel.scrollLeft >= reviewsCarousel.scrollWidth - reviewsCarousel.offsetWidth - 1;
      if (atStart) {
        reviewsLeftBtn.classList.add("reviews-carousel__arrow--disabled");
      } else {
        reviewsLeftBtn.classList.remove("reviews-carousel__arrow--disabled");
      }
      if (atEnd) {
        reviewsRightBtn.classList.add("reviews-carousel__arrow--disabled");
      } else {
        reviewsRightBtn.classList.remove("reviews-carousel__arrow--disabled");
      }
    } else {
      if (reviewsCurrent === 0) {
        reviewsLeftBtn.classList.add("reviews-carousel__arrow--disabled");
      } else {
        reviewsLeftBtn.classList.remove("reviews-carousel__arrow--disabled");
      }
      if (reviewsCurrent >= reviewsCards.length - reviewsVisible) {
        reviewsRightBtn.classList.add("reviews-carousel__arrow--disabled");
      } else {
        reviewsRightBtn.classList.remove("reviews-carousel__arrow--disabled");
      }
    }
  }

  function reviewsUpdate() {
    if (!isMobileReviews()) {
      const card = reviewsCards[0];
      const cardWidth = card ? card.offsetWidth : 0;
      if (reviewsTrack) {
        reviewsTrack.style.transform = `translateX(${-reviewsCurrent * (cardWidth + 24)}px)`;
      }
    }
    updateArrowsState();
  }

  if (reviewsCarousel && reviewsTrack && reviewsLeftBtn && reviewsRightBtn) {
    reviewsLeftBtn.addEventListener("click", function () {
      if (isMobileReviews()) {
        const cardWidth = reviewsCards[0] ? reviewsCards[0].offsetWidth + 12 : 0;
        reviewsCarousel.scrollBy({ left: -cardWidth, behavior: "smooth" });
      } else {
        if (reviewsCurrent > 0) {
          reviewsCurrent--;
          reviewsUpdate();
        }
      }
    });

    reviewsRightBtn.addEventListener("click", function () {
      if (isMobileReviews()) {
        const cardWidth = reviewsCards[0] ? reviewsCards[0].offsetWidth + 12 : 0;
        reviewsCarousel.scrollBy({ left: cardWidth, behavior: "smooth" });
      } else {
        if (reviewsCurrent < reviewsCards.length - reviewsVisible) {
          reviewsCurrent++;
          reviewsUpdate();
        }
      }
    });

    reviewsCarousel.addEventListener("scroll", updateArrowsState);
    window.addEventListener("resize", reviewsUpdate);
    reviewsUpdate();
  }
});
