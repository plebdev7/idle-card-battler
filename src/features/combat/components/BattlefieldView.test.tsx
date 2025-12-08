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

	it("should display 'No Active Combat' when empty", () => {
		useGameStore.setState({ enemies: [], summons: [] });
		render(<BattlefieldView />);
		expect(screen.getByText("No Active Combat")).toBeInTheDocument();
	});

	it("should display summons when present", () => {
		useGameStore.setState({
			summons: [
				{
					id: "s1",
					type: "SUMMON",
					position: 30,
					stats: {
						hp: 50,
						maxHp: 50,
						speed: 0,
						damage: 5,
						attackSpeed: 1,
						range: 10,
					},
					state: "IDLE",
					attackCooldown: 0,
					statusEffects: [],
				},
			],
			enemies: [],
		});

		render(<BattlefieldView />);
		// Summons show HP value
		expect(screen.getByText("50")).toBeInTheDocument();
	});

	it("should display projectiles when present", () => {
		useGameStore.setState({
			projectiles: [
				{
					id: "p1",
					type: "PROJECTILE",
					position: 45,
					stats: {
						hp: 1,
						maxHp: 1,
						speed: 50,
						damage: 20,
						attackSpeed: 0,
						range: 0,
					},
					state: "WALKING",
					attackCooldown: 0,
					statusEffects: [],
				},
			],
		});

		const { container } = render(<BattlefieldView />);
		// Verify projectile is rendered by checking container structure
		const projectiles = container.querySelectorAll('div[style*="left:"]');
		// Should have at least one positioned element (the projectile)
		expect(projectiles.length).toBeGreaterThan(0);
	});

	it("should display multiple entity types simultaneously", () => {
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
			summons: [
				{
					id: "s1",
					type: "SUMMON",
					position: 30,
					stats: {
						hp: 50,
						maxHp: 50,
						speed: 0,
						damage: 5,
						attackSpeed: 1,
						range: 10,
					},
					state: "IDLE",
					attackCooldown: 0,
					statusEffects: [],
				},
			],
			projectiles: [
				{
					id: "p1",
					type: "PROJECTILE",
					position: 45,
					stats: {
						hp: 1,
						maxHp: 1,
						speed: 50,
						damage: 20,
						attackSpeed: 0,
						range: 0,
					},
					state: "WALKING",
					attackCooldown: 0,
					statusEffects: [],
				},
			],
		});

		const { container } = render(<BattlefieldView />);
		// Should render all entity types
		expect(screen.getByText("100/100")).toBeInTheDocument(); // Enemy HP
		expect(screen.getByText("50")).toBeInTheDocument(); // Summon HP
		// Verify all entities are positioned (they all have left style)
		const positionedEntities = container.querySelectorAll(
			'div[style*="left:"]',
		);
		// Should have 3 positioned elements (enemy, summon, projectile)
		expect(positionedEntities.length).toBe(3);
	});
});
