module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./app/tsconfig.json"],
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
  ],
  settings: {
    "import/extensions": [".js", ".ts"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
  },
  plugins: ["@typescript-eslint", "import", "deprecation", "unused-imports"],
  ignorePatterns: ["node_modules/*", ".wrangler", ".eslintrc.cjs"],
};