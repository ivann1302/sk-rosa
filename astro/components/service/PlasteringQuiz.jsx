import { useEffect, useMemo, useState } from "react";
import { trackFormSubmitAndRedirect } from "../../../src/scripts/features/contact/thank-you-redirect.js";
import { captureUtm, getUtmData } from "../../../src/scripts/features/contact/utm-tracker.js";

const ENDPOINT = "/scripts/api/send.php";

const questions = [
  {
    key: "area",
    title: "Какая площадь стен?",
    fieldName: "AREA_RANGE",
    options: ["До 100 м²", "До 200 м²", "Свыше 200 м²", "Нужен расчет"],
  },
  {
    key: "height",
    title: "Какая высота стен?",
    fieldName: "WALL_HEIGHT",
    options: ["До 3 м", "Свыше 3 м", "Не знаю"],
  },
  {
    key: "thickness",
    title: "Какая толщина штукатурки?",
    fieldName: "PLASTER_THICKNESS",
    options: ["30 мм", "Больше 30 мм", "Не знаю"],
  },
];

const contactMethods = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "max", label: "MAX" },
  { value: "phone", label: "Позвонить" },
];

const TOTAL_STEPS = questions.length + 1;

const initialAnswers = questions.reduce((answers, question) => {
  answers[question.key] = question.options[0];
  return answers;
}, {});

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

  const code = digits.slice(1, 4);
  const first = digits.slice(4, 7);
  const second = digits.slice(7, 9);
  const third = digits.slice(9, 11);
  const parts = ["+7"];

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

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, "");

  return digits.length === 11 && digits.startsWith("7");
}

