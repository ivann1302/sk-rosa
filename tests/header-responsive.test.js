import fs from "node:fs";
import { describe, expect, it } from "vitest";

const headerMarkup = fs.readFileSync(
  new URL("../astro/components/layout/Header.astro", import.meta.url),
  "utf8"
);
const headerStyles = fs.readFileSync(
  new URL("../src/styles/components/header/_header.scss", import.meta.url),
  "utf8"
);
const menuScript = fs.readFileSync(
  new URL("../src/scripts/modules/menu.js", import.meta.url),
  "utf8"
);
const submenuScript = fs.readFileSync(
  new URL("../src/scripts/modules/submenu.js", import.meta.url),
  "utf8"
);

describe("адаптивная шапка", () => {
  it("использует согласованную границу между планшетным и десктопным меню", () => {
    expect(headerStyles).toContain("(width <= 1023px)");
    expect(headerStyles).toContain("(width >= 1024px)");
    expect(headerStyles).not.toContain("(width <= 768px)");
    expect(headerStyles).not.toContain("(width >= 769px)");
    expect(submenuScript).toContain("const MOBILE_BREAKPOINT = 1023;");
    expect(menuScript).toContain('window.matchMedia("(max-width: 1023px)")');
  });

  it("не ограничивает бургер конфликтующим utility-классом", () => {
    expect(headerMarkup).toContain('class="header__burger-button burger-button"');
    expect(headerMarkup).not.toContain(
      'class="header__burger-button burger-button visible-mobile"'
    );
  });

  it("сохраняет шапку внутри viewport и снимает блокировку после resize", () => {
    expect(headerStyles).toContain("width: calc(100% - 24px);");
    expect(menuScript).toContain('tabletMedia.addEventListener("change"');
    expect(menuScript).toContain('document.body.style.overflow = "";');
    expect(submenuScript).toContain(
      'toggleButton ?? item.querySelector(".header__menu-toggle")'
    );
  });
});
