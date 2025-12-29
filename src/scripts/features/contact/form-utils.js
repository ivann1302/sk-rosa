// Общие утилиты для работы с формами

/**
 * Определение режима разработки
 */
const isDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "" ||
  window.location.port === "3000" ||
  window.location.port === "4173";

/**
 * Мок-функция для симуляции отправки формы в режиме разработки
 * @param {string} action - URL для отправки формы
 * @param {FormData} formData - Данные формы
 * @returns {Promise<Object>} - Результат отправки
 */
async function mockSubmitForm(action, formData) {
  console.log("🧪 Тестовый режим: симулируем отправку формы");
  console.log("📋 Данные формы:", {
    NAME: formData.get("NAME"),
    PHONE: formData.get("PHONE"),
    COMMENTS: formData.get("COMMENTS"),
    form_source: formData.get("form_source"),
  });

  // Симулируем задержку сети (1-2 секунды)
  const delay = 1000 + Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Можно раскомментировать для тестирования ошибок:
  // if (Math.random() > 0.7) {
  //   throw new Error("HTTP error! status: 500");
  // }

  // Симулируем успешный ответ
  return {
    success: true,
    lead_id: Math.floor(Math.random() * 10000),
    message: "Заявка успешно отправлена (тестовый режим)",
  };
}

/**
 * Валидация данных формы
 * @param {FormData} formData - Данные формы
 * @returns {{valid: boolean, error?: string}} - Результат валидации
 */
export function validateForm(formData) {
  const name = formData.get("NAME");
  const phone = formData.get("PHONE");

  if (!name || !phone) {
    return { valid: false, error: "Пожалуйста, заполните обязательные поля" };
  }

  if (phone.replace(/\D/g, "").length < 10) {
    return { valid: false, error: "Пожалуйста, введите корректный номер телефона" };
  }

  return { valid: true };
}

/**
 * Получение CSRF токена с сервера
 * @param {string} actionPath - Путь к send.php из action формы (для определения относительного пути)
 * @returns {Promise<string>} - CSRF токен
 */
async function getCsrfToken(actionPath = "scripts/api/send.php") {
  try {
    // Определяем путь к get-csrf-token.php относительно пути к send.php
    // Если action = "../scripts/api/send.php", то токен = "../scripts/api/get-csrf-token.php"
    // Если action = "scripts/api/send.php", то токен = "scripts/api/get-csrf-token.php"
    const apiPath = actionPath.replace("send.php", "get-csrf-token.php");

    const response = await fetch(apiPath, {
      method: "GET",
      credentials: "same-origin", // Важно для работы с сессиями
    });

    if (!response.ok) {
      throw new Error(`Failed to get CSRF token: ${response.status}`);
    }

    const data = await response.json();
    if (!data.token) {
      throw new Error("CSRF token not found in response");
    }

    return data.token;
  } catch (error) {
    console.error("Ошибка получения CSRF токена:", error);
    // Всегда выбрасываем ошибку - токен обязателен для безопасности
    const errorMessage = isDevelopment
      ? "Не удалось получить CSRF токен. Убедитесь, что PHP сервер запущен и доступен."
      : "Не удалось получить CSRF токен. Пожалуйста, обновите страницу.";
    throw new Error(errorMessage);
  }
}

/**
 * Отправка формы на сервер с обработкой ошибок
 * @param {string} action - URL для отправки формы
 * @param {FormData} formData - Данные формы
 * @returns {Promise<Object>} - Результат отправки
 * @throws {Error} - Ошибка при отправке
 */
export async function submitForm(action, formData) {
  // Мок-режим для локального тестирования
  if (isDevelopment && action.includes("send.php")) {
    return await mockSubmitForm(action, formData);
  }

  // Получаем CSRF токен и добавляем в форму
  // Используем action для определения правильного пути к токену
  const csrfToken = await getCsrfToken(action);
  if (!csrfToken) {
    throw new Error("Не удалось получить CSRF токен");
  }
  formData.append("csrf_token", csrfToken);

  // Реальная отправка на сервер
  const response = await fetch(action, {
    method: "POST",
    body: formData,
    credentials: "same-origin", // Важно для работы с сессиями
  });

  // Проверяем, что ответ - JSON (даже для ошибок)
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  // Пытаемся распарсить JSON (даже для ошибок, чтобы получить сообщение)
  let jsonData = null;
  if (isJson) {
    try {
      jsonData = await response.json();
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        console.error("Сервер вернул невалидный JSON:", response);
        throw new Error("Ошибка формата ответа сервера");
      }
      throw parseError;
    }
  }

  // Если статус не OK, возвращаем ошибку с сообщением из JSON (если есть)
  if (!response.ok) {
    // Для rate limiting (429) и других ошибок возвращаем структуру с success: false
    if (jsonData && typeof jsonData === "object") {
      return jsonData; // Возвращаем объект с success: false и error
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Успешный ответ
  return jsonData;
}

/**
 * Управление состоянием кнопки отправки
 * @param {HTMLButtonElement|null} submitButton - Кнопка отправки
 * @param {boolean} isLoading - Состояние загрузки
 * @param {string} loadingText - Текст при загрузке
 */
export function setSubmitButtonState(submitButton, isLoading, loadingText = "Отправка...") {
  if (!submitButton) return;

  if (isLoading) {
    submitButton.disabled = true;
    submitButton.dataset.originalText = submitButton.textContent;
    submitButton.textContent = loadingText;
  } else {
    submitButton.disabled = false;
    submitButton.textContent = submitButton.dataset.originalText || submitButton.textContent;
  }
}
