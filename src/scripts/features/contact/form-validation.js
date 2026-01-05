/**
 * Валидация имени
 */
export function validateName(name) {
  const trimmed = (name || '').trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Имя обязательно для заполнения' };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Имя должно содержать минимум 2 символа' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'Имя слишком длинное (максимум 100 символов)' };
  }
  
  if (!/^[а-яА-ЯёЁa-zA-Z\s\-\.]+$/u.test(trimmed)) {
    return { valid: false, error: 'Имя содержит недопустимые символы' };
  }
  
  return { valid: true };
}

/**
 * Валидация телефона
 */
export function validatePhone(phone) {
  if (!phone) {
    return { valid: false, error: 'Телефон обязателен для заполнения' };
  }
  
  const phoneDigits = phone.replace(/\D/g, '');
  
  if (phoneDigits.length < 10) {
    return { valid: false, error: 'Некорректный формат телефона' };
  }
  
  if (phoneDigits.length > 15) {
    return { valid: false, error: 'Телефон слишком длинный' };
  }
  
  return { valid: true };
}

/**
 * Валидация комментария (опциональное поле)
 */
export function validateComment(comment) {
  if (!comment) {
    return { valid: true }; // Поле опциональное
  }
  
  const trimmed = comment.trim();
  
  if (trimmed.length > 2000) {
    return { valid: false, error: 'Комментарий слишком длинный (максимум 2000 символов)' };
  }
  
  return { valid: true };
}

/**
 * Валидация всей формы
 */
export function validateFormFields(formData) {
  const errors = {};
  
  const name = formData.get('NAME');
  const nameValidation = validateName(name);
  if (!nameValidation.valid) {
    errors.NAME = nameValidation.error;
  }
  
  const phone = formData.get('PHONE');
  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) {
    errors.PHONE = phoneValidation.error;
  }
  
  const comment = formData.get('COMMENTS');
  const commentValidation = validateComment(comment);
  if (!commentValidation.valid) {
    errors.COMMENTS = commentValidation.error;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Показ ошибки для поля
 */
export function showFieldError(field, errorMessage) {
  // Удаляем предыдущую ошибку
  hideFieldError(field);
  
  // Добавляем класс ошибки
  field.classList.add('field--error');
  
  // Создаем элемент с ошибкой
  const errorElement = document.createElement('span');
  errorElement.className = 'field-error';
  errorElement.textContent = errorMessage;
  errorElement.setAttribute('role', 'alert');
  errorElement.setAttribute('aria-live', 'polite');
  
  // Вставляем после поля или его label
  const fieldContainer = field.closest(
    '.contact-form__field, .calculator-request__field, .contact-request__field, .contact-request-turnkey__field, .about-turnkey-2__field, .price-calc__phone-input-container'
  );
  if (fieldContainer) {
    // Для price-calc__phone-input-container вставляем ошибку после контейнера (снизу)
    if (fieldContainer.classList.contains('price-calc__phone-input-container')) {
      fieldContainer.parentNode.insertBefore(errorElement, fieldContainer.nextSibling);
    } else {
      // Для остальных контейнеров вставляем внутрь
      fieldContainer.appendChild(errorElement);
    }
  } else {
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }
}

/**
 * Скрытие ошибки для поля
 */
export function hideFieldError(field) {
  field.classList.remove('field--error');
  
  const fieldContainer = field.closest(
    '.contact-form__field, .calculator-request__field, .contact-request__field, .contact-request-turnkey__field, .about-turnkey-2__field, .price-calc__phone-input-container'
  );
  
  let errorElement;
  // Для price-calc__phone-input-container ищем ошибку после контейнера
  if (fieldContainer?.classList.contains('price-calc__phone-input-container')) {
    // Ищем следующий элемент-брат с классом field-error
    let nextSibling = fieldContainer.nextElementSibling;
    errorElement = nextSibling?.classList?.contains('field-error') ? nextSibling : null;
  } else {
    errorElement = fieldContainer?.querySelector('.field-error') ||
                   field.parentNode?.querySelector('.field-error');
  }
  
  if (errorElement) {
    errorElement.remove();
  }
}

/**
 * Валидация поля в реальном времени
 */
export function setupFieldValidation(field, validator) {
  let timeoutId;
  
  // Управление placeholder при фокусе
  if (field.placeholder) {
    field.addEventListener('focus', () => {
      field.dataset.originalPlaceholder = field.placeholder;
      field.placeholder = '';
    });
    
    field.addEventListener('blur', () => {
      if (field.value === '' && field.dataset.originalPlaceholder) {
        field.placeholder = field.dataset.originalPlaceholder;
      }
    });
  }
  
  // Валидация при потере фокуса
  field.addEventListener('blur', () => {
    const value = field.value;
    const result = validator(value);
    
    if (!result.valid) {
      showFieldError(field, result.error);
    } else {
      hideFieldError(field);
    }
  });
  
  // Валидация при вводе (с задержкой)
  field.addEventListener('input', () => {
    clearTimeout(timeoutId);
    
    // Убираем ошибку сразу при начале ввода
    if (field.classList.contains('field--error')) {
      hideFieldError(field);
    }
    
    // Валидируем через 500ms после остановки ввода
    timeoutId = setTimeout(() => {
      const value = field.value;
      const result = validator(value);
      
      if (!result.valid && value.length > 0) {
        showFieldError(field, result.error);
      }
    }, 500);
  });
}

/**
 * Применение маски телефона
 */
export function applyPhoneMask(input) {
  if (input.dataset.maskApplied) return;
  
  // Управление placeholder при фокусе
  if (input.placeholder) {
    input.addEventListener('focus', () => {
      input.dataset.originalPlaceholder = input.placeholder;
      input.placeholder = '';
    });
    
    input.addEventListener('blur', () => {
      if (input.value === '' && input.dataset.originalPlaceholder) {
        input.placeholder = input.dataset.originalPlaceholder;
      }
    });
  }
  
  input.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");

    // Если поле пустое, оставляем пустым
    if (value.length === 0) {
      e.target.value = "";
      return;
    }

    // Если первая цифра не 7, заменяем на 7
    if (value[0] !== "7") {
      value = "7" + value;
    }

    // Форматируем в зависимости от длины
    if (value.length === 1) {
      // Только одна семерка - показываем "+7"
      value = "+7";
    } else if (value.length <= 4) {
      // От 2 до 4 цифр: "+7 (XXX"
      value = "+7 (" + value.substring(1, 4);
    } else if (value.length <= 7) {
      // От 5 до 7 цифр: "+7 (XXX) YYY"
      value = "+7 (" + value.substring(1, 4) + ") " + value.substring(4, 7);
    } else if (value.length <= 9) {
      // От 8 до 9 цифр: "+7 (XXX) YYY-ZZ"
      value = "+7 (" + value.substring(1, 4) + ") " + value.substring(4, 7) + "-" + value.substring(7, 9);
    } else {
      // 10+ цифр: "+7 (XXX) YYY-ZZ-AA"
      value = "+7 (" + value.substring(1, 4) + ") " + value.substring(4, 7) + "-" + value.substring(7, 9) + "-" + value.substring(9, 11);
    }

    e.target.value = value;
  });
  
  input.dataset.maskApplied = 'true';
}

