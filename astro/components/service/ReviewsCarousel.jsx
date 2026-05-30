import { useEffect, useRef, useState } from "react";

const MOBILE_BREAKPOINT = 768;

function ReviewCard({ review, onOpen }) {
  const isImageReview = Boolean(review.screenshot);

  return (
    <button
      className={`reviews-card${isImageReview ? " reviews-card--image" : ""}`}
      type="button"
      onClick={() => onOpen(review)}
      aria-label={`Открыть отзыв клиента ${review.name}`}
    >
      {isImageReview ? (
        <img
          className="reviews-card__screenshot"
          src={review.screenshot}
          alt={`Отзыв клиента ${review.name}: ${review.text}`}
          loading="lazy"
        />
      ) : (
        <>
          <div className="reviews-card__header">
            <img src={review.image} alt="" />
            <div className="reviews-card__name">{review.name}</div>
          </div>
          <div className="reviews-card__text">{review.text}</div>
        </>
      )}
    </button>
  );
}

function ReviewModal({ review, onClose }) {
  if (!review) {
    return null;
  }

  return (
    <div
      className="reviews-modal"
      onMouseDown={event => event.currentTarget === event.target && onClose()}
    >
      <div
        className="reviews-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Отзыв клиента ${review.name}`}
      >
        <button
          className="reviews-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Закрыть отзыв"
        >
          ×
        </button>
        {review.screenshot ? (
          <img
            className="reviews-modal__image"
            src={review.screenshot}
            alt={`Отзыв клиента ${review.name}: ${review.text}`}
          />
        ) : (
          <div className="reviews-modal__text-card">
            <div className="reviews-card__header">
              <img src={review.image} alt="" />
              <div className="reviews-card__name">{review.name}</div>
            </div>
            <div className="reviews-card__text">{review.text}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewsCarousel({ reviews }) {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [maxCurrent, setMaxCurrent] = useState(0);
  const [activeReview, setActiveReview] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const updateCarouselState = () => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    const firstCard = track?.querySelector(".reviews-card");

    if (!wrapper || !track || !firstCard) {
      return;
    }

    const nextIsMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 24;
    const visible = Math.max(1, Math.round(wrapper.offsetWidth / (firstCard.offsetWidth + gap)));
    const nextMaxCurrent = Math.max(0, reviews.length - visible);

    setIsMobile(nextIsMobile);
    setMaxCurrent(nextMaxCurrent);
    setCurrent(value => Math.min(value, nextMaxCurrent));
  };

  useEffect(() => {
    updateCarouselState();
    window.addEventListener("resize", updateCarouselState);

    return () => window.removeEventListener("resize", updateCarouselState);
  }, [reviews.length]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    const firstCard = track?.querySelector(".reviews-card");

    if (!wrapper || !track || !firstCard || isMobile) {
      return;
    }

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 24;
    track.style.transform = `translateX(${-current * (firstCard.offsetWidth + gap)}px)`;
  }, [current, isMobile]);

  useEffect(() => {
    if (!activeReview) {
      return;
    }

    const handleKeyDown = event => {
      if (event.key === "Escape") {
        setActiveReview(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeReview]);

  const move = direction => {
    if (isMobile) {
      const wrapper = wrapperRef.current;
      const track = trackRef.current;
      const firstCard = track?.querySelector(".reviews-card");
      const gap = track ? Number.parseFloat(window.getComputedStyle(track).columnGap) || 12 : 12;

      wrapper?.scrollBy({
        left: direction * ((firstCard?.offsetWidth ?? 0) + gap),
        behavior: "smooth",
      });
      return;
    }

    setCurrent(value => Math.min(maxCurrent, Math.max(0, value + direction)));
  };

  return (
    <>
      <div className="reviews__carousel-outer">
        <button
          className={`reviews-carousel__arrow reviews-carousel__arrow--left${
            current === 0 ? " reviews-carousel__arrow--disabled" : ""
          }`}
          type="button"
          onClick={() => move(-1)}
          aria-label="Предыдущие отзывы"
        >
          &#8592;
        </button>
        <section className="reviews-carousel">
          <h2 className="visually-hidden">Карусель отзывов</h2>
          <div className="reviews-carousel__wrapper" data-react-reviews ref={wrapperRef}>
            <div className="reviews-carousel__track" ref={trackRef}>
              {reviews.map(review => (
                <ReviewCard
                  review={review}
                  onOpen={setActiveReview}
                  key={`${review.name}-${review.text}`}
                />
              ))}
            </div>
          </div>
        </section>
        <button
          className={`reviews-carousel__arrow reviews-carousel__arrow--right${
            current >= maxCurrent ? " reviews-carousel__arrow--disabled" : ""
          }`}
          type="button"
          onClick={() => move(1)}
          aria-label="Следующие отзывы"
        >
          &#8594;
        </button>
      </div>
      <ReviewModal review={activeReview} onClose={() => setActiveReview(null)} />
    </>
  );
}
