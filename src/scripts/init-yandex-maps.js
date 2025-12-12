/**
 * Инициализация Yandex Maps API с использованием констант
 * Автоматически загружает скрипт с правильным API ключом
 */
(function () {
  "use strict";

  function initYandexMaps() {
    if (!window.CONFIG) {
      console.warn("CONFIG не загружен, повторная попытка через 100ms");
      setTimeout(initYandexMaps, 100);
      return;
    }

    const yandexMaps = window.CONFIG.yandexMaps;
    const scriptUrl = yandexMaps.getScriptUrl();

    // Проверяем, не загружен ли уже скрипт
    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
    if (existingScript) {
      // Обновляем src если нужно
      if (existingScript.src !== scriptUrl) {
        existingScript.src = scriptUrl;
      }
      return;
    }

    // Создаем и загружаем скрипт
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.type = "text/javascript";
    script.async = true;

    // Вставляем перед другими скриптами
    const firstScript =
      document.querySelector('script[src*="yamap.js"]') ||
      document.querySelector('script[src*="constants.js"]');
    if (firstScript) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }

  // Запускаем после загрузки констант
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initYandexMaps);
  } else {
    initYandexMaps();
  }
})();
