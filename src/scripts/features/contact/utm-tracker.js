// Сохраняет UTM-метки и реферер при первом заходе на страницу.
// Читает из URL один раз — при загрузке любой страницы где подключён этот модуль.
// Данные живут в sessionStorage до закрытия вкладки.

const UTM_KEY = "utm_data";

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

export function captureUtm() {
  // Если UTM уже сохранены в этой сессии — не перезаписываем.
  // Это важно: человек мог зайти с utm_source=yandex, потом кликнуть
  // по внутренней ссылке — не хотим потерять источник.
  if (sessionStorage.getItem(UTM_KEY)) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const data = {};

  UTM_PARAMS.forEach(key => {
    const value = params.get(key);
    if (value) {
      data[key] = value;
    }
  });

  // Реферер — откуда пришёл человек (например, google.com или vk.com).
  // Будет пустым при прямом заходе.
  data.referrer = document.referrer || "";

  sessionStorage.setItem(UTM_KEY, JSON.stringify(data));
}

// Возвращает сохранённые UTM-данные или пустой объект.
export function getUtmData() {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) || "{}");
  } catch {
    return {};
  }
}
