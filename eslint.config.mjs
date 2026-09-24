import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Links between the hub and modules are deliberately full page loads (each module is its own world).
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    // The platform layer must not depend on module internals (modules depend on the platform, never the reverse).
    files: ["src/core/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/pocs/*/**"], message: "src/core must not import module code." }] },
      ],
    },
  },
  globalIgnores([".next/**", ".next-*/**", "out/**", "build/**", "next-env.d.ts", "pocs/**", "public/pocs/**", ".data/**", "drizzle/**"]),
]);
