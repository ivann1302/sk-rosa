import fs from "node:fs";
import { describe, expect, it } from "vitest";

const homeAdvantages = fs.readFileSync(
  new URL("../src/styles/components/services/_advantages.scss", import.meta.url),
  "utf8"
);
const serviceAdvantages = fs.readFileSync(
  new URL("../src/styles/components/services/_advantages-service.scss", import.meta.url),
  "utf8"
);
const footerStyles = fs.readFileSync(
  new URL("../src/styles/components/footer/_footer.scss", import.meta.url),
  "utf8"
);
const reviewStyles = fs.readFileSync(
  new URL("../src/styles/components/common/_reviews.scss", import.meta.url),
  "utf8"
);
const priceCalcStyles = fs.readFileSync(
  new URL("../src/styles/components/calculator/_price-calc.scss", import.meta.url),
  "utf8"
);
const turnkeyAboutStyles = fs.readFileSync(
  new URL("../src/styles/components/about/_about-turnkey-2.scss", import.meta.url),
  "utf8"
);
const turnkeyPortfolioStyles = fs.readFileSync(
  new URL("../src/styles/components/portfolio/_portfolio-turnkey.scss", import.meta.url),
  "utf8"
);
const turnkeyStagesStyles = fs.readFileSync(
  new URL("../src/styles/components/services/_work-stages-turnkey.scss", import.meta.url),
  "utf8"
);

describe("адаптивная ширина контента", () => {
  it("не фиксирует блоки преимуществ на ширине 1200px", () => {
    expect(homeAdvantages).toContain(".advantages {");
    expect(homeAdvantages).toContain("width: 100%;\n  max-width: 1200px;");
    expect(homeAdvantages).not.toMatch(/^\s+width: 1200px;/m);

    expect(serviceAdvantages).toContain("width: calc(100% - 24px);");
    expect(serviceAdvantages).not.toMatch(/^\s+width: 1200px;/m);
  });

  it("разводит мобильную и десктопную раскладки футера без пересечения", () => {
    expect(footerStyles).toContain("(width <= 1023px)");
    expect(footerStyles).toContain("(width >= 1024px)");
    expect(footerStyles).not.toContain("(width <= 768px)");
    expect(footerStyles).not.toContain("(width >= 768px)");
  });

  it("не выталкивает социальные ссылки за правую границу футера", () => {
    expect(footerStyles).not.toContain("margin-right: -39px");
  });

  it("оставляет стрелки отзывов доступными на планшете", () => {
    expect(reviewStyles).toContain("position: absolute !important;");
    expect(reviewStyles).toContain("(width >= 769px) and (width <= 1334px)");
    expect(reviewStyles).toContain("left: 12px;");
    expect(reviewStyles).toContain("right: 12px;");
  });

  it("включает готовые адаптивные раскладки сервисов до их безопасной ширины", () => {
    expect(priceCalcStyles).toContain("@media (width <= 1023px)");
    expect(priceCalcStyles).toContain("flex: 1;\n    min-width: 0;");
    expect(turnkeyAboutStyles).toContain("width: calc(100% - 24px);");
    expect(turnkeyAboutStyles).toContain("@media (width <= 1023px)");
    expect(turnkeyPortfolioStyles).toContain("@media (width <= 1199px)");
    expect(turnkeyStagesStyles).toContain("@media (width <= 1023px)");
  });
});
