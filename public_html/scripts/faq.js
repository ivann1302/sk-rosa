// Аккордеон для FAQ
document.addEventListener('DOMContentLoaded', function() {
  const faqItems = document.querySelectorAll('.faq__item');
  
  faqItems.forEach(item => {
    item.addEventListener('click', function() {
      const isActive = this.classList.contains('active');
      
      // Закрываем все остальные элементы
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
      });
      
      // Открываем текущий элемент, если он был закрыт
      if (!isActive) {
        this.classList.add('active');
      }
    });
  });
}); 