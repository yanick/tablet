// eslint.config.ts
import packageJson from "eslint-plugin-package-json";
import { defineConfig } from "eslint/config";

export default defineConfig([
	// your other ESLint configurations
	// packageJson.configs.recommended,
	packageJson.configs["recommended-publishable"],
]);
