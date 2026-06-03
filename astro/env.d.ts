/// <reference types="astro/client" />

declare module "*.html?raw" {
  const source: string;
  export default source;
}

declare module "*.xml?raw" {
  const source: string;
  export default source;
}
