// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "../../../state/store";
import { CombatScreen } from "./CombatScreen";

// Mock the useGameLoop hook
vi.mock("../../../engine/GameLoop", () => ({
	useGameLoop: vi.fn(),
}));

describe("CombatScreen", () => {
	beforeEach(() => {
		// Reset store to initial state
		useGameStore.setState({
			isRunning: false,
			tickCount: 0,
			time: 0,
			mana: 0,
			maxMana: 10,
			manaRegen: 1,
			hand: [],
			drawPile: [],
			discardPile: [],
			drawTimer: 0,
			drawSpeed: 3,
			initializeGame: vi.fn(),
		});
	});

	it("should render without crashing", () => {
		render(<CombatScreen />);
		expect(screen.getByText("Combat Debug")).toBeInTheDocument();
	});

	it("should call initializeGame on mount", () => {
		const initializeGame = vi.fn();
		useGameStore.setState({ initializeGame });

		render(<CombatScreen />);

		// initializeGame should be called during the effect
		expect(initializeGame).toHaveBeenCalled();
	});

	it("should render ManaDisplay component", () => {
		render(<CombatScreen />);
		// ManaDisplay renders "Mana" heading
		expect(screen.getByText("Mana")).toBeInTheDocument();
	});

	it("should render DrawTimer component", () => {
		render(<CombatScreen />);
		// DrawTimer renders "Draw Timer" heading
		expect(screen.getByText("Draw Timer")).toBeInTheDocument();
	});

	it("should render DrawPileView component", () => {
		render(<CombatScreen />);
		// DrawPileView renders "Draw" label
		expect(screen.getByText("Draw")).toBeInTheDocument();
	});

	it("should render DiscardPileView component", () => {
		render(<CombatScreen />);
		// DiscardPileView renders "Discard" label
		expect(screen.getByText("Discard")).toBeInTheDocument();
	});

	it("should render HandView component", () => {
		useGameStore.setState({ hand: [] });
		render(<CombatScreen />);
		// HandView renders "Hand Empty" when hand is empty
		expect(screen.getByText("Hand Empty")).toBeInTheDocument();
	});
});
