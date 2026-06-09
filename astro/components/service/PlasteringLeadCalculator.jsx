import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { trackFormSubmitAndRedirect } from "../../../src/scripts/features/contact/thank-you-redirect.js";
import { captureUtm, getUtmData } from "../../../src/scripts/features/contact/utm-tracker.js";

const ENDPOINT = "/scripts/api/send.php";
const TOTAL_STEPS = 3;
const COMPANY_PHONE = "+79851354991";
const honeypotStyle = {
  position: "absolute",
  left: "-10000px",
  top: "auto",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none",
};

const materialOptions = [
  {
    value: "with",
    title: "С материалами",
  },
  {
    value: "without",
    title: "Без материалов",
  },
];

const contactMethods = [
  {
    value: "max",
    label: "MAX",
    inputLabel: "Телефон для MAX",
    placeholder: "+7 (999) 123-45-67",
    type: "phone",
  },
  {
    value: "telegram",
    label: "Telegram",
    inputLabel: "Ник или телефон",
    placeholder: "username или +7 (999) 123-45-67",
    type: "telegram",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    inputLabel: "Телефон для WhatsApp",
    placeholder: "+7 (999) 123-45-67",
    type: "phone",
  },
  {
    value: "phone",
    label: "Телефон",
    inputLabel: "Телефон",
    placeholder: "+7 (999) 123-45-67",
    type: "phone",
  },
  {
    value: "no-data",
    label: "Не хочу оставлять свои данные",
    type: "call",
  },
];

function toNumber(value) {
  const normalized = String(value)
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  return Number(normalized) || 0;
}

function formatMoney(value) {
  return Math.round(value).toLocaleString("ru-RU");
}

function formatPhone(value) {
  let digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }

  if (!digits.startsWith("7")) {
    digits = `7${digits}`;
  }

  digits = digits.slice(0, 11);
  const parts = ["+7"];
  const code = digits.slice(1, 4);
  const first = digits.slice(4, 7);
  const second = digits.slice(7, 9);
  const third = digits.slice(9, 11);

  if (code) {
    parts.push(` (${code}`);
  }
  if (code.length === 3) {
    parts[1] += ")";
  }
  if (first) {
    parts.push(` ${first}`);
  }
  if (second) {
    parts.push(`-${second}`);
  }
  if (third) {
    parts.push(`-${third}`);
  }

  return parts.join("");
}

function getRate(area, materialValue) {
  if (area >= 1000 && materialValue === "with") {
    return 750;
  }

  return materialValue === "with" ? 950 : 800;
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("7");
}

