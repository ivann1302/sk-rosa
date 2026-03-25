// Импорт функций валидации и отправки
import {
  validatePhone,
  setupFieldValidation,
  showFieldError,
  hideFieldError,
  applyPhoneMask,
} from "../contact/form-validation.js";
import { submitForm, setSubmitButtonState } from "../contact/form-utils.js";
import { captureUtm, getUtmData } from "../contact/utm-tracker.js";

captureUtm();

const MESSENGER_NAMES = {
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  viber: "Viber",
};

document.addEventListener("DOMContentLoaded", function () {
  // Переключение между мессенджерами
  const messengerBtns = document.querySelectorAll(".price-calc__messenger-btn");

  messengerBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      messengerBtns.forEach(b => b.classList.remove("price-calc__messenger-btn--active"));
      this.classList.add("price-calc__messenger-btn--active");
    });
  });

  const form = document.querySelector(".price-calc__form");
  const phoneField = document.querySelector(".price-calc__phone-field");

  if (!form || !phoneField) {
    return;
  }

  setupFieldValidation(phoneField, validatePhone);
  applyPhoneMask(phoneField);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    hideFieldError(phoneField);

    const activeMessengerBtn = document.querySelector(".price-calc__messenger-btn--active");
    const activeMessenger = activeMessengerBtn ? activeMessengerBtn.dataset.messenger : "telegram";
    const messengerName = MESSENGER_NAMES[activeMessenger] || "Telegram";

    const phone = phoneField.value.trim();
    const validation = validatePhone(phone);
    if (!validation.valid) {
      showFieldError(phoneField, validation.error);
      phoneField.focus();
      return;
    }

    const formData = new FormData();
    formData.append("PHONE", phone);
    formData.append("MESSENGER", messengerName);

    const utmData = getUtmData();
    Object.entries(utmData).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    const submitBtn = form.querySelector(".price-calc__submit-btn");
    setSubmitButtonState(submitBtn, true, "Отправка...");

    try {
      const result = await submitForm(form.action, formData);

      if (result.success) {
        if (typeof ym !== "undefined") {
          ym(107041182, "reachGoal", "form_submit");
        }
        if (window.openSuccessModal) {
          window.openSuccessModal(submitBtn);
        } else {
          alert("Спасибо! Мы пришлём расчёт в " + messengerName + ". Ждите в течение 15 минут.");
        }
        form.reset();
      } else {
        alert(result.error || "Ошибка при отправке. Попробуйте позже.");
      }
    } catch (error) {
      console.error("Ошибка отправки формы:", error);
      alert("Ошибка при отправке. Попробуйте позже.");
    } finally {
      setSubmitButtonState(submitBtn, false);
    }
  });
});
