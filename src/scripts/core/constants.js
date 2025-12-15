const CONFIG = {
  // Контактная информация
  contact: {
    phone: "+7 (985) 135-49-91",
    phoneClean: "79851354991", // Для ссылок tel: и WhatsApp
    email: "ooo.rosa2019@yandex.ru",
    whatsappUrl: "https://wa.me/79851354991",
    whatsappUrlWithText: (text = "Hello, I'd like a consultation") =>
      `https://wa.me/79851354991?text=${encodeURIComponent(text)}`,
  },

  // Адрес и координаты офиса
  office: {
    address: "г. Мытищи, д. Грибки, ш. Дмитровское, 31а/3",
    latitude: 55.950398,
    longitude: 37.533535,
    mapZoom: 16,
  },

  // Yandex Maps API
  yandexMaps: {
    apiKey: "your-api-key", // Замените на реальный ключ в constants.js
    lang: "ru_RU",
    getScriptUrl() {
      // Если API ключ не установлен, используем версию без ключа
      if (this.apiKey === "your-api-key" || !this.apiKey) {
        return `https://api-maps.yandex.ru/2.1/?lang=${this.lang}`;
      }
      return `https://api-maps.yandex.ru/2.1/?apikey=${this.apiKey}&lang=${this.lang}`;
    },
  },

  // Bitrix24 конфигурация хранится в .env файле и используется только в PHP
  // См. src/scripts/api/send.php и .env.example
};

// Экспорт для использования в других модулях
// eslint-disable-next-line no-undef
if (typeof module !== "undefined" && module.exports) {
  // eslint-disable-next-line no-undef
  module.exports = CONFIG;
}

// Глобальный доступ для использования в HTML
window.CONFIG = CONFIG;
