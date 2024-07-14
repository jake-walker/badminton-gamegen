module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    sourceType: "module",
  },
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "airbnb",
    "airbnb-typescript",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:deprecation/recommended",
    "plugin:react/jsx-runtime",
  ],
  settings: {
    "import/extensions": [".js", ".ts"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
  },
  plugins: ["@typescript-eslint", "import", "deprecation", "unused-imports"],
  ignorePatterns: ["node_modules/*", ".wrangler", ".eslintrc.cjs"],
  rules: {
    // Adding default props in typescript in the way this linter wants is not idiomatic
    "react/require-default-props": 0,
  },
  overrides: [
    {
      // API Route files have a predefined signature, which is not default export
      files: ["src/app/api/**/route.ts"],
      rules: {
        "import/prefer-default-export": 0,
      },
    },
  ],
};
