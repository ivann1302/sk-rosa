// Инициализация Яндекс Карты
function initMap() {
  // Используем константы из constants.js
  const office = window.CONFIG?.office || {
    latitude: 55.950398,
    longitude: 37.533535,
    address: 'г. Мытищи, д. Грибки, ш. Дмитровское, 31а/3',
    mapZoom: 16,
  };

  ymaps.ready(function () {
    var myMap = new ymaps.Map("map", {
      center: [office.latitude, office.longitude],
      zoom: office.mapZoom,
      controls: ["zoomControl", "fullscreenControl"],
    });
    var myPlacemark = new ymaps.Placemark(
      [office.latitude, office.longitude],
      {
        balloonContent: office.address,
      },
      {
        preset: "islands#redDotIcon",
      }
    );
    myMap.geoObjects.add(myPlacemark);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof ymaps !== "undefined") {
    initMap();
  } else {
    window.addEventListener("load", function () {
      if (typeof ymaps !== "undefined") {
        initMap();
      }
    });
  }
});
