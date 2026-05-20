export const THANK_YOU_URL = "/thank-you";

export function trackFormSubmitAndRedirect() {
  if (typeof window === "undefined") {
    return;
  }

  let redirected = false;
  const redirect = () => {
    if (redirected) {
      return;
    }

    redirected = true;
    window.location.assign(THANK_YOU_URL);
  };

  if (typeof window.ym === "function") {
    try {
      window.ym(window.rosaMetrikaId || 107041182, "reachGoal", "form_submit", {}, redirect);
      window.setTimeout(redirect, 600);
      return;
    } catch (error) {
      console.warn("Не удалось отправить цель Метрики перед переходом:", error);
    }
  }

  redirect();
}
