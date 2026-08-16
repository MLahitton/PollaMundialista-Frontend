import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

// eslint-config-next 16.3 ya publica flat config nativo, por lo que se importa
// directamente. Antes se cargaba via FlatCompat (@eslint/eslintrc), que pasa los
// configs por el validador legacy y falla con estos presets.
// Los presets son los mismos que antes: core-web-vitals + typescript.
export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  // Ignores por defecto de eslint-config-next, declarados de forma explicita
  // para que no se pierdan al extender la configuracion.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
