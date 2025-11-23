// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../state/store";
import { GameDebugView } from "./GameDebugView";

describe("GameDebugView", () => {
	beforeEach(() => {
		useGameStore.setState({
			isRunning: false,
			tickCount: 0,
			time: 0,
			mana: 0,
			drawPile: [],
			hand: [],
			discardPile: [],
		});
	});

	it("should render debug information", () => {
		const { container } = render(<GameDebugView />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should display running state when true", () => {
		useGameStore.setState({ isRunning: true });
		render(<GameDebugView />);
		expect(screen.getByText(/Running/i)).toBeInTheDocument();
	});

	it("should display stopped state when false", () => {
		useGameStore.setState({ isRunning: false });
		render(<GameDebugView />);
		expect(screen.getByText(/PAUSED/i)).toBeInTheDocument();
	});

	it("should render hand cards", () => {
		useGameStore.setState({
			hand: [
				{
					id: "3",
					defId: "lightning",
					zone: "HAND",
					currentCost: 4,
					name: "Lightning",
				},
			],
			mana: 10,
		});

		render(<GameDebugView />);
		expect(screen.getByText("Lightning")).toBeInTheDocument();
		expect(screen.getByText("Cost: 4")).toBeInTheDocument();
	});
});
