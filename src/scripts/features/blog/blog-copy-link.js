/**
 * Функционал копирования ссылки на статью
 */
(function () {
  "use strict";

  function initCopyLink() {
    const copyButton = document.querySelector("[data-copy-link]");
    if (!copyButton) return;

    copyButton.addEventListener("click", async function () {
      try {
        // Получаем текущий URL страницы
        const url = window.location.href;

        // Используем современный Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          // Fallback для старых браузеров
          const textArea = document.createElement("textarea");
          textArea.value = url;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }

        // Показываем визуальную обратную связь
        const buttonText = copyButton.querySelector(".blog-article__share-button-text");
        const originalText = buttonText ? buttonText.textContent : "Скопировать ссылку";
        
        copyButton.classList.add("blog-article__share-button--copied");
        
        if (buttonText) {
          const savedText = buttonText.textContent;
          buttonText.textContent = "Скопировано!";
          
          // Возвращаем исходный текст через 2 секунды
          setTimeout(() => {
            copyButton.classList.remove("blog-article__share-button--copied");
            if (buttonText) {
              buttonText.textContent = originalText;
            }
          }, 2000);
        } else {
          setTimeout(() => {
            copyButton.classList.remove("blog-article__share-button--copied");
          }, 2000);
        }
      } catch (error) {
        console.error("Ошибка при копировании ссылки:", error);
        // Можно показать уведомление об ошибке
        alert("Не удалось скопировать ссылку. Попробуйте скопировать вручную из адресной строки.");
      }
    });
  }

  // Инициализация при загрузке DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCopyLink);
  } else {
    initCopyLink();
  }
})();
