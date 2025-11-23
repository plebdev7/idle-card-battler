// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../state/store";
import { ManaDisplay } from "./ManaDisplay";

describe("ManaDisplay", () => {
	beforeEach(() => {
		useGameStore.setState({
			mana: 0,
			maxMana: 10,
			manaRegen: 1,
		});
	});

	it("should render current mana value", () => {
		useGameStore.setState({ mana: 5 });
		render(<ManaDisplay />);
		expect(screen.getByText(/5/)).toBeInTheDocument();
	});

	it("should render max mana value", () => {
		useGameStore.setState({ maxMana: 10 });
		render(<ManaDisplay />);
		expect(screen.getByText(/10/)).toBeInTheDocument();
	});

	it("should render mana regen rate", () => {
		useGameStore.setState({ manaRegen: 2 });
		render(<ManaDisplay />);
		expect(screen.getByText(/2/)).toBeInTheDocument();
	});

	it("should display mana in correct format", () => {
		useGameStore.setState({
			mana: 7,
			maxMana: 12,
		});
		render(<ManaDisplay />);

		// Check that both values are present
		expect(screen.getByText(/7/)).toBeInTheDocument();
		expect(screen.getByText(/12/)).toBeInTheDocument();
	});

	it("should render when mana is zero", () => {
		useGameStore.setState({
			mana: 0,
			maxMana: 10,
			manaRegen: 1,
		});
		const { container } = render(<ManaDisplay />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should render when mana equals max mana", () => {
		useGameStore.setState({
			mana: 10,
			maxMana: 10,
		});
		render(<ManaDisplay />);
		expect(screen.getByText(/10/)).toBeInTheDocument();
	});
});
