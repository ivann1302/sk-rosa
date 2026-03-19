// Баннер с предложением заказать звонок (появляется через 10 секунд)
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

  setTimeout(openBanner, 10000);

  if (closeBtn) {
    closeBtn.addEventListener("click", closeBanner);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && banner.getAttribute("aria-hidden") === "false") {
      closeBanner();
    }
  });
});
