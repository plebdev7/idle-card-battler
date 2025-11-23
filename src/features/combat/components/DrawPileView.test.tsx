// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../state/store";
import { DrawPileView } from "./DrawPileView";

describe("DrawPileView", () => {
	beforeEach(() => {
		useGameStore.setState({
			drawPile: [],
		});
	});

	it("should render draw pile count when empty", () => {
		useGameStore.setState({ drawPile: [] });
		render(<DrawPileView />);
		expect(screen.getByText(/0/)).toBeInTheDocument();
	});

	it("should render draw pile count with cards", () => {
		useGameStore.setState({
			drawPile: [
				{ id: "card-1", name: "Card 1", currentCost: 1, defId: "test", zone: "DRAW" },
				{ id: "card-2", name: "Card 2", currentCost: 2, defId: "test", zone: "DRAW" },
				{ id: "card-3", name: "Card 3", currentCost: 3, defId: "test", zone: "DRAW" },
			],
		});
		render(<DrawPileView />);
		expect(screen.getByText(/3/)).toBeInTheDocument();
	});

	it("should render with single card in pile", () => {
		useGameStore.setState({
			drawPile: [{ id: "card-1", name: "Card 1", currentCost: 1, defId: "test", zone: "DRAW" }],
		});
		render(<DrawPileView />);
		expect(screen.getByText(/1/)).toBeInTheDocument();
	});

	it("should display draw pile label", () => {
		render(<DrawPileView />);
		expect(screen.getByText(/Draw/i)).toBeInTheDocument();
	});
});
