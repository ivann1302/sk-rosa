// Импорт функций валидации
import { 
  validatePhone, 
  setupFieldValidation, 
  showFieldError, 
  hideFieldError,
  applyPhoneMask 
} from "../contact/form-validation.js";

document.addEventListener("DOMContentLoaded", function () {
  // Переключение между мессенджерами
  const messengerBtns = document.querySelectorAll(".price-calc__messenger-btn");

  messengerBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      // Убираем активный класс у всех кнопок
      messengerBtns.forEach(b => b.classList.remove("price-calc__messenger-btn--active"));
      // Добавляем активный класс к нажатой кнопке
      this.classList.add("price-calc__messenger-btn--active");
    });
  });

  // Обработка отправки формы с валидацией
  const submitBtn = document.querySelector(".price-calc__submit-btn");
  const phoneField = document.querySelector(".price-calc__phone-field");

  if (submitBtn && phoneField) {
    // Настройка валидации в реальном времени
    setupFieldValidation(phoneField, validatePhone);
    applyPhoneMask(phoneField);

    submitBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Скрываем предыдущие ошибки
      hideFieldError(phoneField);

      const phone = phoneField.value.trim();
      const activeMessengerBtn = document.querySelector(".price-calc__messenger-btn--active");
      
      if (!activeMessengerBtn) {
        alert("Пожалуйста, выберите способ связи");
        return;
      }

      const activeMessenger = activeMessengerBtn.dataset.messenger;

      // Валидация телефона
      const validation = validatePhone(phone);
      if (!validation.valid) {
        showFieldError(phoneField, validation.error);
        phoneField.focus();
        return;
      }

      // Отправка данных (заглушка)
      // Данные отправляются через выбранный мессенджер

      let messengerName = "";
      switch (activeMessenger) {
        case "telegram":
          messengerName = "Telegram";
          break;
        case "whatsapp":
          messengerName = "WhatsApp";
          break;
        case "viber":
          messengerName = "Viber";
          break;
        default:
          messengerName = "Telegram";
      }

      alert(`Смета будет отправлена в ${messengerName} на номер ${phone}`);

      // Очищаем поле
      phoneField.value = "";
    });
  }
});
