import { beforeEach, describe, expect, it } from "vitest";
import { appendLeadContext, captureUtm } from "../src/scripts/features/contact/utm-tracker.js";

function createSessionStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

describe("контекст Telegram-заявки", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: createSessionStorage(),
    });
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        language: "ru-RU",
        userAgent:
          "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36",
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { referrer: "https://yandex.ru/search/" },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: {
          pathname: "/start",
          search: "?utm_source=yandex&utm_content=banner&yclid=click-123",
        },
        rosaMetrikaId: 109562461,
        screen: { width: 390, height: 844 },
        ym(_counterId, method, callback) {
          if (method === "getClientID") {
            callback("1234567890123456789");
          }
        },
      },
    });
  });

  it("передаёт атрибуцию, ClientID и данные сессии", async () => {
    captureUtm();
    window.location.pathname = "/calculator";
    window.location.search = "";
    captureUtm();

    const formData = new FormData();
    await appendLeadContext(formData);

    expect(formData.get("utm_source")).toBe("yandex");
    expect(formData.get("utm_content")).toBe("banner");
    expect(formData.get("yclid")).toBe("click-123");
    expect(formData.get("metrika_client_id")).toBe("1234567890123456789");
    expect(formData.get("landing_page")).toBe("/start");
    expect(formData.get("session_page_count")).toBe("2");
    expect(formData.get("client_device")).toBe("смартфон, Chrome 140, Android");
    expect(formData.get("client_screen")).toBe("390x844");
    expect(formData.get("client_language")).toBe("ru-RU");
  });
});
