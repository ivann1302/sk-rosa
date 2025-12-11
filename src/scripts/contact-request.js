// Обработка формы заявки
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".contact-request__form-fields");

  if (!form) return;

  // Маска для телефона
  const phoneInput = form.querySelector("#phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");

      if (value.length > 0) {
        if (value.length <= 1) {
          value = "+7 (" + value;
        } else if (value.length <= 4) {
          value = "+7 (" + value.substring(1, 4);
        } else if (value.length <= 7) {
          value = "+7 (" + value.substring(1, 4) + ") " + value.substring(4, 7);
        } else if (value.length <= 9) {
          value =
            "+7 (" +
            value.substring(1, 4) +
            ") " +
            value.substring(4, 7) +
            "-" +
            value.substring(7, 9);
        } else {
          value =
            "+7 (" +
            value.substring(1, 4) +
            ") " +
            value.substring(4, 7) +
            "-" +
            value.substring(7, 9) +
            "-" +
            value.substring(9, 11);
        }
      }

      e.target.value = value;
    });
  }

  // Обработка отправки формы
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Получаем данные формы
    const formData = new FormData(form);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
    };

    // Валидация
    if (!data.name || !data.phone) {
      showMessage("Пожалуйста, заполните обязательные поля", "error");
      return;
    }

    if (data.phone.replace(/\D/g, "").length < 10) {
      showMessage("Пожалуйста, введите корректный номер телефона", "error");
      return;
    }

    // Показываем сообщение об успешной отправке
    showMessage(
      "Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в течение 15 минут.",
      "success"
    );

    // Очищаем форму
    form.reset();

    // Здесь можно добавить отправку данных на сервер
    console.log("Данные формы:", data);
  });

  // Функция для показа сообщений
  function showMessage(text, type) {
    // Удаляем предыдущие сообщения
    const existingMessage = document.querySelector(".contact-request__message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Создаем новое сообщение
    const message = document.createElement("div");
    message.className = `contact-request__message contact-request__message--${type}`;
    message.textContent = text;
    message.style.cssText = `
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.9rem;
      font-weight: 500;
      text-align: center;
      ${
        type === "success"
          ? "background: #d4edda; color: #155724; border: 1px solid #c3e6cb;"
          : "background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;"
      }
    `;

    // Вставляем сообщение перед формой
    const formTitle = form.querySelector(".contact-request__form-title");
    formTitle.parentNode.insertBefore(message, formTitle.nextSibling);

    // Удаляем сообщение через 5 секунд
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 5000);
  }
});
