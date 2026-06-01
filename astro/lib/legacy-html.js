export function normalizeLegacyPaths(html) {
  return stripLegacyMetrika(html)
    .replaceAll('href="assets/', 'href="/assets/')
    .replaceAll("href='assets/", "href='/assets/")
    .replaceAll('src="assets/', 'src="/assets/')
    .replaceAll("src='assets/", "src='/assets/")
    .replaceAll('href="scripts/', 'href="/scripts/')
    .replaceAll("href='scripts/", "href='/scripts/")
    .replaceAll('src="scripts/', 'src="/scripts/')
    .replaceAll("src='scripts/", "src='/scripts/")
    .replaceAll("../assets/", "/assets/")
    .replaceAll("../../assets/", "/assets/")
    .replaceAll("../../../assets/", "/assets/")
    .replaceAll("../scripts/", "/scripts/")
    .replaceAll("../../scripts/", "/scripts/")
    .replaceAll("../../../scripts/", "/scripts/")
    .replace(/href=(["'])(?:\.\/|\.\.\/)?([a-z][a-z0-9-]+)\.html\1/g, 'href="/$2"');
}

function stripLegacyMetrika(html) {
  return html.replace(
    /\s*<!--\s*Yandex\.Metrika counter\s*-->[\s\S]*?<!--\s*\/Yandex\.Metrika counter\s*-->\s*/gi,
    "",
  );
}

export function extractBetween(html, startMarker, endMarker) {
  const startIndex = html.indexOf(startMarker);
  const endIndex = html.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error(`Cannot extract HTML between ${startMarker} and ${endMarker}`);
  }

  return html.slice(startIndex + startMarker.length, endIndex).trim();
}

export function extractAfter(html, marker) {
  const startIndex = html.indexOf(marker);
  const bodyEndIndex = html.lastIndexOf("</body>");

  if (startIndex === -1 || bodyEndIndex === -1 || bodyEndIndex <= startIndex) {
    throw new Error(`Cannot extract HTML after ${marker}`);
  }

  return html.slice(startIndex + marker.length, bodyEndIndex).trim();
}

function decodeHtmlAttribute(value = "") {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#34;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .trim();
}

function attrValue(tag, name) {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(pattern);

  return decodeHtmlAttribute(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
}

function metaContent(html, name) {
  const tag = html.match(
    new RegExp(`<meta\\b(?=[^>]*(?:name|property)=["']${name}["'])[^>]*>`, "i"),
  )?.[0];

  return tag ? attrValue(tag, "content") : "";
}

export function extractLegacySeo(html) {
  return {
    title: html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "",
    description: metaContent(html, "description"),
    canonical: attrValue(
      html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/i)?.[0] ?? "",
      "href",
    ),
    ogType: metaContent(html, "og:type"),
    ogTitle: metaContent(html, "og:title"),
    ogDescription: metaContent(html, "og:description"),
    ogImage: metaContent(html, "og:image"),
    ogImageSecureUrl: metaContent(html, "og:image:secure_url"),
    ogImageWidth: metaContent(html, "og:image:width"),
    ogImageHeight: metaContent(html, "og:image:height"),
    ogImageType: metaContent(html, "og:image:type"),
    ogImageAlt: metaContent(html, "og:image:alt"),
    ogSiteName: metaContent(html, "og:site_name"),
  };
}

export function extractLegacyJsonLd(html) {
  return [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map(match => JSON.parse(match[1].trim()));
}
