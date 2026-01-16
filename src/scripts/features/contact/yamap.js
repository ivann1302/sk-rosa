function initMap() {
  const office = window.CONFIG?.office || {
    latitude: 55.922212,
    longitude: 37.513521,
    address: "Московская обл., г. Долгопрудный, Лихачёвский пр-д, 6с1, офис 302/1",
    mapZoom: 16,
  };

  ymaps.ready(function () {
    const myMap = new ymaps.Map("map", {
      center: [office.latitude, office.longitude],
      zoom: office.mapZoom,
      controls: ["zoomControl", "fullscreenControl"],
    });
    const myPlacemark = new ymaps.Placemark(
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
