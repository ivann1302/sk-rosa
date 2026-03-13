import { describe, it, expect } from "vitest";
import {
  validatePhone,
  validateName,
  validateComment,
} from "../src/scripts/features/contact/form-validation.js";

// describe — группирует тесты по теме
// it — один тест (читается как "это должно...")
// expect + toBe/toEqual — проверка результата

describe("validatePhone", () => {
  it("принимает корректный российский номер", () => {
    expect(validatePhone("+7 (999) 123-45-67").valid).toBe(true);
  });

  it("принимает номер без форматирования (только цифры)", () => {
    expect(validatePhone("79991234567").valid).toBe(true);
  });

  it("отклоняет пустую строку", () => {
    const result = validatePhone("");
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy(); // ошибка есть
  });

  it("отклоняет null и undefined", () => {
    expect(validatePhone(null).valid).toBe(false);
    expect(validatePhone(undefined).valid).toBe(false);
  });

  it("отклоняет слишком короткий номер (менее 10 цифр)", () => {
    expect(validatePhone("12345").valid).toBe(false);
  });

  it("отклоняет слишком длинный номер (более 15 цифр)", () => {
    expect(validatePhone("1234567890123456").valid).toBe(false);
  });
});

describe("validateName", () => {
  it("принимает имя на русском", () => {
    expect(validateName("Иван").valid).toBe(true);
  });

  it("принимает имя на латинице", () => {
    expect(validateName("Ivan").valid).toBe(true);
  });

  it("принимает имя с дефисом", () => {
    expect(validateName("Мария-Анна").valid).toBe(true);
  });

  it("отклоняет пустое имя", () => {
    expect(validateName("").valid).toBe(false);
  });

  it("отклоняет имя из одного символа", () => {
    expect(validateName("А").valid).toBe(false);
  });

  it("отклоняет имя с цифрами", () => {
    expect(validateName("Иван123").valid).toBe(false);
  });

  it("отклоняет имя длиннее 100 символов", () => {
    expect(validateName("А".repeat(101)).valid).toBe(false);
  });
});

describe("validateComment", () => {
  it("принимает пустой комментарий (поле опциональное)", () => {
    expect(validateComment("").valid).toBe(true);
    expect(validateComment(null).valid).toBe(true);
  });

  it("принимает обычный текст", () => {
    expect(validateComment("Нужна штукатурка в 3 комнатах").valid).toBe(true);
  });

  it("отклоняет комментарий длиннее 2000 символов", () => {
    expect(validateComment("А".repeat(2001)).valid).toBe(false);
  });
});
