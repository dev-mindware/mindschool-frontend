import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// eslint-config-next 16 já exporta flat configs (o FlatCompat deixou de funcionar e o lint nunca chegava a correr).
const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  { ignores: [".next/**", "node_modules/**", "coverage/**", "public/**", "next-env.d.ts", "jest.config.js", "jest.setup.ts"] },
  {
    rules: {
      // Regras do React Compiler (react-hooks v6) e `any`: ficam como aviso para o código legado (reposição de estado de
      // modais em effects, react-select, tipos de API). O código novo deve evitá-las; os avisos são a lista de trabalho.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/use-memo": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
