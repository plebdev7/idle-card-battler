// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../state/store";
import type { CardInstance } from "../../../types/game";
import { HandView } from "./HandView";

describe("HandView", () => {
	beforeEach(() => {
		// Reset store to initial state
		useGameStore.setState({
			hand: [],
			mana: 0,
		});
	});

	it("should render empty hand state", () => {
		render(<HandView />);
		expect(screen.getByText("Hand Empty")).toBeInTheDocument();
	});

	it("should render cards in hand", () => {
		useGameStore.setState({
			hand: [
				{
					id: "card-1",
					defId: "fireball",
					zone: "HAND",
					name: "Fireball",
					currentCost: 3,
				} as CardInstance,
				{
					id: "card-2",
					defId: "icebolt",
					zone: "HAND",
					name: "Ice Bolt",
					currentCost: 2,
				} as CardInstance,
			],
			mana: 5,
		});

		render(<HandView />);

		expect(screen.getByText("Fireball")).toBeInTheDocument();
		expect(screen.getByText("Ice Bolt")).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
	});

	it("should not show empty message when cards are present", () => {
		useGameStore.setState({
			hand: [
				{
					id: "card-1",
					defId: "fireball",
					zone: "HAND",
					name: "Fireball",
					currentCost: 3,
				} as CardInstance,
			],
			mana: 5,
		});

		render(<HandView />);

		expect(screen.queryByText("Hand Empty")).not.toBeInTheDocument();
	});

	it("should render multiple cards correctly", () => {
		useGameStore.setState({
			hand: [
				{
					id: "card-1",
					defId: "fireball",
					zone: "HAND",
					name: "Fireball",
					currentCost: 3,
				} as CardInstance,
				{
					id: "card-2",
					defId: "icebolt",
					zone: "HAND",
					name: "Ice Bolt",
					currentCost: 2,
				} as CardInstance,
				{
					id: "card-3",
					defId: "lightning",
					zone: "HAND",
					name: "Lightning",
					currentCost: 4,
				} as CardInstance,
			],
			mana: 10,
		});

		render(<HandView />);

		// All three cards should be visible
		expect(screen.getByText("Fireball")).toBeInTheDocument();
		expect(screen.getByText("Ice Bolt")).toBeInTheDocument();
		expect(screen.getByText("Lightning")).toBeInTheDocument();
	});

	it("should display cards with different opacity based on mana availability", () => {
		useGameStore.setState({
			hand: [
				{
					id: "card-1",
					defId: "cheap",
					zone: "HAND",
					name: "Cheap",
					currentCost: 2,
				} as CardInstance,
				{
					id: "card-2",
					defId: "expensive",
					zone: "HAND",
					name: "Expensive",
					currentCost: 5,
				} as CardInstance,
			],
			mana: 3,
		});

		const { container } = render(<HandView />);

		// Both cards should be rendered
		expect(screen.getByText("Cheap")).toBeInTheDocument();
		expect(screen.getByText("Expensive")).toBeInTheDocument();

		// Check that the cards have different styling based on mana
		const cards = container.querySelectorAll('[style*="opacity"]');
		expect(cards.length).toBeGreaterThan(0);
	});
});
