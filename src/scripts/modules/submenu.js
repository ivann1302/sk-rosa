/**
 * Модуль подменю "Наши услуги"
 * Обрабатывает открытие/закрытие подменю на мобильных и hover на десктопе
 */

// Константы
const MOBILE_BREAKPOINT = 768;
const RESIZE_DEBOUNCE_DELAY = 150; // Задержка для debounce resize

// Хранилище обработчиков для очистки
const submenuHandlers = new Map();

/**
 * Debounce функция для оптимизации обработки событий
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Получить все элементы сабменю
 */
function getSubmenuItems() {
  return document.querySelectorAll(".header__menu-item--has-submenu");
}

/**
 * Проверка, является ли устройство мобильным
 */
function isMobile() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

/**
 * Показать сабменю
 */
function showSubmenu(item, submenu) {
  submenu.classList.add("is-active");
  item.classList.add("is-active");
}

/**
 * Скрыть сабменю
 */
function hideSubmenu(item, submenu, toggleButton = null) {
  submenu.classList.remove("is-active");
  item.classList.remove("is-active");
  if (toggleButton) {
    toggleButton.setAttribute("aria-expanded", "false");
  }
}

/**
 * Очистка обработчиков для элемента
 */
function cleanupItemHandlers(item) {
  const handlers = submenuHandlers.get(item);
  if (handlers) {
    const {
      itemEnterHandler,
      itemLeaveHandler,
      submenuEnterHandler,
      submenuLeaveHandler,
      keydownHandler,
    } = handlers;

    if (itemEnterHandler) {
      item.removeEventListener("mouseenter", itemEnterHandler);
    }
    if (itemLeaveHandler) {
      item.removeEventListener("mouseleave", itemLeaveHandler);
    }
    if (submenuEnterHandler && handlers.submenu) {
      handlers.submenu.removeEventListener("mouseenter", submenuEnterHandler);
    }
    if (submenuLeaveHandler && handlers.submenu) {
      handlers.submenu.removeEventListener("mouseleave", submenuLeaveHandler);
    }
    if (keydownHandler) {
      item.removeEventListener("keydown", keydownHandler);
    }

    submenuHandlers.delete(item);
  }

  // Удаляем флаг инициализации
  delete item.dataset.hoverSetup;
}

/**
 * Настройка hover эффектов для десктопа
 */
function setupDesktopHover() {
  const submenuItems = getSubmenuItems();

  if (isMobile()) {
    return;
  }

  submenuItems.forEach(item => {
    const submenu = item.querySelector(".header__submenu");

    if (!submenu) {
      return;
    }

    // Если обработчики уже установлены, сначала очищаем старые
    if (item.dataset.hoverSetup === "true") {
      cleanupItemHandlers(item);
    }

    // Помечаем, что обработчики установлены
    item.dataset.hoverSetup = "true";

    // Убираем активное состояние на десктопе при инициализации
    hideSubmenu(item, submenu);

    // Обработчик входа на пункт меню
    const itemEnterHandler = () => {
      showSubmenu(item, submenu);
    };

    // Обработчик выхода с пункта меню
    const itemLeaveHandler = e => {
      const relatedTarget = e.relatedTarget;

      // Если мышь переходит на сабменю или остается внутри элемента - не скрываем
      if (relatedTarget && (submenu.contains(relatedTarget) || item.contains(relatedTarget))) {
        return;
      }

      // Иначе скрываем сабменю
      hideSubmenu(item, submenu);
    };

    // Обработчик входа на сабменю
    const submenuEnterHandler = () => {
      showSubmenu(item, submenu);
    };

    // Обработчик выхода с сабменю
    const submenuLeaveHandler = e => {
      const relatedTarget = e.relatedTarget;

      // Если мышь переходит обратно на пункт меню или остается внутри сабменю - не скрываем
      if (relatedTarget && (item.contains(relatedTarget) || submenu.contains(relatedTarget))) {
        return;
      }

      // Иначе скрываем сабменю
      hideSubmenu(item, submenu);
    };

    // Обработчик клавиатуры для доступности
    const keydownHandler = e => {
      if (e.key === "Escape") {
        hideSubmenu(item, submenu);
        const link = item.querySelector(".header__menu-link");
        if (link) {
          link.focus();
        }
      }
    };

    // Сохраняем ссылки на обработчики для последующей очистки
    submenuHandlers.set(item, {
      submenu,
      itemEnterHandler,
      itemLeaveHandler,
      submenuEnterHandler,
      submenuLeaveHandler,
      keydownHandler,
    });

    // Добавляем обработчики событий
    item.addEventListener("mouseenter", itemEnterHandler);
    item.addEventListener("mouseleave", itemLeaveHandler);
    submenu.addEventListener("mouseenter", submenuEnterHandler);
    submenu.addEventListener("mouseleave", submenuLeaveHandler);
    item.addEventListener("keydown", keydownHandler);
  });
}

/**
 * Очистка всех hover обработчиков
 */
function cleanupDesktopHover() {
  const submenuItems = getSubmenuItems();

  submenuItems.forEach(item => {
    cleanupItemHandlers(item);
  });
}

/**
 * Обработка изменения размера окна с debounce
 */
const handleResize = debounce(() => {
  const isMobileDevice = isMobile();
  const submenuItems = getSubmenuItems();

  submenuItems.forEach(item => {
    const submenu = item.querySelector(".header__submenu");
    const toggleButton = item.querySelector(".header__menu-toggle");

    if (submenu && toggleButton) {
      if (isMobileDevice) {
        // На мобильных убираем активное состояние при изменении размера
        hideSubmenu(item, submenu, toggleButton);
        // Очищаем hover обработчики
        cleanupItemHandlers(item);
      } else {
        // На десктопе настраиваем hover эффекты
        setupDesktopHover();
      }
    }
  });
}, RESIZE_DEBOUNCE_DELAY);

/**
 * Инициализация подменю
 */
function initializeSubmenu() {
  const isMobileDevice = isMobile();
  const submenuItems = getSubmenuItems();

  if (isMobileDevice) {
    submenuItems.forEach(item => {
      const submenu = item.querySelector(".header__submenu");
      const toggleButton = item.querySelector(".header__menu-toggle");

      if (submenu && toggleButton) {
        hideSubmenu(item, submenu, toggleButton);
      }
    });
  } else {
    // На десктопе настраиваем hover эффекты
    setupDesktopHover();
  }
}

/**
 * Главная функция инициализации модуля
 */
export function initSubmenu() {
  const submenuItems = getSubmenuItems();

  // Обработка клика на кнопку переключения (мобильные устройства)
  submenuItems.forEach(item => {
    const toggleButton = item.querySelector(".header__menu-toggle");
    const submenu = item.querySelector(".header__submenu");

    if (toggleButton && submenu) {
      toggleButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Переключаем состояние подменю
        const isActive = submenu.classList.contains("is-active");

        if (isActive) {
          // Закрываем подменю
          hideSubmenu(item, submenu, toggleButton);
        } else {
          // Открываем подменю
          showSubmenu(item, submenu);
          toggleButton.setAttribute("aria-expanded", "true");
        }
      });
    }
  });

  // Обработка изменения размера окна
  window.addEventListener("resize", handleResize, { passive: true });

  // Инициализация при загрузке
  initializeSubmenu();

  // Очистка при выгрузке страницы
  window.addEventListener("beforeunload", () => {
    cleanupDesktopHover();
  });
}
