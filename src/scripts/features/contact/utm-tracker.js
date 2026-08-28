// Сохраняет UTM-метки и реферер при первом заходе на страницу.
// Читает из URL один раз — при загрузке любой страницы где подключён этот модуль.
// Данные живут в sessionStorage до закрытия вкладки.

const UTM_KEY = "utm_data";
const LEAD_SESSION_KEY = "lead_session_data";

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const CLICK_ID_PARAMS = ["yclid", "gclid"];

function getCurrentPage() {
  return window.location.pathname;
}

function captureLeadSession() {
  const currentPage = getCurrentPage();
  const now = Date.now();

  try {
    const stored = JSON.parse(sessionStorage.getItem(LEAD_SESSION_KEY) || "null");
    const data = stored || {
      started_at: now,
      landing_page: currentPage,
      page_count: 0,
      last_page: "",
    };

    if (data.last_page !== currentPage) {
      data.page_count += 1;
      data.last_page = currentPage;
    }

    sessionStorage.setItem(LEAD_SESSION_KEY, JSON.stringify(data));
  } catch {
    // Если sessionStorage недоступен, заявка всё равно должна отправиться.
  }
}

export function captureUtm() {
  captureLeadSession();

  // Если UTM уже сохранены в этой сессии — не перезаписываем.
  // Это важно: человек мог зайти с utm_source=yandex, потом кликнуть
  // по внутренней ссылке — не хотим потерять источник.
  try {
    if (sessionStorage.getItem(UTM_KEY)) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const data = {};

    [...UTM_PARAMS, ...CLICK_ID_PARAMS].forEach(key => {
      const value = params.get(key);
      if (value) {
        data[key] = value;
      }
    });

    // Реферер — откуда пришёл человек (например, google.com или vk.com).
    // Будет пустым при прямом заходе.
    data.referrer = document.referrer || "";

    sessionStorage.setItem(UTM_KEY, JSON.stringify(data));
  } catch {
    // Блокировка хранилища не должна мешать отправке формы.
  }
}

// Возвращает сохранённые UTM-данные или пустой объект.
export function getUtmData() {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) || "{}");
  } catch {
    return {};
  }
}

function getLeadSessionData() {
  try {
    return JSON.parse(sessionStorage.getItem(LEAD_SESSION_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function getBrowserName(userAgent) {
  const browsers = [
    [/YaBrowser\/(\d+)/, "Яндекс Браузер"],
    [/Edg\/(\d+)/, "Edge"],
    [/OPR\/(\d+)/, "Opera"],
    [/(?:Chrome|CriOS)\/(\d+)/, "Chrome"],
    [/(?:Firefox|FxiOS)\/(\d+)/, "Firefox"],
    [/Version\/(\d+).+Safari/, "Safari"],
  ];

  for (const [pattern, name] of browsers) {
    const match = userAgent.match(pattern);
    if (match) {
      return `${name} ${match[1]}`;
    }
  }

  return "Другой браузер";
}

function getOperatingSystem(userAgent) {
  if (/Android/i.test(userAgent)) {
    return "Android";
  }
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "iOS";
  }
  if (/Windows/i.test(userAgent)) {
    return "Windows";
  }
  if (/Macintosh|Mac OS X/i.test(userAgent)) {
    return "macOS";
  }
  if (/Linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Другая ОС";
}

function getDeviceType(userAgent) {
  if (/iPad|Tablet/i.test(userAgent)) {
    return "планшет";
  }
  if (/Android|iPhone|iPod|Mobile/i.test(userAgent)) {
    return "смартфон";
  }

  return "компьютер";
}

function getMetrikaClientId(timeoutMs = 500) {
  return new Promise(resolve => {
    if (typeof window.ym !== "function") {
      resolve("");
      return;
    }

    let completed = false;
    const finish = value => {
      if (completed) {
        return;
      }
      completed = true;
      clearTimeout(timer);
      resolve(String(value || ""));
    };
    const timer = setTimeout(() => finish(""), timeoutMs);

    try {
      window.ym(window.rosaMetrikaId || 109562461, "getClientID", finish);
    } catch {
      finish("");
    }
  });
}

function appendIfMissing(formData, key, value) {
  if (value !== "" && value !== null && value !== undefined && !formData.has(key)) {
    formData.append(key, String(value));
  }
}

export async function appendLeadContext(formData) {
  captureUtm();

  Object.entries(getUtmData()).forEach(([key, value]) => {
    appendIfMissing(formData, key, value);
  });

  const session = getLeadSessionData();
  const clientId = await getMetrikaClientId();
  const userAgent = navigator.userAgent || "";
  const startedAt = Number(session.started_at) || Date.now();
  const timeToLead = Math.max(0, Math.round((Date.now() - startedAt) / 1000));

  appendIfMissing(formData, "metrika_client_id", clientId);
  appendIfMissing(formData, "landing_page", session.landing_page || getCurrentPage());
  appendIfMissing(formData, "session_page_count", Number(session.page_count) || 1);
  appendIfMissing(formData, "time_to_lead_seconds", timeToLead);
  appendIfMissing(
    formData,
    "client_device",
    `${getDeviceType(userAgent)}, ${getBrowserName(userAgent)}, ${getOperatingSystem(userAgent)}`
  );
  appendIfMissing(formData, "client_screen", `${window.screen.width}x${window.screen.height}`);
  appendIfMissing(formData, "client_language", navigator.language || "");
  appendIfMissing(
    formData,
    "client_timezone",
    Intl.DateTimeFormat().resolvedOptions().timeZone || ""
  );
}
