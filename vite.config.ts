import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
	// biome-ignore lint/suspicious/noExplicitAny: Fix type mismatch between vite and vitest
	plugins: [react()] as any,
	test: {
		environment: "happy-dom",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"src/**/*.test.{ts,tsx}",
				"src/**/*.spec.{ts,tsx}",
				"src/main.tsx",
			],
		},
	},
});
