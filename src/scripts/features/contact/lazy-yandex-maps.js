/**
 * Lazy loading Yandex Maps с использованием IntersectionObserver
 * Загружает карту только когда секция становится видимой
 */
(function () {
  "use strict";

  // Проверяем наличие элемента карты на странице
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    return; // Карты нет на странице
  }

  let isMapLoaded = false;
  let isMapInitialized = false;

  /**
   * Динамически загружает скрипт Yandex Maps API
   */
  function loadYandexMapsScript() {
    if (isMapLoaded) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Проверяем, не загружен ли уже скрипт
      const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
      if (existingScript) {
        isMapLoaded = true;
        // Ждем, пока ymaps станет доступен
        if (typeof ymaps !== "undefined") {
          resolve();
        } else {
          existingScript.addEventListener("load", resolve);
          existingScript.addEventListener("error", reject);
        }
        return;
      }

      // Получаем URL скрипта из констант
      if (!window.CONFIG || !window.CONFIG.yandexMaps) {
        console.warn("CONFIG не загружен, используем стандартный URL");
        const scriptUrl = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
        loadScript(scriptUrl, resolve, reject);
        return;
      }

      const scriptUrl = window.CONFIG.yandexMaps.getScriptUrl();
      loadScript(scriptUrl, resolve, reject);
    });
  }

  /**
   * Загружает скрипт по URL
   */
  function loadScript(url, onLoad, onError) {
    const script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";
    script.async = true;

    script.addEventListener("load", () => {
      isMapLoaded = true;
      onLoad();
    });

    script.addEventListener("error", () => {
      console.error("Ошибка загрузки Yandex Maps API");
      onError(new Error("Failed to load Yandex Maps"));
    });

    document.head.appendChild(script);
  }

  /**
   * Инициализирует карту после загрузки API
   */
  function initMap() {
    if (isMapInitialized) {
      return;
    }

    if (typeof ymaps === "undefined") {
      console.warn("ymaps не доступен");
      return;
    }

    // Используем константы из constants.js
    const office = window.CONFIG?.office || {
      latitude: 55.950398,
      longitude: 37.533535,
      address: "г. Мытищи, д. Грибки, ш. Дмитровское, 31а/3",
      mapZoom: 16,
    };

    ymaps.ready(function () {
      try {
        const myMap = new ymaps.Map("map", {
          center: [office.latitude, office.longitude],
          zoom: office.mapZoom,
          controls: ["zoomControl", "fullscreenControl"],
        });

        const myPlacemark = new ymaps.Placemark(
          [office.latitude, office.longitude],
          {
            balloonContent: office.address,
          },
          {
            preset: "islands#redDotIcon",
          }
        );

        myMap.geoObjects.add(myPlacemark);
        isMapInitialized = true;
      } catch (error) {
        console.error("Ошибка инициализации карты:", error);
      }
    });
  }

  /**
   * Загружает и инициализирует карту
   */
  async function loadAndInitMap() {
    if (isMapInitialized) {
      return;
    }

    try {
      await loadYandexMapsScript();
      initMap();
    } catch (error) {
      console.error("Ошибка загрузки Yandex Maps:", error);
    }
  }

  /**
   * Настройка IntersectionObserver для lazy loading
   */
  function setupLazyLoading() {
    // Проверяем поддержку IntersectionObserver
    if (!("IntersectionObserver" in window)) {
      // Fallback: загружаем сразу, если IntersectionObserver не поддерживается
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadAndInitMap);
      } else {
        loadAndInitMap();
      }
      return;
    }

    // Настройки для IntersectionObserver
    const observerOptions = {
      root: null, // viewport
      rootMargin: "200px", // Начинаем загрузку за 200px до появления в viewport
      threshold: 0.1, // Срабатывает когда 10% элемента видно
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isMapInitialized) {
          loadAndInitMap();
          // Отключаем наблюдение после начала загрузки
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Начинаем наблюдение за элементом карты
    observer.observe(mapElement);
  }

  // Запускаем lazy loading после загрузки DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupLazyLoading);
  } else {
    setupLazyLoading();
  }
})();
