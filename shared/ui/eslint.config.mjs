import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["**/.eslintrc.cjs"],
  },
  ...compat.extends("@repo/eslint-config/index.js"),
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 6,
      sourceType: "script",

      parserOptions: {
        project: true,
      },
    },
  },
];
