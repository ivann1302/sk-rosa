export const businessId = "https://sk-rosa.ru/#business";
export const websiteId = "https://sk-rosa.ru/#website";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness", "HomeAndConstructionBusiness"],
  "@id": businessId,
  name: "ROSA - Ремонт под ключ",
  legalName: "ООО «Роса»",
  alternateName: "ROSA - Ремонт под ключ",
  url: "https://sk-rosa.ru",
  logo: "https://sk-rosa.ru/assets/images/common/rosa-logo.png",
  image: [
    "https://sk-rosa.ru/assets/images/common/rosa-logo.png",
    "https://sk-rosa.ru/assets/images/common/about-hero.webp",
  ],
  telephone: "+79851354991",
  email: "ooo.rosa2019@yandex.ru",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Лихачёвский пр-д, 6с1",
    addressLocality: "Долгопрудный",
    addressRegion: "Московская область",
    postalCode: "141700",
    addressCountry: "RU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 55.9381,
    longitude: 37.5067,
  },
  openingHours: ["Mo-Fr 09:00-20:00", "Sa 10:00-18:00"],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "18:00",
    },
  ],
  hasMap: "https://yandex.com/maps/org/rosa/244762145159/",
  priceRange: "$$",
  areaServed: [
    { "@type": "City", name: "Москва" },
    { "@type": "AdministrativeArea", name: "Московская область" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+79851354991",
    contactType: "customer service",
    areaServed: "RU",
    availableLanguage: ["Russian"],
  },
  sameAs: [
    "https://t.me/mskrosa",
    "https://wa.me/79851354991",
    "https://t.me/sk_rosa",
    "https://vk.com/skrosa",
    "https://dzen.ru/id/699317fa4c68660edaa347ae?share_to=link",
    "https://ok.ru/group/70000044485400",
    "https://yandex.com/maps/org/rosa/244762145159/",
    "https://2gis.ru/firm/70000001110771901",
  ],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": websiteId,
  name: "ROSA - Ремонт под ключ",
  url: "https://sk-rosa.ru",
  inLanguage: "ru-RU",
  publisher: {
    "@id": businessId,
  },
};

export function webPageJsonLd({ canonical, title, description, mainEntityId }) {
  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    inLanguage: "ru-RU",
    isPartOf: {
      "@id": websiteId,
    },
    publisher: {
      "@id": businessId,
    },
  };

  if (mainEntityId) {
    page.about = {
      "@id": mainEntityId,
    };
    page.mainEntity = {
      "@id": mainEntityId,
    };
  }

  return page;
}

export function serviceJsonLd({
  canonical,
  name,
  description,
  serviceType,
  areaServed,
  price,
  minPrice,
  maxPrice,
  unitCode = "MTK",
  unitText = "м²",
}) {
  const priceSpecification = {
    "@type": "UnitPriceSpecification",
    priceCurrency: "RUB",
    unitCode,
    unitText,
  };

  if (price) {
    priceSpecification.price = String(price);
  }

  if (minPrice) {
    priceSpecification.minPrice = String(minPrice);
  }

  if (maxPrice) {
    priceSpecification.maxPrice = String(maxPrice);
  }

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonical}#service`,
    url: canonical,
    serviceType,
    name,
    description,
    provider: {
      "@id": businessId,
    },
    areaServed,
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: canonical,
      servicePhone: "+79851354991",
      serviceSmsNumber: "+79851354991",
      availableLanguage: "Russian",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      priceSpecification,
      availability: "https://schema.org/InStock",
      url: canonical,
    },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
