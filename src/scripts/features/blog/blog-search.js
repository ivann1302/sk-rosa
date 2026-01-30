/**
 * Поиск по статьям блога
 * Принципы: KISS (простота), YAGNI (только необходимое)
 *
 * Функционал:
 * - Поиск по заголовкам и описаниям статей
 * - Работа вместе с фильтром по категориям
 * - Подсветка "ничего не найдено"
 */

const blogSearch = {
  searchInput: null,
  searchForm: null,
  clearButton: null,
  articles: null,
  activeCategory: 'all',

  init() {
    this.searchInput = document.querySelector('.blog-search__input');
    this.searchForm = document.querySelector('.blog-search');
    this.clearButton = document.querySelector('.blog-search__clear');
    this.articles = document.querySelectorAll('.blog-card');

    if (!this.searchInput || !this.articles.length) return;

    this.attachEvents();
  },

  attachEvents() {
    // Предотвращаем отправку формы
    this.searchForm?.addEventListener('submit', (e) => {
      e.preventDefault();
    });

    // Поиск при вводе текста
    this.searchInput.addEventListener('input', (e) => {
      this.toggleClearButton(e.target.value);
      this.performSearch(e.target.value);
    });

    // Сброс поиска
    this.clearButton?.addEventListener('click', () => {
      this.clearSearch();
    });

    // Отслеживаем изменения активной категории от фильтра
    this.watchCategoryChanges();
  },

  toggleClearButton(value) {
    if (!this.clearButton) return;

    if (value.trim()) {
      this.clearButton.classList.add('active');
    } else {
      this.clearButton.classList.remove('active');
    }
  },

  clearSearch() {
    this.searchInput.value = '';
    this.toggleClearButton('');
    this.performSearch('');
    this.searchInput.focus();
  },

  performSearch(query) {
    const searchTerm = query.toLowerCase().trim();
    let visibleCount = 0;

    this.articles.forEach((article) => {
      const title = article.querySelector('.blog-card__title')?.textContent.toLowerCase() || '';
      const excerpt = article.querySelector('.blog-card__excerpt')?.textContent.toLowerCase() || '';
      const category = article.dataset.category || '';

      // Проверяем совпадение с поисковым запросом
      const matchesSearch = !searchTerm || title.includes(searchTerm) || excerpt.includes(searchTerm);

      // Проверяем совпадение с активной категорией
      const matchesCategory = this.activeCategory === 'all' || category === this.activeCategory;

      // Показываем статью только если она соответствует И поиску И категории
      if (matchesSearch && matchesCategory) {
        article.style.display = '';
        article.style.animation = 'fade-in 0.3s ease-in';
        visibleCount++;
      } else {
        article.style.display = 'none';
      }
    });

    // Показываем сообщение если ничего не найдено
    this.toggleNoResults(visibleCount === 0);
  },

  watchCategoryChanges() {
    // Отслеживаем клики по кнопкам фильтра
    const filterButtons = document.querySelectorAll('.blog-filter__button');

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.activeCategory = button.dataset.category;
        // Применяем текущий поисковый запрос с новой категорией
        this.performSearch(this.searchInput.value);
      });
    });
  },

  toggleNoResults(show) {
    let noResultsEl = document.querySelector('.blog-search__no-results');

    if (show && !noResultsEl) {
      // Создаем элемент "ничего не найдено"
      noResultsEl = document.createElement('div');
      noResultsEl.className = 'blog-search__no-results';
      noResultsEl.textContent = 'По вашему запросу ничего не найдено. Попробуйте изменить поисковый запрос.';

      const blogGrid = document.querySelector('.blog-grid');
      blogGrid?.insertAdjacentElement('afterend', noResultsEl);
    } else if (!show && noResultsEl) {
      // Удаляем элемент
      noResultsEl.remove();
    }
  },
};

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => blogSearch.init());
} else {
  blogSearch.init();
}
