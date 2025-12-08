// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "../../../state/store";
import type { VisualEffect } from "../../../types/game";
import { VisualEffectsOverlay } from "./VisualEffectsOverlay";

describe("VisualEffectsOverlay", () => {
	beforeEach(() => {
		useGameStore.setState({
			visualEffects: [],
		});
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should render without crashing with empty effects", () => {
		const { container } = render(<VisualEffectsOverlay />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("should display damage effect", () => {
		const damageEffect: VisualEffect = {
			id: "fx1",
			type: "DAMAGE",
			position: 50,
			value: 25,
			timestamp: Date.now(),
		};

		useGameStore.setState({
			visualEffects: [damageEffect],
		});

		render(<VisualEffectsOverlay />);
		expect(screen.getByText("25")).toBeInTheDocument();
	});

	it("should display heal effect", () => {
		const healEffect: VisualEffect = {
			id: "fx2",
			type: "HEAL",
			position: 30,
			value: 15,
			timestamp: Date.now(),
		};

		useGameStore.setState({
			visualEffects: [healEffect],
		});

		render(<VisualEffectsOverlay />);
		expect(screen.getByText("15")).toBeInTheDocument();
	});

	it("should display buff effect", () => {
		const buffEffect: VisualEffect = {
			id: "fx3",
			type: "BUFF",
			position: 40,
			text: "+ATK",
			timestamp: Date.now(),
		};

		useGameStore.setState({
			visualEffects: [buffEffect],
		});

		render(<VisualEffectsOverlay />);
		expect(screen.getByText("+ATK")).toBeInTheDocument();
	});

	it("should display debuff effect", () => {
		const debuffEffect: VisualEffect = {
			id: "fx4",
			type: "DEBUFF",
			position: 60,
			text: "SLOW",
			timestamp: Date.now(),
		};

		useGameStore.setState({
			visualEffects: [debuffEffect],
		});

		render(<VisualEffectsOverlay />);
		expect(screen.getByText("SLOW")).toBeInTheDocument();
	});

	it("should filter effects older than 1 second", () => {
		const now = Date.now();
		const recentEffect: VisualEffect = {
			id: "fx5",
			type: "DAMAGE",
			position: 50,
			value: 10,
			timestamp: now,
		};
		const oldEffect: VisualEffect = {
			id: "fx6",
			type: "DAMAGE",
			position: 50,
			value: 20,
			timestamp: now - 1500, // 1.5 seconds ago
		};

		useGameStore.setState({
			visualEffects: [recentEffect, oldEffect],
		});

		render(<VisualEffectsOverlay />);

		// Should only show recent effect
		expect(screen.getByText("10")).toBeInTheDocument();
		expect(screen.queryByText("20")).not.toBeInTheDocument();
	});

	it("should display multiple simultaneous effects", () => {
		const now = Date.now();
		const effects: VisualEffect[] = [
			{
				id: "fx7",
				type: "DAMAGE",
				position: 30,
				value: 25,
				timestamp: now,
			},
			{
				id: "fx8",
				type: "HEAL",
				position: 50,
				value: 15,
				timestamp: now,
			},
			{
				id: "fx9",
				type: "BUFF",
				position: 70,
				text: "+DEF",
				timestamp: now,
			},
		];

		useGameStore.setState({
			visualEffects: effects,
		});

		render(<VisualEffectsOverlay />);

		// All effects should be visible
		expect(screen.getByText("25")).toBeInTheDocument();
		expect(screen.getByText("15")).toBeInTheDocument();
		expect(screen.getByText("+DEF")).toBeInTheDocument();
	});
});
