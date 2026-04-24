// Баннер с предложением заказать звонок (появляется при прокрутке 50% страницы)
document.addEventListener("DOMContentLoaded", function () {
  const banner = document.getElementById("call-banner");
  if (!banner) {
    return;
  }

  // Если уже закрывали в этой сессии — не показываем
  if (localStorage.getItem("call-banner-dismissed")) {
    return;
  }

  const closeBtn = document.getElementById("call-banner-close");

  function openBanner() {
    banner.inert = false;
    banner.removeAttribute("aria-hidden");
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

  // Экспортируем для form-handler.js
  window.closeCallBanner = closeBanner;

  // Показываем баннер, когда пользователь прокрутил 50% страницы
  function handleScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0 && window.scrollY / maxScroll >= 0.5) {
      openBanner();
      window.removeEventListener("scroll", handleScroll);
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeBanner);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && banner.getAttribute("aria-hidden") === "false") {
      closeBanner();
    }
  });
});
