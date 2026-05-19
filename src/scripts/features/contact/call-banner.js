// Баннер с предложением заказать звонок (появляется при прокрутке 50% страницы)
document.addEventListener("DOMContentLoaded", function () {
  const banner = document.getElementById("call-banner");
  if (!banner) {
    return;
  }

  const closeBtn = document.getElementById("call-banner-close");
  const triggers = document.querySelectorAll("[data-call-banner-trigger]");

  function openBanner() {
    banner.inert = false;
    banner.setAttribute("aria-hidden", "false");
    banner.classList.add("call-banner--visible");

    setTimeout(() => {
      closeBtn && closeBtn.focus();
    }, 100);
  }

  function closeBanner() {
    // inert снимает фокус автоматически без race condition с aria-hidden
    banner.inert = true;
    banner.classList.remove("call-banner--visible");
    banner.setAttribute("aria-hidden", "true");
    localStorage.setItem("call-banner-dismissed", "1");
  }

  // Экспортируем для form-handler.js и ручного открытия из других сценариев
  window.openCallBanner = openBanner;
  window.closeCallBanner = closeBanner;

  // Показываем баннер, когда пользователь прокрутил 50% страницы
  function handleScroll() {
    if (localStorage.getItem("call-banner-dismissed")) {
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
  if (!localStorage.getItem("call-banner-dismissed")) {
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  triggers.forEach(trigger => {
    trigger.addEventListener("click", openBanner);
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeBanner);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && banner.classList.contains("call-banner--visible")) {
      closeBanner();
    }
  });
});
