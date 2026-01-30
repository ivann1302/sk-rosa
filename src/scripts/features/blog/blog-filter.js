/**
 * Фильтрация статей блога по категориям
 * Принципы: KISS (простота), YAGNI (только необходимое)
 */

const blogFilter = {
  init() {
    const filterButtons = document.querySelectorAll('.blog-filter__button');
    const articles = document.querySelectorAll('.blog-card');

    if (!filterButtons.length || !articles.length) return;

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;

        // Обновляем активную кнопку
        filterButtons.forEach((btn) => btn.classList.remove('blog-filter__button--active'));
        button.classList.add('blog-filter__button--active');

        // Фильтруем статьи
        this.filterArticles(articles, category);
      });
    });
  },

  filterArticles(articles, category) {
    articles.forEach((article) => {
      if (category === 'all' || article.dataset.category === category) {
        article.style.display = '';
        // Плавное появление
        article.style.animation = 'fade-in 0.3s ease-in';
      } else {
        article.style.display = 'none';
      }
    });
  },
};

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => blogFilter.init());
} else {
  blogFilter.init();
}
