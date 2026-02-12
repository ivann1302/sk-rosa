/**
 Модуль мобильного меню
 Обрабатывает открытие/закрытие бургер-меню и мобильных контактов
 */
export function initMobileMenu() {
  const burgerButton = document.querySelector("[data-js-header-burger-button]");
  const headerMenu = document.querySelector(".header__menu");
  const mobileContacts = document.querySelector("[data-js-mobile-contacts]");
  const header = document.querySelector("[data-js-header]");

  if (!burgerButton || !headerMenu || !mobileContacts || !header) {
    return;
  }

  burgerButton.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const isActive = headerMenu.classList.contains("is-active");

    if (isActive) {
      // Закрываем обе плашки
      headerMenu.classList.remove("is-active");
      mobileContacts.classList.remove("is-active");
      burgerButton.classList.remove("is-active");
      document.body.style.overflow = "";
    } else {
      // Открываем обе плашки
      headerMenu.classList.add("is-active");
      mobileContacts.classList.add("is-active");
      burgerButton.classList.add("is-active");
      document.body.style.overflow = "hidden";
    }
  });

  // Закрываем меню при клике на ссылку (кроме "Наши услуги")
  const menuLinks = headerMenu.querySelectorAll("a");
  menuLinks.forEach(link => {
    link.addEventListener("click", function (_e) {
      // Проверяем, не является ли это ссылкой "Наши услуги"
      const isSubmenuLink =
        link.closest(".header__menu-item--has-submenu") &&
        link.getAttribute("href") === "#services";

      if (!isSubmenuLink) {
        headerMenu.classList.remove("is-active");
        mobileContacts.classList.remove("is-active");
        burgerButton.classList.remove("is-active");
        document.body.style.overflow = "";
      }
    });
  });

  // Закрываем меню при клике вне его
  document.addEventListener("click", function (event) {
    if (!header.contains(event.target)) {
      headerMenu.classList.remove("is-active");
      mobileContacts.classList.remove("is-active");
      burgerButton.classList.remove("is-active");
      document.body.style.overflow = "";
    }
  });
}
