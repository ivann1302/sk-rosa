import { fileURLToPath } from "node:url";
import { compile } from "sass";
import { describe, expect, it } from "vitest";

const footerStyles = compile(
  fileURLToPath(new URL("../src/styles/components/footer/_footer.scss", import.meta.url))
).css;

function getRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return footerStyles.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
}

describe("подпись разработчика в футере", () => {
  it("сливается с тёмным фоном в обычном состоянии и при наведении", () => {
    const backgroundColor = "#111827";

    expect(getRule(".footer")).toContain(backgroundColor);
    expect(getRule(".footer__credit")).toContain(`color: ${backgroundColor};`);
    expect(getRule(".footer__credit a")).toContain(`color: ${backgroundColor};`);
    expect(getRule(".footer__credit a:hover")).toContain(`color: ${backgroundColor};`);
  });
});
