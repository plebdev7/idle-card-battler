// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

// Mock the game loop and store
vi.mock("./engine/GameLoop", () => ({
	useGameLoop: vi.fn(),
}));

describe("App", () => {
	it("should render without crashing", () => {
		render(<App />);
		// App renders CombatScreen which has "Combat Debug" heading
		expect(screen.getByText("Combat Prototype")).toBeInTheDocument();
	});

	it("should render CombatScreen component", () => {
		render(<App />);
		// Verify that CombatScreen is rendered by checking for its content
		expect(screen.getByText("Mana")).toBeInTheDocument();
		expect(screen.getByText("Draw Timer")).toBeInTheDocument();
	});
});
