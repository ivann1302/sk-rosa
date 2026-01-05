// Универсальный обработчик форм для показа модального окна
import { validateForm, submitForm, setSubmitButtonState } from "./form-utils.js";
import { 
  validateName, 
  validatePhone, 
  setupFieldValidation, 
  showFieldError, 
  hideFieldError,
  applyPhoneMask 
} from "./form-validation.js";

document.addEventListener("DOMContentLoaded", function () {
  // Список селекторов форм, которые нужно обработать
  const formSelectors = [
    ".contact-form__form", // Форма на главной странице
    ".calculator-request__form", // Форма в калькуляторе
    ".contact-request-turnkey__form-fields", // Форма на странице ремонта под ключ
    ".about-turnkey-2__form", // Форма калькулятора на странице ремонта под ключ
  ];

  formSelectors.forEach(selector => {
    const form = document.querySelector(selector);
    if (!form) return;

    // Настройка валидации в реальном времени для каждого поля
    const nameField = form.querySelector('input[name="NAME"]');
    if (nameField) {
      setupFieldValidation(nameField, validateName);
    }

    const phoneField = form.querySelector('input[name="PHONE"]');
    if (phoneField) {
      setupFieldValidation(phoneField, validatePhone);
      applyPhoneMask(phoneField);
    }

    // Предотвращаем стандартную отправку
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Скрываем все предыдущие ошибки
      form.querySelectorAll('.field--error').forEach(field => {
        hideFieldError(field);
      });

      // Получаем данные формы
      const formData = new FormData(form);

      // Валидация
      const validation = validateForm(formData);
      if (!validation.valid) {
        // Показываем ошибки для всех полей
        const errors = validation.errors || {};
        
        if (errors.NAME && nameField) {
          showFieldError(nameField, errors.NAME);
        }
        
        if (errors.PHONE && phoneField) {
          showFieldError(phoneField, errors.PHONE);
        }
        
        // Фокус на первое поле с ошибкой
        const firstErrorField = nameField?.classList.contains('field--error') ? nameField : phoneField;
        if (firstErrorField) {
          firstErrorField.focus();
        }
        
        return;
      }

      // Показываем индикатор загрузки
      const submitButton = form.querySelector('button[type="submit"]');
      setSubmitButtonState(submitButton, true, "Отправка...");

      try {
        // Отправка на сервер с проверкой статуса
        const result = await submitForm(form.action, formData);

        if (result.success) {
          // Показываем модальное окно успеха, передавая кнопку для фокуса
          if (window.openSuccessModal) {
            window.openSuccessModal(submitButton);
          } else {
            alert("Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в течение 15 минут.");
          }
          form.reset();
        } else {
          alert(result.error || "Ошибка при отправке. Попробуйте позже.");
        }
      } catch (error) {
        console.error("Ошибка отправки формы:", error);

        // Более информативное сообщение об ошибке
        let errorMessage = "Ошибка при отправке. Попробуйте позже.";
        if (error.message.includes("CSRF токен") || error.message.includes("CSRF")) {
          errorMessage = "Ошибка безопасности. Пожалуйста, обновите страницу и попробуйте снова.";
        } else if (error.message.includes("HTTP error")) {
          const statusMatch = error.message.match(/status: (\d+)/);
          if (statusMatch && statusMatch[1] === "403") {
            errorMessage = "Ошибка безопасности. Пожалуйста, обновите страницу и попробуйте снова.";
          } else {
            errorMessage = "Ошибка сервера. Пожалуйста, попробуйте позже.";
          }
        } else if (error.message.includes("JSON") || error.message.includes("формата")) {
          errorMessage = "Ошибка обработки ответа сервера. Пожалуйста, попробуйте позже.";
        } else if (error.message.includes("Failed to fetch") || error.message.includes("fetch")) {
          errorMessage = "Ошибка подключения. Проверьте интернет-соединение и попробуйте позже.";
        }

        alert(errorMessage);
      } finally {
        // Восстанавливаем кнопку
        setSubmitButtonState(submitButton, false);
      }
    });
  });
});
