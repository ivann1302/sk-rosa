// Управление модальным окном успешной отправки формы
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("success-modal");
  if (!modal) {
    return;
  }

  const closeButtons = modal.querySelectorAll("[data-close-modal], .success-modal__close");
  const overlay = modal.querySelector(".success-modal__overlay");
  let previouslyFocusedElement = null;

  function openModal(triggerElement = null) {
    // Сохраняем элемент, который был в фокусе
    previouslyFocusedElement = triggerElement || document.activeElement;

    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Переводим фокус на кнопку закрытия или первую интерактивную кнопку
    const closeButton = modal.querySelector(".success-modal__close");
    const firstButton = modal.querySelector(".success-modal__button");
    const focusTarget = closeButton || firstButton;

    if (focusTarget) {
      // Небольшая задержка для корректной работы анимации
      setTimeout(() => {
        focusTarget.focus();
      }, 100);
    }
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Возвращаем фокус на предыдущий элемент
    if (previouslyFocusedElement && previouslyFocusedElement.focus) {
      try {
        previouslyFocusedElement.focus();
      } catch {
        // Если элемент больше не существует, фокусируемся на body
        document.body.focus();
      }
    }
    previouslyFocusedElement = null;
  }

  if (overlay) {
    overlay.addEventListener("click", closeModal);
  }

  closeButtons.forEach(button => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });

  // Экспорт функции для открытия модального окна
  // Принимает опциональный параметр - элемент, который вызвал открытие
  window.openSuccessModal = openModal;
});
