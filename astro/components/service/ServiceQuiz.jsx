import { useEffect, useMemo, useState } from "react";
import { trackFormSubmitAndRedirect } from "../../../src/scripts/features/contact/thank-you-redirect.js";
import { captureUtm, getUtmData } from "../../../src/scripts/features/contact/utm-tracker.js";

const ENDPOINT = "/scripts/api/send.php";

const contactMethods = [
  { value: "whatsapp", label: "WhatsApp", input: "phone" },
  { value: "telegram", label: "Telegram", input: "telegram" },
  { value: "max", label: "MAX", input: "phone" },
  { value: "phone", label: "Позвонить", input: "phone" },
];

const defaultQuestions = [
  {
    key: "area",
    title: "Какая площадь работ?",
    fieldName: "AREA_RANGE",
    options: ["До 100 м²", "100-200 м²", "Больше 200 м²", "Нужен расчет"],
  },
];

function answersFromQuestions(questions) {
  return questions.reduce((answers, question) => {
    answers[question.key] = question.options[0] ?? "";
    return answers;
  }, {});
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

function normalizeTelegramUsername(value) {
  const username = value
    .trim()
    .replace(/^https?:\/\/t\.me\//i, "")
    .replace(/^@+/, "");

  return username ? `@${username.slice(0, 32)}` : "";
}

function isTelegramUsername(value) {
  return /^@?[a-zA-Z0-9_]{5,32}$/.test(value.trim().replace(/^@+/, ""));
}

function formatContactValue(value, contactMethod) {
  if (contactMethod.input === "telegram" && /[a-zA-Z_@]|t\.me/i.test(value.trim())) {
    return normalizeTelegramUsername(value);
  }

  return formatPhone(value);
}

function validateContact(value, contactMethod) {
  if (contactMethod.input === "telegram") {
    return validatePhone(value) || isTelegramUsername(value);
  }

  return validatePhone(value);
}

export default function ServiceQuiz({
  formSource = "Квиз-смета услуги",
  questions = defaultQuestions,
  serviceName = "услуге",
  title = "Предварительная смета за 1 минуту",
}) {
  const quizQuestions = questions.length ? questions : defaultQuestions;
  const totalSteps = quizQuestions.length + 1;
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState(() => answersFromQuestions(quizQuestions));
  const [contactValue, setContactValue] = useState("");
  const [contactMethod, setContactMethod] = useState(contactMethods[0].value);
  const [contactError, setContactError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedContact = useMemo(
    () => contactMethods.find(method => method.value === contactMethod) ?? contactMethods[0],
    [contactMethod]
  );
  const activeQuestion = quizQuestions[currentStep - 1];
  const isContactStep = currentStep === totalSteps;
  const progress = (currentStep / totalSteps) * 100;
  const phoneValue = validatePhone(contactValue) ? contactValue : "";

  useEffect(() => {
    captureUtm();
  }, []);

  function updateAnswer(questionKey, value) {
    setAnswers(currentAnswers => ({
      ...currentAnswers,
      [questionKey]: value,
    }));
  }

  function updateContactMethod(value) {
    const nextContact = contactMethods.find(method => method.value === value) ?? contactMethods[0];
    setContactMethod(value);
    setContactError("");
    setSubmitError("");
    setContactValue(currentValue => formatContactValue(currentValue, nextContact));
  }

  function goNext() {
    setSubmitError("");
    setCurrentStep(step => Math.min(step + 1, totalSteps));
  }

  function goBack() {
    setContactError("");
    setSubmitError("");
    setCurrentStep(step => Math.max(step - 1, 1));
  }

  function buildComments() {
    const answerLines = quizQuestions.map(
      question => `- ${question.title}: ${answers[question.key]}`
    );

    return [
      `Квиз по услуге: ${serviceName}`,
      ...answerLines,
      `- Способ связи: ${selectedContact.label}`,
      `- Контакт: ${contactValue}`,
      "Клиент просит связаться и подготовить расчет.",
    ].join("\n");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!validateContact(contactValue, selectedContact)) {
      setContactError(
        selectedContact.input === "telegram"
          ? "Укажите телефон или Telegram username, например @username"
          : "Укажите телефон в формате +7 (999) 123-45-67"
      );
      return;
    }

    setContactError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("PHONE", phoneValue);
    formData.append("CONTACT_METHOD", selectedContact.label);
    formData.append("CONTACT_VALUE", contactValue);
    formData.append("MESSENGER", selectedContact.label);
    quizQuestions.forEach(question => {
      formData.append(question.fieldName, answers[question.key]);
    });
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
    <section className="service-quiz reveal-on-scroll" id="service-quiz">
      <div className="service-quiz__container">
        <form
          className="service-quiz__form"
          method="POST"
          action={ENDPOINT}
          onSubmit={handleSubmit}
        >
          <input name="form_source" type="hidden" value={formSource} readOnly />
          <input name="COMMENTS" type="hidden" value={buildComments()} readOnly />
          <input name="CONTACT_VALUE" type="hidden" value={contactValue} readOnly />
          <input name="MESSENGER" type="hidden" value={selectedContact.label} readOnly />
          {quizQuestions.map(question => (
            <input
              key={question.fieldName}
              name={question.fieldName}
              type="hidden"
              value={answers[question.key]}
              readOnly
            />
          ))}

          <div className="service-quiz__heading">
            <span className="service-quiz__eyebrow">Квиз</span>
            <h2>{title}</h2>
            <p>Ответьте на 4 вопроса, и мастер уточнит объем работ и ориентир по материалам.</p>
            <div className="service-quiz__step-meta">
              <span>
                Шаг {currentStep} из {totalSteps}
              </span>
              <strong>{isContactStep ? "Контакты" : activeQuestion.title}</strong>
            </div>
            <div
              className="service-quiz__progress"
              aria-label={`Шаг ${currentStep} из ${totalSteps}`}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="service-quiz__body">
            {!isContactStep && activeQuestion && (
              <fieldset className="service-quiz__question" key={activeQuestion.key}>
                <legend>{activeQuestion.title}</legend>
                <div className="service-quiz__options">
                  {activeQuestion.options.map(option => (
                    <label
                      className={
                        answers[activeQuestion.key] === option
                          ? "service-quiz__option is-selected"
                          : "service-quiz__option"
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
              <fieldset className="service-quiz__question service-quiz__question--contact">
                <legend>Как с вами связаться?</legend>
                <label className="service-quiz__phone-field">
                  <span>
                    {selectedContact.input === "telegram"
                      ? "Телефон или Telegram"
                      : "Номер телефона"}
                  </span>
                  <input
                    aria-describedby={contactError ? "service-quiz-contact-error" : undefined}
                    autoComplete={selectedContact.input === "telegram" ? "off" : "tel"}
                    inputMode={selectedContact.input === "telegram" ? "text" : "tel"}
                    name={phoneValue ? "PHONE" : "CONTACT_VALUE"}
                    onChange={event => {
                      setContactValue(formatContactValue(event.target.value, selectedContact));
                      setContactError("");
                    }}
                    placeholder={
                      selectedContact.input === "telegram"
                        ? "+7 (999) 123-45-67 или @username"
                        : "+7 (999) 123-45-67"
                    }
                    type={selectedContact.input === "telegram" ? "text" : "tel"}
                    value={contactValue}
                  />
                </label>
                {contactError && (
                  <em className="service-quiz__error" id="service-quiz-contact-error">
                    {contactError}
                  </em>
                )}

                <div
                  aria-label="Выберите способ связи"
                  className="service-quiz__contact-methods"
                  role="radiogroup"
                >
                  {contactMethods.map(method => (
                    <label
                      className={
                        method.value === contactMethod
                          ? "service-quiz__contact-method is-selected"
                          : "service-quiz__contact-method"
                      }
                      key={method.value}
                    >
                      <input
                        checked={method.value === contactMethod}
                        name="CONTACT_METHOD"
                        onChange={() => updateContactMethod(method.value)}
                        type="radio"
                        value={method.label}
                      />
                      <span>{method.label}</span>
                    </label>
                  ))}
                </div>

                {submitError && <div className="service-quiz__submit-error">{submitError}</div>}
              </fieldset>
            )}
          </div>

          <div className="service-quiz__nav">
            {currentStep > 1 && (
              <button className="service-quiz__back" type="button" onClick={goBack}>
                Назад
              </button>
            )}
            {isContactStep ? (
              <button className="service-quiz__submit" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Отправляем..." : "Получить расчет"}
              </button>
            ) : (
              <button className="service-quiz__submit" type="button" onClick={goNext}>
                Далее
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