export default function PlasteringQuiz({
  formSource = "Квиз по штукатурным работам",
  title = "Быстрый расчет штукатурных работ",
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState(initialAnswers);
  const [phone, setPhone] = useState("");
  const [contactMethod, setContactMethod] = useState(contactMethods[0].value);
  const [phoneError, setPhoneError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedContact = useMemo(
    () => contactMethods.find(method => method.value === contactMethod) ?? contactMethods[0],
    [contactMethod]
  );
  const activeQuestion = questions[currentStep - 1];
  const isContactStep = currentStep === TOTAL_STEPS;
  const progress = (currentStep / TOTAL_STEPS) * 100;

  useEffect(() => {
    captureUtm();
  }, []);

  function updateAnswer(questionKey, value) {
    setAnswers(currentAnswers => ({
      ...currentAnswers,
      [questionKey]: value,
    }));
  }

  function goNext() {
    setSubmitError("");
    setCurrentStep(step => Math.min(step + 1, TOTAL_STEPS));
  }

  function goBack() {
    setPhoneError("");
    setSubmitError("");
    setCurrentStep(step => Math.max(step - 1, 1));
  }

  function buildComments() {
    return [
      "Квиз по штукатурным работам:",
      `- Площадь стен: ${answers.area}`,
      `- Высота стен: ${answers.height}`,
      `- Толщина штукатурки: ${answers.thickness}`,
      `- Способ связи: ${selectedContact.label}`,
      `- Телефон: ${phone}`,
      "Клиент просит связаться и подготовить расчет.",
    ].join("\n");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!validatePhone(phone)) {
      setPhoneError("Укажите телефон в формате +7 (999) 123-45-67");
      return;
    }

    setPhoneError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("PHONE", phone);
    formData.append("CONTACT_METHOD", selectedContact.label);
    formData.append("CONTACT_VALUE", phone);
    formData.append("MESSENGER", selectedContact.label);
    formData.append("AREA_RANGE", answers.area);
    formData.append("WALL_HEIGHT", answers.height);
    formData.append("PLASTER_THICKNESS", answers.thickness);
    formData.append("COMMENTS", buildComments());
    formData.append("form_source", formSource);

    Object.entries(getUtmData()).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
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
    <section className="plastering-quiz reveal-on-scroll" id="plastering-quiz">
      <div className="plastering-quiz__container">
        <form
          className="plastering-quiz__form"
          method="POST"
          action={ENDPOINT}
          onSubmit={handleSubmit}
        >
          <input name="form_source" type="hidden" value={formSource} readOnly />
          <input name="COMMENTS" type="hidden" value={buildComments()} readOnly />
          {questions.map(question => (
            <input
              key={question.fieldName}
              name={question.fieldName}
              type="hidden"
              value={answers[question.key]}
              readOnly
            />
          ))}

          <div className="plastering-quiz__heading">
            <span className="plastering-quiz__eyebrow">Квиз</span>
            <h2>{title}</h2>
            <p>Ответьте на 4 вопроса, и мастер уточнит объем работ и ориентир по материалам.</p>
            <div className="plastering-quiz__step-meta">
              <span>
                Шаг {currentStep} из {TOTAL_STEPS}
              </span>
              <strong>{isContactStep ? "Контакты" : activeQuestion.title}</strong>
            </div>
            <div
              className="plastering-quiz__progress"
              aria-label={`Шаг ${currentStep} из ${TOTAL_STEPS}`}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="plastering-quiz__body">
            {!isContactStep && activeQuestion && (
              <fieldset className="plastering-quiz__question" key={activeQuestion.key}>
                <legend>{activeQuestion.title}</legend>
                <div className="plastering-quiz__options">
                  {activeQuestion.options.map(option => (
                    <label
                      className={
                        answers[activeQuestion.key] === option
                          ? "plastering-quiz__option is-selected"
                          : "plastering-quiz__option"
                      }
                      key={option}
                    >
                      <input
                        checked={answers[activeQuestion.key] === option}
                        name={activeQuestion.fieldName}
                        onChange={() => updateAnswer(activeQuestion.key, option)}
                        type="radio"
                        value={option}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {isContactStep && (
              <fieldset className="plastering-quiz__question plastering-quiz__question--contact">
                <legend>Как с вами связаться?</legend>
                <label className="plastering-quiz__phone-field">
                  <span>Номер телефона</span>
                  <input
                    aria-describedby={phoneError ? "plastering-quiz-phone-error" : undefined}
                    autoComplete="tel"
                    inputMode="tel"
                    name="PHONE"
                    onChange={event => {
                      setPhone(formatPhone(event.target.value));
                      setPhoneError("");
                    }}
                    placeholder="+7 (999) 123-45-67"
                    type="tel"
                    value={phone}
                  />
                </label>
                {phoneError && (
                  <em className="plastering-quiz__error" id="plastering-quiz-phone-error">
                    {phoneError}
                  </em>
                )}

                <div
                  aria-label="Выберите способ связи"
                  className="plastering-quiz__contact-methods"
                  role="radiogroup"
                >
                  {contactMethods.map(method => (
                    <label
                      className={
                        method.value === contactMethod
                          ? "plastering-quiz__contact-method is-selected"
                          : "plastering-quiz__contact-method"
                      }
                      key={method.value}
                    >
                      <input
                        checked={method.value === contactMethod}
                        name="CONTACT_METHOD"
                        onChange={() => setContactMethod(method.value)}
                        type="radio"
                        value={method.label}
                      />
                      <span>{method.label}</span>
                    </label>
                  ))}
                </div>

                {submitError && <div className="plastering-quiz__submit-error">{submitError}</div>}
              </fieldset>
            )}
          </div>

          <div className="plastering-quiz__nav">
            {currentStep > 1 && (
              <button className="plastering-quiz__back" type="button" onClick={goBack}>
                Назад
              </button>
            )}
            {isContactStep ? (
              <button className="plastering-quiz__submit" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Отправляем..." : "Получить расчет"}
              </button>
            ) : (
              <button className="plastering-quiz__submit" type="button" onClick={goNext}>
                Далее
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
