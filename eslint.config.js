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
    ignores: ["public_html/**", "node_modules/**"],
  },
];
