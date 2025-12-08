import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameData } from "../types/game";
import { updateAI } from "./AISystem";
import * as CombatSystem from "./CombatSystem";

// Mock performPlay to avoid circular dependency issues in tests and to verify calls
vi.mock("./CombatSystem", () => ({
	performPlay: vi.fn(),
}));

describe("AISystem", () => {
	let mockState: GameData;

	beforeEach(() => {
		vi.clearAllMocks();
		mockState = {
			gold: 0,
			mana: 10,
			maxMana: 10,
			manaRegen: 1,
			essence: 0,
			tower: {
				id: "tower",
				type: "TOWER",
				position: 0,
				stats: {
					hp: 50,
					maxHp: 100,
					speed: 0,
					range: 0,
					damage: 0,
					attackSpeed: 0,
				},
				state: "IDLE",
				attackCooldown: 0,
				statusEffects: [],
			},
			enemies: [],
			summons: [],
			projectiles: [],
			visualEffects: [],
			hand: [],
			drawPile: [],
			discardPile: [],
			voidPile: [],
			drawTimer: 0,
			drawSpeed: 1,
			maxHandSize: 5,
			wave: {
				current: 1,
				total: 10,
				phase: "ACTIVE",
				phaseTimer: 0,
				floor: 1,
				spawnQueue: [],
			},
			autoContinue: false,
			autoContinueDelay: 0,
			autoContinueTimer: 0,
			aiPlayCooldown: 0,
			combatLog: [],
			isRunning: true,
			tickCount: 0,
			time: 0,
		};
	});

	it("should play a card if mana is sufficient and targets exist", () => {
		mockState.hand = [
			{
				id: "c1",
				defId: "spell_fireball",
				zone: "HAND",
				currentCost: 3,
				name: "Fireball",
			},
		];
		mockState.enemies = [
			{
				id: "e1",
				type: "ENEMY",
				position: 10,
				stats: {
					hp: 10,
					maxHp: 10,
					speed: 1,
					range: 1,
					damage: 1,
					attackSpeed: 1,
				},
				state: "WALKING",
				attackCooldown: 0,
				statusEffects: [],
			},
		];

		updateAI(mockState, 1);
		expect(CombatSystem.performPlay).toHaveBeenCalledWith(mockState, "c1");
	});

	it("should NOT play a card if mana is insufficient", () => {
		mockState.mana = 0;
		mockState.hand = [
			{
				id: "c1",
				defId: "spell_fireball",
				zone: "HAND",
				currentCost: 3,
				name: "Fireball",
			},
		];
		mockState.enemies = [
			{
				id: "e1",
				type: "ENEMY",
				position: 10,
				stats: {
					hp: 10,
					maxHp: 10,
					speed: 1,
					range: 1,
					damage: 1,
					attackSpeed: 1,
				},
				state: "WALKING",
				attackCooldown: 0,
				statusEffects: [],
			},
		];

		updateAI(mockState, 1);
		expect(CombatSystem.performPlay).not.toHaveBeenCalled();
	});

	it("should NOT play a card if no valid targets (e.g. Fireball with no enemies)", () => {
		mockState.hand = [
			{
				id: "c1",
				defId: "spell_fireball",
				zone: "HAND",
				currentCost: 3,
				name: "Fireball",
			},
		];
		mockState.enemies = []; // No enemies

		updateAI(mockState, 1);
		expect(CombatSystem.performPlay).not.toHaveBeenCalled();
	});

	it("should select a random card from playable cards", () => {
		mockState.hand = [
			{
				id: "c1",
				defId: "spell_fireball",
				zone: "HAND",
				currentCost: 3,
				name: "Fireball",
			},
			{
				id: "c2",
				defId: "spell_zap",
				zone: "HAND",
				currentCost: 1,
				name: "Zap",
			},
		];
		mockState.enemies = [
			{
				id: "e1",
				type: "ENEMY",
				position: 10,
				stats: {
					hp: 10,
					maxHp: 10,
					speed: 1,
					range: 1,
					damage: 1,
					attackSpeed: 1,
				},
				state: "WALKING",
				attackCooldown: 0,
				statusEffects: [],
			},
		];

		// Mock Math.random to return 0.99, which should select the second card (index 1)
		const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.99);

		updateAI(mockState, 1);
		expect(CombatSystem.performPlay).toHaveBeenCalledWith(mockState, "c2");

		randomSpy.mockRestore();
	});
});
