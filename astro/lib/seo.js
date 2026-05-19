export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "OOO.ROSA",
  legalName: "OOO.ROSA",
  url: "https://sk-rosa.ru",
  logo: "https://sk-rosa.ru/assets/images/common/rosa-logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+79851354991",
    contactType: "customer service",
    areaServed: "RU",
    availableLanguage: ["Russian"],
  },
  sameAs: [
    "https://t.me/mskrosa?text=%D0%94%D0%BE%D0%B1%D1%80%D1%8B%D0%B9%20%D0%B4%D0%B5%D0%BD%D1%8C!%20%D0%9D%D0%B5%20%D0%BC%D0%BE%D0%B3%D0%BB%D0%B8%20%D0%B1%D1%8B%20%D0%BF%D0%BE%D0%B4%D1%80%D0%BE%D0%B1%D0%BD%D0%B5%D0%B5%20%D1%80%D0%B0%D1%81%D1%81%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D1%8C%20%D0%BE%20%D0%B2%D0%B0%D1%88%D0%B8%D1%85%20%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B0%D1%85%3F%20%F0%9F%91%8B",
    "https://wa.me/79851354991",
  ],
};

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
