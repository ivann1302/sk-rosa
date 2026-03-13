import { describe, it, expect, beforeAll } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PAGES_DIR = resolve(__dirname, "../src/pages");

// beforeAll — выполняется один раз перед всеми тестами в блоке
// Используем для проверки что папка вообще существует
let generatedFiles = [];

beforeAll(() => {
  if (existsSync(PAGES_DIR)) {
    generatedFiles = readdirSync(PAGES_DIR).filter(f => f.startsWith("plastering-") && f.endsWith(".html"));
  }
});

describe("Генератор городских страниц (plastering)", () => {
  it("сгенерировал хотя бы 40 страниц", () => {
    expect(generatedFiles.length).toBeGreaterThan(40);
  });

  it("у каждой страницы есть тег <title>", () => {
    // Проверяем первые 10 файлов (не все — тест будет медленным)
    const sample = generatedFiles.slice(0, 10);

    sample.forEach(file => {
      const content = readFileSync(resolve(PAGES_DIR, file), "utf-8");
      expect(content, `Файл ${file}: нет тега <title>`).toMatch(/<title>.+<\/title>/);
    });
  });

  it("у каждой страницы есть тег <h1>", () => {
    const sample = generatedFiles.slice(0, 10);

    sample.forEach(file => {
      const content = readFileSync(resolve(PAGES_DIR, file), "utf-8");
      expect(content, `Файл ${file}: нет тега <h1>`).toMatch(/<h1[^>]*>.+<\/h1>/);
    });
  });

  it("в страницах нет незаменённых плейсхолдеров {{...}}", () => {
    const sample = generatedFiles.slice(0, 10);

    sample.forEach(file => {
      const content = readFileSync(resolve(PAGES_DIR, file), "utf-8");
      // Если в шаблоне остался {{city}} или любой другой плейсхолдер — тест упадёт
      expect(content, `Файл ${file}: остались незаменённые плейсхолдеры`).not.toMatch(/\{\{.+\}\}/);
    });
  });
});
