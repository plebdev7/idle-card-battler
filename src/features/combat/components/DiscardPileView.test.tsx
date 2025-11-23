// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../state/store";
import { DiscardPileView } from "./DiscardPileView";

describe("DiscardPileView", () => {
	beforeEach(() => {
		useGameStore.setState({
			discardPile: [],
		});
	});

	it("should render discard pile count when empty", () => {
		useGameStore.setState({ discardPile: [] });
		render(<DiscardPileView />);
		expect(screen.getByText(/0/)).toBeInTheDocument();
	});

	it("should render discard pile count with cards", () => {
		useGameStore.setState({
			discardPile: [
				{
					id: "card-1",
					name: "Card 1",
					currentCost: 1,
					defId: "test",
					zone: "DISCARD",
				},
				{
					id: "card-2",
					name: "Card 2",
					currentCost: 2,
					defId: "test",
					zone: "DISCARD",
				},
				{
					id: "card-3",
					name: "Card 3",
					currentCost: 3,
					defId: "test",
					zone: "DISCARD",
				},
				{
					id: "card-4",
					name: "Card 4",
					currentCost: 4,
					defId: "test",
					zone: "DISCARD",
				},
			],
		});
		render(<DiscardPileView />);
		expect(screen.getByText(/4/)).toBeInTheDocument();
	});

	it("should render with single card in pile", () => {
		useGameStore.setState({
			discardPile: [
				{
					id: "card-1",
					name: "Card 1",
					currentCost: 1,
					defId: "test",
					zone: "DISCARD",
				},
			],
		});
		render(<DiscardPileView />);
		expect(screen.getByText(/1/)).toBeInTheDocument();
	});

	it("should display discard pile label", () => {
		render(<DiscardPileView />);
		expect(screen.getByText(/Discard/i)).toBeInTheDocument();
	});
});
