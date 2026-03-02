// Общие утилиты для работы с формами
import { validateFormFields } from './form-validation.js';

const isDevelopment = window.location.port === "3000";

console.warn("[form-utils] загружен. port=" + window.location.port + " isDevelopment=" + isDevelopment);

async function mockSubmitForm(action, _formData) {
  console.warn("🧪 [form-utils] МОК режим — реальной отправки нет");
  const delay = 1000 + Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  return {
    success: true,
    message: "Заявка успешно отправлена (тестовый режим)",
  };
}

export function validateForm(formData) {
  const validation = validateFormFields(formData);
  if (!validation.valid) {
    const firstError = Object.values(validation.errors)[0];
    return { valid: false, error: firstError, errors: validation.errors };
  }
  return { valid: true, errors: {} };
}

export async function submitForm(action, formData) {
  console.warn("[form-utils] submitForm вызван. action=" + action + " isDevelopment=" + isDevelopment);

  if (isDevelopment && action.includes("send.php")) {
    console.warn("[form-utils] → МОК (dev порт 3000)");
    return await mockSubmitForm(action, formData);
  }

  console.warn("[form-utils] → Реальный fetch POST на: " + action);
  try {
    const response = await fetch(action, {
      method: "POST",
      body: formData,
    });

    console.warn("[form-utils] Ответ сервера: HTTP " + response.status);

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    let jsonData = null;
    if (isJson) {
      try {
        jsonData = await response.json();
        console.warn("[form-utils] JSON ответ:", jsonData);
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          console.error("[form-utils] Невалидный JSON от сервера");
          throw new Error("Ошибка формата ответа сервера");
        }
        throw parseError;
      }
    } else {
      console.error("[form-utils] Ответ не JSON, content-type:", contentType);
    }

    if (!response.ok) {
      if (jsonData && typeof jsonData === "object") {
        return jsonData;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return jsonData;
  } catch (fetchError) {
    console.error("[form-utils] fetch ОШИБКА:", fetchError);
    throw fetchError;
  }
}

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
