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

  // Обработка отправки формы
  const submitBtn = document.querySelector(".price-calc__submit-btn");
  const phoneField = document.querySelector(".price-calc__phone-field");

  if (submitBtn && phoneField) {
    submitBtn.addEventListener("click", function () {
      const phone = phoneField.value.trim();
      const activeMessenger = document.querySelector(".price-calc__messenger-btn--active").dataset
        .messenger;

      if (!phone) {
        alert("Пожалуйста, введите номер телефона");
        return;
      }

      // Здесь можно добавить валидацию номера телефона
      if (phone.length < 10) {
        alert("Пожалуйста, введите корректный номер телефона");
        return;
      }

      // Отправка данных (заглушка)
      console.log("Отправка сметы:", {
        phone: phone,
        messenger: activeMessenger,
      });

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
