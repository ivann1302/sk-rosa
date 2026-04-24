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

const SERVICE_CONFIGS = {
  "floor-screed": {
    quizLabel: "Квиз-расчёт стяжки пола:",
    miniCalcLabel: "Мини-калькулятор стяжки:",
    coatingFieldLabel: "Покрытие",
    rates: {
      "Плитка / керамогранит": { base: 1000, type: "Цементная стяжка" },
      "Ламинат / паркет": { base: 900, type: "Полусухая стяжка" },
      "Тёплый пол": { base: 1100, type: "Цементная стяжка под тёплый пол" },
      "Не знаю — подскажите": { base: 950, type: "Полусухая стяжка" },
    },
    propertyMultiplier: {
      "Квартира / новостройка": 1.0,
      "Частный дом / коттедж": 1.0,
      "Офис / магазин / кафе": 1.0,
      "Склад / цех / автосервис": 1.1,
    },
  },
  plastering: {
    quizLabel: "Квиз-расчёт штукатурных работ:",
    miniCalcLabel: "Мини-калькулятор штукатурки:",
    coatingFieldLabel: "Отделка",
    rates: {
      "Под обои": { base: 450, type: "Гипсовая штукатурка по маякам" },
      "Под покраску": { base: 500, type: "Гипсовая штукатурка под покраску" },
      "Под плитку": { base: 550, type: "Цементная штукатурка" },
      "Не знаю — подскажите": { base: 480, type: "Гипсовая штукатурка по маякам" },
    },
    propertyMultiplier: {
      "Квартира / новостройка": 1.0,
      "Частный дом / коттедж": 1.0,
      "Офис / магазин / кафе": 1.05,
      "Склад / цех / автосервис": 1.1,
    },
  },
};

function getServiceConfig(form) {
  const key = form?.dataset?.service;
  return SERVICE_CONFIGS[key] || SERVICE_CONFIGS["floor-screed"];
}

const roundTo = (value, step) => Math.round(value / step) * step;

const formatPrice = value => value.toLocaleString("ru-RU");

function calculatePrice(config, area, propertyType, coating) {
  const rates = config.rates;
  const rate = rates[coating] ?? rates["Не знаю — подскажите"];
  const multiplier = config.propertyMultiplier[propertyType] ?? 1.0;
  const base = area * rate.base * multiplier;
  const min = roundTo(base * 0.9, 500);
  const max = roundTo(base * 1.1, 500);
  return { min, max, recommendation: rate.type };
}

function initMiniCalc() {
  const form = document.querySelector(".price-calc__mini-calc");
  if (!form) {
    return;
  }

  const config = getServiceConfig(form);
  const areaField = form.querySelector("[data-calc-area]");
  const typeField = form.querySelector("[data-calc-type]");
  const amountEl = form.querySelector("[data-calc-amount]");
  const commentsInput = form.querySelector("[data-calc-comments]");
  const phoneField = form.querySelector(".price-calc__phone-field");

  function getRate() {
    const option = typeField.options[typeField.selectedIndex];
    return Number(option?.dataset.rate) || 0;
  }

  function getAmount() {
    const area = Number(areaField.value) || 0;
    return area * getRate();
  }

  function updateAmount() {
    amountEl.textContent = getAmount().toLocaleString("ru-RU");
  }

  function buildComments() {
    const area = Number(areaField.value) || 0;
    const option = typeField.options[typeField.selectedIndex];
    const lines = [
      config.miniCalcLabel,
      `• Площадь: ${area} м²`,
      `• Тип: ${option.value}`,
      `• Ставка: ${option.dataset.rate} ₽/м²`,
      `• Ориентир: ${getAmount().toLocaleString("ru-RU")} ₽`,
      "Клиент оставил заявку на точный расчёт.",
    ];
    commentsInput.value = lines.join("\n");
  }

  areaField.addEventListener("input", updateAmount);
  typeField.addEventListener("change", updateAmount);

  setupFieldValidation(phoneField, validatePhone);
  applyPhoneMask(phoneField);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    hideFieldError(phoneField);

    const area = Number(areaField.value);
    if (!area || area < 1 || area > 10000) {
      alert("Укажите площадь от 1 до 10 000 м²");
      areaField.focus();
      return;
    }

    const phone = phoneField.value.trim();
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      showFieldError(phoneField, phoneValidation.error);
      phoneField.focus();
      return;
    }

    buildComments();

    const formData = new FormData(form);
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
          alert("Спасибо! Менеджер перезвонит в течение 15 минут.");
        }
        form.reset();
        updateAmount();
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

  updateAmount();
}

