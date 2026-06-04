import { airlessPaintingCityPages } from "./airless-painting-city-pages.js";
import { biozashchitaCityPages } from "./biozashchita-city-pages.js";
import { floorScreedCityPages } from "./floor-screed-city-pages.js";
import { plasteringCityPages } from "./plastering-city-pages.js";
import { softRoofingCityPages } from "./soft-roofing-city-pages.js";
import { turnkeyRepairCityPages } from "./turnkey-repair-city-pages.js";

export const serviceCityPages = [
  ...plasteringCityPages,
  ...floorScreedCityPages,
  ...airlessPaintingCityPages,
  ...softRoofingCityPages,
  ...biozashchitaCityPages,
  ...turnkeyRepairCityPages,
];
