class CustomSelect {
  constructor(element) {
    this.container = element;
    this.button = element.querySelector(".custom-select__button");
    this.dropdown = element.querySelector(".custom-select__dropdown");
    this.options = element.querySelectorAll(".custom-select__option");
    this.hiddenInput = element.querySelector('input[type="hidden"]');
    this.textSpan = element.querySelector(".custom-select__text");
    this.filterType = element.dataset.filter;

    this.isOpen = false;
    this.selectedValue = "";
    this.selectedText = this.textSpan.textContent;

    // Привязываем обработчики к экземпляру
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleEscape = this.handleEscape.bind(this);

    this.init();
  }

  init() {
    // Обработчик клика на кнопку
    this.button.addEventListener("click", e => {
      e.stopPropagation();
      this.toggle();
    });

    // Обработчики для опций
    this.options.forEach(option => {
      option.addEventListener("click", e => {
        e.stopPropagation();
        this.selectOption(option);
      });

      // Поддержка клавиатуры для опций
      option.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.selectOption(option);
        }
      });
    });

    // Навигация клавиатурой
    this.button.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggle();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.open();
        this.focusOption(0);
      }
    });

    this.dropdown.addEventListener("keydown", e => {
      const currentIndex = Array.from(this.options).findIndex(
        opt => opt === document.activeElement
      );

      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.focusOption(currentIndex + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.focusOption(currentIndex - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (document.activeElement.classList.contains("custom-select__option")) {
          this.selectOption(document.activeElement);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.close();
        this.button.focus();
      }
    });
  }

  handleDocumentClick(e) {
    if (!this.container.contains(e.target)) {
      this.close();
    }
  }

  handleEscape(e) {
    if (e.key === "Escape" && this.isOpen) {
      this.close();
      this.button.focus();
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.button.setAttribute("aria-expanded", "true");
    this.dropdown.setAttribute("aria-hidden", "false");

    // Добавляем обработчики только при открытии
    setTimeout(() => {
      document.addEventListener("click", this.handleDocumentClick);
      document.addEventListener("keydown", this.handleEscape);
    }, 0);
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.button.setAttribute("aria-expanded", "false");
    this.dropdown.setAttribute("aria-hidden", "true");

    // Удаляем обработчики при закрытии
    document.removeEventListener("click", this.handleDocumentClick);
    document.removeEventListener("keydown", this.handleEscape);
  }

  selectOption(option) {
    // Убираем выделение с предыдущей опции
    this.options.forEach(opt => {
      opt.classList.remove("custom-select__option--selected");
      opt.setAttribute("aria-selected", "false");
    });

    // Выделяем выбранную опцию
    option.classList.add("custom-select__option--selected");
    option.setAttribute("aria-selected", "true");

    // Обновляем значения
    this.selectedValue = option.dataset.value;
    this.selectedText = option.textContent.trim();
    this.hiddenInput.value = this.selectedValue;
    this.textSpan.textContent = this.selectedText;

    // Вызываем событие change для совместимости
    this.container.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          value: this.selectedValue,
          text: this.selectedText,
          filter: this.filterType,
        },
        bubbles: true,
      })
    );

    this.close();
  }

  focusOption(index) {
    const optionsArray = Array.from(this.options);
    const maxIndex = optionsArray.length - 1;
    const minIndex = 0;

    if (index < minIndex) index = maxIndex;
    if (index > maxIndex) index = minIndex;

    optionsArray[index].focus();
  }

  getValue() {
    return this.selectedValue;
  }

  setValue(value) {
    const option = Array.from(this.options).find(opt => opt.dataset.value === value);
    if (option) {
      this.selectOption(option);
    }
  }
}

// Функция инициализации
export function initCustomSelects() {
  const customSelects = document.querySelectorAll(".custom-select");
  customSelects.forEach(select => {
    new CustomSelect(select);
  });
}

// Автоматическая инициализация при загрузке DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCustomSelects);
} else {
  initCustomSelects();
}

export default CustomSelect;
