// Инициализация Яндекс Карты
function initMap() {
  ymaps.ready(function () {
    var myMap = new ymaps.Map('map', {
      center: [55.950398, 37.533535],
      zoom: 16,
      controls: ['zoomControl', 'fullscreenControl']
    });
    var myPlacemark = new ymaps.Placemark([55.950398, 37.533535], {
      balloonContent: 'г. Мытищи, д. Грибки, ш. Дмитровское, 31а/3'
    }, {
      preset: 'islands#redDotIcon'
    });
    myMap.geoObjects.add(myPlacemark);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  if (typeof ymaps !== 'undefined') {
    initMap();
  } else {
    window.addEventListener('load', function() {
      if (typeof ymaps !== 'undefined') {
        initMap();
      }
    });
  }
}); 