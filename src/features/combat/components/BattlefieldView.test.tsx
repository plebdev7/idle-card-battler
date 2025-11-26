// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useGameStore } from "../../../state/store";
import { BattlefieldView } from "./BattlefieldView";

describe("BattlefieldView", () => {
	it("should render without crashing", () => {
		render(<BattlefieldView />);
		expect(screen.getByText(/Tower HP/)).toBeInTheDocument();
	});

	it("should display enemies when present", () => {
		useGameStore.setState({
			enemies: [
				{
					id: "e1",
					type: "ENEMY",
					position: 50,
					stats: {
						hp: 100,
						maxHp: 100,
						speed: 1,
						damage: 10,
						attackSpeed: 1,
						range: 10,
					},
					state: "WALKING",
					attackCooldown: 0,
					statusEffects: [],
				},
			],
		});

		render(<BattlefieldView />);
		expect(screen.getByText("100/100")).toBeInTheDocument();
	});

	it("should display 'No Enemies' when empty", () => {
		useGameStore.setState({ enemies: [] });
		render(<BattlefieldView />);
		expect(screen.getByText("No Enemies")).toBeInTheDocument();
	});
});
