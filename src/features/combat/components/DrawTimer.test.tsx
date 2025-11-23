// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../state/store";
import { DrawTimer } from "./DrawTimer";

describe("DrawTimer", () => {
	beforeEach(() => {
		useGameStore.setState({
			drawTimer: 0,
			drawSpeed: 3.0,
		});
	});

	it("should render remaining time correctly", () => {
		useGameStore.setState({
			drawTimer: 0.5,
			drawSpeed: 3.0,
		});
		render(<DrawTimer />);
		// Remaining time = 3.0 * (1 - 0.5) = 1.5s
		expect(screen.getByText("1.5s")).toBeInTheDocument();
	});

	it("should render progress bar", () => {
		useGameStore.setState({ drawTimer: 0.25 });
		const { container } = render(<DrawTimer />);
		const progressBar = container.querySelector('div[style*="width: 25%"]');
		expect(progressBar).toBeInTheDocument();
	});

	it("should update when draw timer changes", () => {
		useGameStore.setState({
			drawTimer: 0.8,
			drawSpeed: 5.0,
		});
		render(<DrawTimer />);
		// Remaining time = 5.0 * (1 - 0.8) = 1.0s
		expect(screen.getByText("1.0s")).toBeInTheDocument();
	});

	it("should render 0.0s when timer is full", () => {
		useGameStore.setState({
			drawTimer: 1.0,
			drawSpeed: 3.0,
		});
		render(<DrawTimer />);
		expect(screen.getByText("0.0s")).toBeInTheDocument();
	});
});