function normalizeTelegramUsername(value) {
  return value
    .trim()
    .replace(/^https?:\/\/t\.me\//i, "")
    .replace(/^t\.me\//i, "")
    .replace(/^@+/, "");
}

function isPhoneInput(value) {
  const trimmed = value.trim();
  return /\d/.test(trimmed) && /^[+\d\s().-]+$/.test(trimmed);
}

function isTelegramUsernameInput(value) {
  const trimmed = value.trim();
  return trimmed.length > 0 && !isPhoneInput(trimmed);
}

function validateTelegramContact(value) {
  const trimmed = value.trim();
  const username = normalizeTelegramUsername(trimmed);

  return validatePhone(trimmed) || /^[A-Za-z0-9_]{5,32}$/.test(username);
}

function formatTelegramContact(value) {
  const trimmedStart = value.trimStart();

  if (isTelegramUsernameInput(trimmedStart)) {
    return normalizeTelegramUsername(trimmedStart);
  }

  return formatPhone(value);
}

function StepHeader({ currentStep }) {
  const progress = (currentStep / TOTAL_STEPS) * 100;
  const labels = ["Площадь", "Материалы", "Контакты"];

  return (
    <div className="plaster-lead-calc__header">
      <div className="plaster-lead-calc__headline-row">
        <h2 className="plaster-lead-calc__title">Калькулятор штукатурки</h2>
        <span className="plaster-lead-calc__step-count">
          {currentStep}/{TOTAL_STEPS}
        </span>
      </div>
      <div
        className="plaster-lead-calc__progress"
        aria-label={`Шаг ${currentStep} из ${TOTAL_STEPS}`}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="plaster-lead-calc__steps" aria-hidden="true">
        {labels.map((label, index) => (
          <span
            className={
              index + 1 <= currentStep
                ? "plaster-lead-calc__step-label is-active"
                : "plaster-lead-calc__step-label"
            }
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ amount, area, rate, material, onLeadClick }) {
  return (
    <aside className="plaster-lead-calc__summary" aria-label="Предварительная стоимость">
      <span className="plaster-lead-calc__summary-label">Итого</span>
      <strong className="plaster-lead-calc__summary-price">≈ {formatMoney(amount)} ₽</strong>
      <div className="plaster-lead-calc__summary-meta">
        <span>{area || 0} м²</span>
        <span>{rate} ₽/м²</span>
        <span>{material.title.toLowerCase()}</span>
      </div>
      <motion.button
        className="plaster-lead-calc__summary-button"
        onClick={onLeadClick}
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        Получить точную смету
      </motion.button>
    </aside>
  );
}

export default function PlasteringLeadCalculator({ data, showEstimate = true }) {
  const shouldReduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(1);
  const [areaInput, setAreaInput] = useState("120");
  const [materialValue, setMaterialValue] = useState("with");
  const [contactMethod, setContactMethod] = useState("phone");
  const [contactValue, setContactValue] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);
  const contactRef = useRef(null);

  const area = toNumber(areaInput);
  const material =
    materialOptions.find(option => option.value === materialValue) ?? materialOptions[0];
  const contactOption =
    contactMethods.find(option => option.value === contactMethod) ?? contactMethods[3];
  const rate = showEstimate ? getRate(area, materialValue) : 0;
  const amount = showEstimate ? area * rate : 0;
  const formSource = data?.quizFormSource ?? "Калькулятор штукатурки";
  const rawContactValue = contactValue.trim();
  const preparedContactValue =
    contactOption.type === "telegram" && !validatePhone(rawContactValue)
      ? normalizeTelegramUsername(rawContactValue)
      : rawContactValue;
  const telegramUsername =
    contactOption.type === "telegram" ? normalizeTelegramUsername(contactValue) : "";
  const showTelegramHint =
    contactOption.type === "telegram" && isTelegramUsernameInput(contactValue);
  const telegramHint =
    telegramUsername.length < 5
      ? `Ник: ${telegramUsername.length}/32, минимум 5`
      : `Ник: ${telegramUsername.length}/32`;

  const stepVariants = useMemo(
    () => ({
      initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 },
      animate: { opacity: 1, x: 0 },
      exit: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 },
    }),
    [shouldReduceMotion]
  );

  useEffect(() => {
    captureUtm();
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (currentStep === TOTAL_STEPS && contactOption.type !== "call") {
      window.setTimeout(() => contactRef.current?.focus(), 180);
    }
  }, [contactOption.type, currentStep]);

  function validateArea() {
    if (!area || area < 1 || area > 10000) {
      setErrors(prev => ({ ...prev, area: "Укажите площадь от 1 до 10 000 м²" }));
      return false;
    }

    setErrors(prev => ({ ...prev, area: "" }));
    return true;
  }

  function goNext() {
    if (currentStep === 1 && !validateArea()) {
      return;
    }

    setErrors({});
    setCurrentStep(step => Math.min(step + 1, TOTAL_STEPS));
  }

  function goBack() {
    setErrors({});
    setCurrentStep(step => Math.max(step - 1, 1));
  }

  function requestEstimate() {
    if (!validateArea()) {
      setCurrentStep(1);
      return;
    }

    setErrors({});
    setCurrentStep(TOTAL_STEPS);
  }

  function callCompany() {
    if (typeof window !== "undefined") {
      window.location.href = `tel:${COMPANY_PHONE}`;
    }
  }

  function selectContactMethod(method) {
    setContactMethod(method);
    setContactValue("");
    setErrors(prev => ({ ...prev, contact: "" }));
    setSubmitError("");

    if (method === "no-data") {
      callCompany();
    }
  }

  function buildComments(contact = preparedContactValue) {
    const lines = [
      "Калькулятор штукатурки:",
      `- Площадь стен: ${area} м²`,
      `- Материалы: ${material.title}`,
      showEstimate ? `- Ставка: ${rate} ₽/м²` : "",
      showEstimate ? `- Предварительная стоимость: ${formatMoney(amount)} ₽` : "",
      contactOption.type !== "call"
        ? showEstimate
          ? `- Где получить расчет: ${contactOption.label}`
          : `- Где связаться: ${contactOption.label}`
        : "",
      contact
        ? showEstimate
          ? `- Контакт для расчета: ${contact}`
          : `- Контакт для связи: ${contact}`
        : "",
      area < 100 ? "- Предупреждение: площадь меньше минимального объема 100 м²" : "",
      showEstimate
        ? "Клиент просит точную смету."
        : "Клиент просит связаться и подготовить расчет.",
    ];

    return lines.filter(Boolean).join("\n");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (contactOption.type === "call") {
      callCompany();
      return;
    }

    const nextErrors = {};

    const contact = preparedContactValue;
    if (contactOption.type === "telegram") {
      if (!validateTelegramContact(rawContactValue)) {
        nextErrors.contact = "Ник: 5-32 символа, латиница, цифры или _";
      }
    } else if (!validatePhone(contact)) {
      nextErrors.contact = "Укажите телефон в формате +7 (999) 123-45-67";
    }

    if (!validateArea()) {
      nextErrors.area = "Укажите площадь от 1 до 10 000 м²";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const nativeFormData = new FormData(event.currentTarget);
    const formData = new FormData();
    formData.append("PHONE", validatePhone(contact) ? contact : "");
    formData.append("CONTACT_METHOD", contactOption.label);
    formData.append("CONTACT_VALUE", contact);
    formData.append("MESSENGER", contactOption.label);
    formData.append("AREA", String(area));
    formData.append("MATERIALS", material.title);
    if (showEstimate) {
      formData.append("PRICE_PER_M2", String(rate));
      formData.append("ESTIMATE", String(Math.round(amount)));
    }
    formData.append("COMMENTS", buildComments(contact));
    formData.append("form_source", formSource);
    formData.append("company_website", nativeFormData.get("company_website") ?? "");

    Object.entries(getUtmData()).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    setIsSubmitting(true);

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Ошибка при отправке. Попробуйте позже.");
      }

      trackFormSubmitAndRedirect();
    } catch (error) {
      setSubmitError(error.message || "Ошибка при отправке. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className={
        showEstimate
          ? "plaster-lead-calc reveal-on-scroll"
          : "plaster-lead-calc plaster-lead-calc--no-estimate reveal-on-scroll"
      }
      id="plastering-calculator"
    >
      <div className="plaster-lead-calc__shell">
        <form
          className="plaster-lead-calc__form"
          method="POST"
          action={ENDPOINT}
          onSubmit={handleSubmit}
        >
          <div aria-hidden="true" style={honeypotStyle}>
            <label>
              Сайт компании
              <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <input name="form_source" type="hidden" value={formSource} readOnly />
          <input name="COMMENTS" type="hidden" value={buildComments()} readOnly />
          <StepHeader currentStep={currentStep} />

          <div className="plaster-lead-calc__content">
            <div className="plaster-lead-calc__panel">
              <AnimatePresence initial={false} mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    animate="animate"
                    className="plaster-lead-calc__step"
                    exit="exit"
                    initial={hasHydrated ? "initial" : false}
                    key="step-area"
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    variants={stepVariants}
                  >
                    <h3>Какая площадь стен?</h3>
                    <label className="plaster-lead-calc__area-field">
                      <input
                        aria-describedby="area-warning area-error"
                        inputMode="decimal"
                        max="10000"
                        min="1"
                        name="AREA"
                        onChange={event => {
                          setAreaInput(event.target.value);
                          setErrors(prev => ({ ...prev, area: "" }));
                        }}
                        placeholder="120"
                        type="number"
                        value={areaInput}
                      />
                      <span>м²</span>
                    </label>
                    {area > 0 && area < 100 && (
                      <div className="plaster-lead-calc__warning" id="area-warning">
                        Минимальный объем работ - от 100 м²
                      </div>
                    )}
                    {errors.area && (
                      <div className="plaster-lead-calc__error" id="area-error">
                        {errors.area}
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    animate="animate"
                    className="plaster-lead-calc__step"
                    exit="exit"
                    initial={hasHydrated ? "initial" : false}
                    key="step-materials"
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    variants={stepVariants}
                  >
                    <h3>Материалы</h3>
                    <div className="plaster-lead-calc__material-switch">
                      {materialOptions.map(option => (
                        <motion.label
                          className={
                            option.value === materialValue
                              ? "plaster-lead-calc__material is-selected"
                              : "plaster-lead-calc__material"
                          }
                          key={option.value}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <input
                            checked={option.value === materialValue}
                            name="MATERIALS"
                            onChange={() => setMaterialValue(option.value)}
                            type="radio"
                            value={option.title}
                          />
                          <strong>{option.title}</strong>
                        </motion.label>
                      ))}
                    </div>
                    {showEstimate && area >= 1000 && materialValue === "with" && (
                      <div className="plaster-lead-calc__notice">
                        Для объема от 1000 м² применили специальную ставку 750 ₽/м².
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    animate="animate"
                    className="plaster-lead-calc__step"
                    exit="exit"
                    initial={hasHydrated ? "initial" : false}
                    key="step-contact"
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    variants={stepVariants}
                  >
                    <h3>{showEstimate ? "Куда отправить расчет?" : "Как с вами связаться?"}</h3>
                    <div
                      aria-label={showEstimate ? "Где получить расчет" : "Как с вами связаться"}
                      className="plaster-lead-calc__method-grid"
                      role="radiogroup"
                    >
                      {contactMethods.map(option => (
                        <motion.label
                          className={
                            option.value === contactMethod
                              ? "plaster-lead-calc__contact-method is-selected"
                              : "plaster-lead-calc__contact-method"
                          }
                          key={option.value}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <input
                            checked={option.value === contactMethod}
                            name="CONTACT_METHOD"
                            onChange={() => selectContactMethod(option.value)}
                            type="radio"
                            value={option.label}
                          />
                          <strong>{option.label}</strong>
                        </motion.label>
                      ))}
                    </div>
                    {contactOption.type !== "call" ? (
                      <label className="plaster-lead-calc__field plaster-lead-calc__field--contact">
                        <span>{contactOption.inputLabel}</span>
                        <input
                          autoComplete={contactOption.type === "telegram" ? "off" : "tel"}
                          name={contactOption.type === "telegram" ? "CONTACT_VALUE" : "PHONE"}
                          onChange={event => {
                            setContactValue(
                              contactOption.type === "telegram"
                                ? formatTelegramContact(event.target.value)
                                : formatPhone(event.target.value)
                            );
                            setErrors(prev => ({ ...prev, contact: "" }));
                          }}
                          placeholder={contactOption.placeholder}
                          ref={contactRef}
                          type={contactOption.type === "telegram" ? "text" : "tel"}
                          value={contactValue}
                        />
                        {showTelegramHint && (
                          <small
                            aria-live="polite"
                            className={
                              telegramUsername.length < 5
                                ? "plaster-lead-calc__telegram-hint is-short"
                                : "plaster-lead-calc__telegram-hint"
                            }
                          >
                            {telegramHint}
                          </small>
                        )}
                        {errors.contact && <em>{errors.contact}</em>}
                      </label>
                    ) : (
                      <div className="plaster-lead-calc__notice">
                        Сейчас откроется звонок на номер 8 (985) 135-49-91.
                      </div>
                    )}
                    {submitError && <div className="plaster-lead-calc__error">{submitError}</div>}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="plaster-lead-calc__nav">
                {currentStep > 1 && (
                  <button
                    className="plaster-lead-calc__secondary-button"
                    onClick={goBack}
                    type="button"
                  >
                    Назад
                  </button>
                )}
                {currentStep < TOTAL_STEPS ? (
                  <motion.button
                    className="plaster-lead-calc__primary-button"
                    onClick={goNext}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Продолжить
                  </motion.button>
                ) : (
                  <motion.button
                    className="plaster-lead-calc__primary-button"
                    disabled={isSubmitting}
                    type="submit"
                    whileHover={{ y: isSubmitting ? 0 : -2 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting
                      ? "Отправляем..."
                      : contactOption.type === "call"
                        ? "Позвонить в компанию"
                        : showEstimate
                          ? "Отправить расчет"
                          : "Отправить заявку"}
                  </motion.button>
                )}
              </div>
            </div>
            {showEstimate && (
              <SummaryCard
                amount={amount}
                area={area}
                material={material}
                onLeadClick={requestEstimate}
                rate={rate}
              />
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
