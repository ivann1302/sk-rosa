document.addEventListener('DOMContentLoaded', function() {
  // Данные проектов
  const projects = [
          {
        location: 'г. Москва, ЖК "Московский"',
        title: 'Дизайн-проект однокомнатной квартиры',
        area: '32.12м²',
        price: '885 443 ₽',
        description: 'Модернизм выделяется утончённым дизайном и оригинальной архитектурой. Гармония базовых тонов с яркими акцентами подчёркивает стиль, а удобная мебель делает пространство комфортным для жизни.',
        image: '../images/portfolio/10.png'
      },
      {
        location: 'г. Москва, ЖК "Покровский"',
        title: 'Дизайн-проект двухкомнатной квартиры',
        area: '58.7м²',
        price: '1 245 800 ₽',
        description: 'Современный минимализм с акцентом на функциональность. Светлые тона создают ощущение простора, а продуманная планировка максимально использует каждый квадратный метр.',
        image: '../images/portfolio/3.png'
      },
      {
        location: 'г. Москва, ЖК "Сколково"',
        title: 'Дизайн-проект трехкомнатной квартиры',
        area: '89.3м²',
        price: '2 156 900 ₽',
        description: 'Классический стиль с современными элементами. Элегантная отделка, качественные материалы и внимание к деталям создают роскошный интерьер для комфортной жизни и приема гостей.',
        image: '../images/portfolio/16.png'
      },
      {
        location: 'г. Москва, ЖК "Митино"',
        title: 'Дизайн-проект однокомнатной квартиры-студии',
        area: '28.5м²',
        price: '756 300 ₽',
        description: 'Компактная студия с продуманным дизайном. Многофункциональная мебель и светлые тона создают уютное пространство для одного человека или пары, с продуманной системой хранения.',
        image: '../images/portfolio/18.png'
      },
      {
        location: 'г. Москва, ЖК "Бутово"',
        title: 'Дизайн-проект четырехкомнатной квартиры',
        area: '124.8м²',
        price: '3 245 600 ₽',
        description: 'Просторная квартира в стиле лофт. Индустриальные элементы сочетаются с современной мебелью, создавая уникальный интерьер для большой семьи с зоной отдыха и рабочей зоной.',
        image: '../images/portfolio/5.png'
      }
  ];

  let currentProjectIndex = 0;
  const totalProjects = projects.length;

  // Элементы для обновления
  const projectLocation = document.getElementById('project-location');
  const projectTitle = document.getElementById('project-title');
  const projectArea = document.getElementById('project-area');
  const projectPrice = document.getElementById('project-price');
  const projectDescription = document.getElementById('project-description');
  const projectImage = document.getElementById('project-image');
  const projectCounter = document.getElementById('project-counter');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  // Функция обновления проекта
  function updateProject(index) {
    const project = projects[index];
    
    // Плавное исчезновение
    projectLocation.style.opacity = '0';
    projectTitle.style.opacity = '0';
    projectArea.style.opacity = '0';
    projectPrice.style.opacity = '0';
    projectDescription.style.opacity = '0';
    projectImage.style.opacity = '0';

    setTimeout(() => {
      // Обновление контента
      projectLocation.textContent = project.location;
      projectTitle.textContent = project.title;
      projectArea.textContent = project.area;
      projectPrice.textContent = project.price;
      projectDescription.textContent = project.description;
      projectImage.src = project.image;
      projectCounter.textContent = `${index + 1} / ${totalProjects}`;

      // Плавное появление
      projectLocation.style.opacity = '1';
      projectTitle.style.opacity = '1';
      projectArea.style.opacity = '1';
      projectPrice.style.opacity = '1';
      projectDescription.style.opacity = '1';
      projectImage.style.opacity = '1';
    }, 200);

    // Обновление состояния кнопок
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === totalProjects - 1;
    
    // Визуальное отключение кнопок
    if (index === 0) {
      prevBtn.style.opacity = '0.5';
      prevBtn.style.cursor = 'not-allowed';
    } else {
      prevBtn.style.opacity = '1';
      prevBtn.style.cursor = 'pointer';
    }
    
    if (index === totalProjects - 1) {
      nextBtn.style.opacity = '0.5';
      nextBtn.style.cursor = 'not-allowed';
    } else {
      nextBtn.style.opacity = '1';
      nextBtn.style.cursor = 'pointer';
    }
  }

  // Обработчики событий для кнопок
  prevBtn.addEventListener('click', function() {
    if (currentProjectIndex > 0) {
      currentProjectIndex--;
      updateProject(currentProjectIndex);
    }
  });

  nextBtn.addEventListener('click', function() {
    if (currentProjectIndex < totalProjects - 1) {
      currentProjectIndex++;
      updateProject(currentProjectIndex);
    }
  });

  // Инициализация первого проекта
  updateProject(0);

  // Добавляем CSS переходы
  const style = document.createElement('style');
  style.textContent = `
    #project-location, #project-title, #project-area, #project-price, #project-description, #project-image {
      transition: opacity 0.2s ease-in-out;
    }
    
    .portfolio-turnkey__nav-btn {
      transition: opacity 0.2s ease-in-out;
    }
    
    .portfolio-turnkey__nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
});
