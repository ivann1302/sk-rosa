/**
 Модуль подменю "Другие услуги"
 Обрабатывает открытие/закрытие подменю на мобильных и hover на десктопе
 */
export function initSubmenu() {
  const submenuItems = document.querySelectorAll(".header__menu-item--has-submenu");

  submenuItems.forEach((item) => {
    const toggleButton = item.querySelector(".header__menu-toggle");
    const submenu = item.querySelector(".header__submenu");

    if (toggleButton && submenu) {
      // Обработка клика на кнопку переключения (мобильные устройства)
      toggleButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Переключаем состояние подменю
        const isActive = submenu.classList.contains("is-active");

        if (isActive) {
          // Закрываем подменю
          submenu.classList.remove("is-active");
          item.classList.remove("is-active");
          toggleButton.setAttribute("aria-expanded", "false");
        } else {
          // Открываем подменю
          submenu.classList.add("is-active");
          item.classList.add("is-active");
          toggleButton.setAttribute("aria-expanded", "true");
        }
      });
    }
  });

  // Обработка hover для десктопа
  function setupDesktopHover() {
    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
      submenuItems.forEach(item => {
        const submenu = item.querySelector(".header__submenu");

        if (submenu) {
          // Убираем активное состояние на десктопе
          submenu.classList.remove("is-active");
          item.classList.remove("is-active");

          // Добавляем hover эффекты
          item.addEventListener("mouseenter", function () {
            submenu.classList.add("is-active");
          });

          item.addEventListener("mouseleave", function () {
            submenu.classList.remove("is-active");
          });
        }
      });
    }
  }

  // Обработка изменения размера окна
  window.addEventListener("resize", function () {
    const isMobile = window.innerWidth <= 768;
    const submenuItems = document.querySelectorAll(".header__menu-item--has-submenu");

    submenuItems.forEach(item => {
      const submenu = item.querySelector(".header__submenu");
      const toggleButton = item.querySelector(".header__menu-toggle");

      if (submenu && toggleButton) {
        if (isMobile) {
          // На мобильных убираем активное состояние при изменении размера
          submenu.classList.remove("is-active");
          item.classList.remove("is-active");
          toggleButton.setAttribute("aria-expanded", "false");
        } else {
          // На десктопе настраиваем hover эффекты
          setupDesktopHover();
        }
      }
    });
  });

  // Инициализация: закрываем все подменю при загрузке на мобильных
  function initializeSubmenu() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const submenuItems = document.querySelectorAll(".header__menu-item--has-submenu");
      submenuItems.forEach(item => {
        const submenu = item.querySelector(".header__submenu");
        const toggleButton = item.querySelector(".header__menu-toggle");

        if (submenu && toggleButton) {
          submenu.classList.remove("is-active");
          item.classList.remove("is-active");
          toggleButton.setAttribute("aria-expanded", "false");
        }
      });
    } else {
      // На десктопе настраиваем hover эффекты
      setupDesktopHover();
    }
  }

  // Вызываем инициализацию после загрузки DOM
  initializeSubmenu();
}

