/**
 Модуль подменю "Другие услуги"
 Обрабатывает открытие/закрытие подменю на мобильных и hover на десктопе
 */
export function initSubmenu() {
  const submenuItems = document.querySelectorAll(".header__menu-item--has-submenu");

  submenuItems.forEach(item => {
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

        if (submenu && !item.dataset.hoverSetup) {
          // Помечаем, что обработчики уже установлены
          item.dataset.hoverSetup = "true";

          // Убираем активное состояние на десктопе
          submenu.classList.remove("is-active");
          item.classList.remove("is-active");

          let hideTimeout = null;

          // Функция для проверки, находится ли мышь в области элемента или сабменю
          const isMouseInArea = (x, y) => {
            const itemRect = item.getBoundingClientRect();
            const submenuRect = submenu.getBoundingClientRect();

            // Расширяем область проверки, включая промежуток между элементами
            const minX = Math.min(itemRect.left, submenuRect.left) - 10;
            const maxX = Math.max(itemRect.right, submenuRect.right) + 10;
            const minY = Math.min(itemRect.top, submenuRect.top) - 10;
            const maxY = Math.max(itemRect.bottom, submenuRect.bottom) + 10;

            return x >= minX && x <= maxX && y >= minY && y <= maxY;
          };

          // Функция для показа сабменю
          const showSubmenu = () => {
            // Отменяем таймер закрытия, если он был установлен
            if (hideTimeout) {
              clearTimeout(hideTimeout);
              hideTimeout = null;
            }
            submenu.classList.add("is-active");
          };

          // Функция для скрытия сабменю с задержкой
          const hideSubmenu = e => {
            // Отменяем предыдущий таймер, если он был
            if (hideTimeout) {
              clearTimeout(hideTimeout);
            }

            // Устанавливаем задержку перед закрытием
            hideTimeout = setTimeout(() => {
              // Проверяем позицию мыши перед закрытием
              if (e && e.clientX !== undefined && e.clientY !== undefined) {
                if (isMouseInArea(e.clientX, e.clientY)) {
                  // Мышь все еще в области - не закрываем
                  hideTimeout = null;
                  return;
                }
              }

              // Дополнительная проверка через :hover
              const isHovered = item.matches(":hover") || submenu.matches(":hover");
              if (!isHovered) {
                submenu.classList.remove("is-active");
              }
              hideTimeout = null;
            }, 300); // Увеличена задержка до 300ms
          };

          // Показываем сабменю при наведении на пункт меню
          item.addEventListener("mouseenter", showSubmenu);

          // Скрываем сабменю при уходе с пункта меню
          item.addEventListener("mouseleave", function (e) {
            // Проверяем, не переходим ли мы на сабменю
            const relatedTarget = e.relatedTarget;
            if (
              relatedTarget &&
              (submenu.contains(relatedTarget) || item.contains(relatedTarget))
            ) {
              // Мышь переходит на сабменю или остается в элементе - не закрываем
              return;
            }
            // Иначе закрываем с задержкой
            hideSubmenu(e);
          });

          // Показываем сабменю при наведении на само сабменю
          submenu.addEventListener("mouseenter", showSubmenu);

          // Скрываем сабменю при уходе с сабменю
          submenu.addEventListener("mouseleave", function (e) {
            // Проверяем, не переходим ли мы обратно на пункт меню
            const relatedTarget = e.relatedTarget;
            if (
              relatedTarget &&
              (item.contains(relatedTarget) || submenu.contains(relatedTarget))
            ) {
              // Мышь переходит обратно на пункт меню или остается в сабменю - не закрываем
              return;
            }
            // Иначе закрываем с задержкой
            hideSubmenu(e);
          });

          // Дополнительная проверка при движении мыши - если мышь в области, отменяем закрытие
          document.addEventListener("mousemove", function (e) {
            if (submenu.classList.contains("is-active") && hideTimeout) {
              if (isMouseInArea(e.clientX, e.clientY)) {
                // Мышь в области - отменяем закрытие
                clearTimeout(hideTimeout);
                hideTimeout = null;
              }
            }
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
