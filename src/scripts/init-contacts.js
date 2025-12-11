/**
 * Инициализация контактных данных из констант
 * Автоматически обновляет все ссылки на телефон и email в DOM
 */
(function() {
  'use strict';

  // Ждем загрузки констант
  function initContacts() {
    if (!window.CONFIG) {
      console.warn('CONFIG не загружен, повторная попытка через 100ms');
      setTimeout(initContacts, 100);
      return;
    }

    const config = window.CONFIG.contact;
    const phone = config.phone;
    const phoneClean = config.phoneClean;
    const email = config.email;
    const whatsappUrl = config.whatsappUrl;

    // Обновляем все ссылки на телефон
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      link.href = `tel:${phoneClean}`;
      if (!link.textContent.trim() || link.textContent.includes('+7') || link.textContent.includes('985')) {
        link.textContent = phone;
      }
    });

    // Обновляем все ссылки на WhatsApp
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('wa.me')) {
        // Сохраняем параметр text если есть
        const url = new URL(href);
        const text = url.searchParams.get('text');
        link.href = text ? config.whatsappUrlWithText(text) : whatsappUrl;
      }
    });

    // Обновляем все текстовые упоминания телефона
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length === 0) { // Только листовые элементы
        const text = el.textContent;
        if (text && (text.includes('+7 (985)') || text.includes('79851354991'))) {
          el.textContent = text.replace(/\+7\s?\(985\)\s?135[\s-]?49[\s-]?91/g, phone)
                               .replace(/79851354991/g, phoneClean);
        }
      }
    });

    // Обновляем все email ссылки и тексты
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      link.href = `mailto:${email}`;
      if (!link.textContent.trim() || link.textContent.includes('@')) {
        link.textContent = email;
      }
    });

    // Обновляем текстовые упоминания email
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length === 0) {
        const text = el.textContent;
        if (text && text.includes('ooo.rosa2019@yandex.ru')) {
          el.textContent = text.replace(/ooo\.rosa2019@yandex\.ru/g, email);
        }
      }
    });
  }

  // Запускаем после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContacts);
  } else {
    initContacts();
  }
})();

