// Баннер с предложением заказать звонок (появляется при прокрутке 50% страницы)
(function () {
  let initialized = false;

  function safeLocalStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeLocalStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Если localStorage недоступен, баннер всё равно должен открываться по кнопке.
    }
  }

  function initCallBanner() {
    if (initialized) {
      return;
    }

    const banner = document.getElementById("call-banner");
    if (!banner) {
      return;
    }

    initialized = true;
    const closeBtn = document.getElementById("call-banner-close");

    function openBanner() {
      banner.inert = false;
      banner.removeAttribute("inert");
      banner.setAttribute("aria-hidden", "false");
      banner.classList.add("call-banner--visible");

      setTimeout(() => {
        closeBtn && closeBtn.focus();
      }, 100);
    }

    function closeBanner() {
      // inert снимает фокус автоматически без race condition с aria-hidden
      banner.inert = true;
      banner.setAttribute("inert", "");
      banner.classList.remove("call-banner--visible");
      banner.setAttribute("aria-hidden", "true");
      safeLocalStorageSet("call-banner-dismissed", "1");
    }

    // Экспортируем для form-handler.js и ручного открытия из других сценариев
    window.openCallBanner = openBanner;
    window.closeCallBanner = closeBanner;

    // Показываем баннер, когда пользователь прокрутил 50% страницы
    function handleScroll() {
      if (safeLocalStorageGet("call-banner-dismissed")) {
        window.removeEventListener("scroll", handleScroll);
        return;
      }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && window.scrollY / maxScroll >= 0.5) {
        openBanner();
        window.removeEventListener("scroll", handleScroll);
      }
    }

    // Если уже закрывали в этой сессии — не показываем автоматически, но кнопка работает.
    if (!safeLocalStorageGet("call-banner-dismissed")) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    document.addEventListener("click", function (e) {
      const trigger = e.target.closest?.("[data-call-banner-trigger]");
      if (!trigger) {
        return;
      }

      e.preventDefault();
      openBanner();
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", closeBanner);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && banner.classList.contains("call-banner--visible")) {
        closeBanner();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCallBanner, { once: true });
  } else {
    initCallBanner();
  }
})();