document.addEventListener("DOMContentLoaded", function () {
  initMiniCalc();

  const form = document.querySelector(".price-calc__form--quiz");

  if (!form) {
    return;
  }

  const config = getServiceConfig(form);
  const steps = Array.from(form.querySelectorAll(".price-calc__quiz-step"));
  const dots = Array.from(form.querySelectorAll(".price-calc__quiz-dot"));
  const areaField = form.querySelector('input[name="AREA"]');
  const areaPresets = Array.from(form.querySelectorAll("[data-area-preset]"));
  const phoneField = form.querySelector(".price-calc__phone-field");
  const commentsInput = form.querySelector("[data-quiz-comments]");

  let currentStep = 1;

  function goToStep(step) {
    currentStep = step;
    steps.forEach(el => {
      const stepNum = Number(el.dataset.step);
      el.classList.toggle("price-calc__quiz-step--active", stepNum === step);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle("price-calc__quiz-dot--active", index < step);
    });
    form.querySelectorAll(".price-calc__quiz-error--visible").forEach(el => {
      el.classList.remove("price-calc__quiz-error--visible");
    });
  }

  function showStepError(step) {
    const error = form.querySelector(`[data-quiz-error="${step}"]`);
    if (error) {
      error.classList.add("price-calc__quiz-error--visible");
    }
  }

  function validateStep(step) {
    if (step === 1) {
      const value = Number(areaField.value);
      if (!value || value < 1 || value > 10000) {
        showStepError(1);
        areaField.focus();
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!form.querySelector('input[name="PROPERTY_TYPE"]:checked')) {
        showStepError(2);
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!form.querySelector('input[name="COATING"]:checked')) {
        showStepError(3);
        return false;
      }
      return true;
    }
    return true;
  }

  // Собираем сводку для диспетчера (не показываем клиенту).
  function buildComments() {
    const area = Number(areaField.value);
    const propertyType = form.querySelector('input[name="PROPERTY_TYPE"]:checked')?.value ?? "";
    const coating = form.querySelector('input[name="COATING"]:checked')?.value ?? "";
    const { min, max, recommendation } = calculatePrice(config, area, propertyType, coating);

    const lines = [
      config.quizLabel,
      `• Площадь: ${area} м²`,
      `• Объект: ${propertyType}`,
      `• ${config.coatingFieldLabel}: ${coating}`,
      `• Рекомендация: ${recommendation}`,
      `• Ориентир: ${formatPrice(min)}–${formatPrice(max)} ₽`,
      "Клиент просил перезвонить для уточнения точной стоимости.",
    ];
    commentsInput.value = lines.join("\n");
  }

  // Навигация по шагам
  form.querySelectorAll("[data-quiz-next]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = Number(btn.dataset.quizNext);
      if (!validateStep(currentStep)) {
        return;
      }
      if (target === 4) {
        buildComments();
      }
      goToStep(target);
    });
  });

  form.querySelectorAll("[data-quiz-prev]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = Number(btn.dataset.quizPrev);
      goToStep(target);
    });
  });

  // Пресеты площади
  areaPresets.forEach(preset => {
    preset.addEventListener("click", () => {
      areaField.value = preset.dataset.areaPreset;
      areaPresets.forEach(p => p.classList.remove("price-calc__quiz-preset--active"));
      preset.classList.add("price-calc__quiz-preset--active");
      const error = form.querySelector('[data-quiz-error="1"]');
      if (error) {
        error.classList.remove("price-calc__quiz-error--visible");
      }
    });
  });

  areaField.addEventListener("input", () => {
    areaPresets.forEach(p => p.classList.remove("price-calc__quiz-preset--active"));
    const error = form.querySelector('[data-quiz-error="1"]');
    if (error) {
      error.classList.remove("price-calc__quiz-error--visible");
    }
  });

  form.querySelectorAll('input[name="PROPERTY_TYPE"], input[name="COATING"]').forEach(input => {
    input.addEventListener("change", () => {
      form.querySelectorAll(".price-calc__quiz-error--visible").forEach(el => {
        el.classList.remove("price-calc__quiz-error--visible");
      });
    });
  });

  // Маска и валидация телефона
  setupFieldValidation(phoneField, validatePhone);
  applyPhoneMask(phoneField);

  // Отправка
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    hideFieldError(phoneField);

    const phone = phoneField.value.trim();
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      showFieldError(phoneField, phoneValidation.error);
      phoneField.focus();
      return;
    }

    // Пересобираем COMMENTS на случай, если пользователь менял ответы
    buildComments();

    const formData = new FormData(form);

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
          alert("Спасибо! Менеджер перезвонит в течение 15 минут.");
        }
        form.reset();
        goToStep(1);
        areaPresets.forEach(p => p.classList.remove("price-calc__quiz-preset--active"));
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
