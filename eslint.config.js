import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ymaps: "readonly",
        console: "readonly",
        document: "readonly",
        window: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        addEventListener: "readonly",
        removeEventListener: "readonly",
        FormData: "readonly",
        Array: "readonly",
        Object: "readonly",
        Math: "readonly",
        parseFloat: "readonly",
        parseInt: "readonly",
        isNaN: "readonly",
        IntersectionObserver: "readonly",
        fetch: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        Map: "readonly",
        alert: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        SyntaxError: "readonly",
        Promise: "readonly",
        URL: "readonly",
        CustomEvent: "readonly",
      },
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-var": "error",
      "prefer-const": "warn",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
    },
  },
  {
    // Конфигурация для Node.js файлов (vite.config.js и другие конфигурационные файлы)
    files: ["*.config.js", "*.config.mjs", "*.config.ts", "*.config.cjs"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ymaps: "readonly",
      },
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ["public_html/**", "node_modules/**"],
  },
];
