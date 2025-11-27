import { beforeEach, describe, expect, it } from "vitest";
import type { CardEffect, GameData } from "../types/game";
import { executeEffect } from "./CardEffectSystem";

describe("CardEffectSystem", () => {
	let mockState: GameData;

	beforeEach(() => {
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
			enemies: [
				{
					id: "enemy1",
					type: "ENEMY",
					position: 10,
					stats: {
						hp: 20,
						maxHp: 20,
						speed: 5,
						range: 2,
						damage: 2,
						attackSpeed: 1,
					},
					state: "WALKING",
					attackCooldown: 0,
					statusEffects: [],
				},
			],
			summons: [],
			projectiles: [],
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
			isRunning: true,
			tickCount: 0,
			time: 0,
		};
	});

	it("should execute DAMAGE effect", () => {
		const effect: CardEffect = {
			type: "DAMAGE",
			target: "ENEMY",
			damage: 10,
			damageType: "MAGICAL",
		};

		executeEffect(mockState, effect, "card1");
		expect(mockState.enemies[0].stats.hp).toBe(10); // 20 - 10
	});

	it("should execute HEAL effect", () => {
		mockState.tower.stats.hp = 50;
		const effect: CardEffect = {
			type: "HEAL",
			target: "TOWER",
			heal: 20,
		};

		executeEffect(mockState, effect, "card1");
		expect(mockState.tower.stats.hp).toBe(70);
	});

	it("should cap HEAL effect at maxHp", () => {
		mockState.tower.stats.hp = 90;
		mockState.tower.stats.maxHp = 100;
		const effect: CardEffect = {
			type: "HEAL",
			target: "TOWER",
			heal: 20,
		};

		executeEffect(mockState, effect, "card1");
		expect(mockState.tower.stats.hp).toBe(100);
	});

	it("should execute STATUS effect", () => {
		const effect: CardEffect = {
			type: "STATUS",
			target: "ENEMY",
			statusType: "SLOW",
			statusDuration: 3,
			statusIntensity: 0.5,
		};

		executeEffect(mockState, effect, "card1");
		expect(mockState.enemies[0].statusEffects).toHaveLength(1);
		expect(mockState.enemies[0].statusEffects[0].type).toBe("SLOW");
	});

	it("should execute SUMMON effect", () => {
		const effect: CardEffect = {
			type: "SUMMON",
			target: "SELF",
			summonDefId: "skeleton",
		};

		executeEffect(mockState, effect, "card1");
		expect(mockState.summons).toHaveLength(1);
		expect(mockState.summons[0].type).toBe("SUMMON");
	});

	it("should execute RESOURCE effect", () => {
		mockState.mana = 5;
		const effect: CardEffect = {
			type: "RESOURCE",
			target: "SELF",
			manaGain: 3,
		};

		executeEffect(mockState, effect, "card1");
		expect(mockState.mana).toBe(8);
	});

	it("should execute ESSENCE effect", () => {
		const effect: CardEffect = {
			type: "ESSENCE",
			target: "SELF",
			essence: 5,
		};

		executeEffect(mockState, effect, "card1");
		expect(mockState.essence).toBe(5);
	});

	it("should execute DRAW effect", () => {
		mockState.drawPile = [
			{
				id: "c1",
				defId: "spell_fireball",
				zone: "DRAW",
				currentCost: 3,
				name: "Fireball",
			},
			{
				id: "c2",
				defId: "spell_zap",
				zone: "DRAW",
				currentCost: 1,
				name: "Zap",
			},
		];

		const effect: CardEffect = {
			type: "DRAW",
			target: "SELF",
			drawCount: 1,
		};

		executeEffect(mockState, effect, "card1");
		expect(mockState.hand).toHaveLength(1);
		expect(mockState.drawPile).toHaveLength(1);
	});

	it("should execute BUFF effect", () => {
		mockState.summons = [
			{
				id: "s1",
				type: "SUMMON",
				position: 0,
				stats: {
					hp: 10,
					maxHp: 10,
					speed: 1,
					range: 1,
					damage: 2,
					attackSpeed: 1,
				},
				state: "IDLE",
				attackCooldown: 0,
				statusEffects: [],
			},
		];

		const effect: CardEffect = {
			type: "BUFF",
			target: "ALL_SUMMONS",
			statModifier: {
				stat: "damage",
				value: 2,
				duration: 5,
			},
		};

		executeEffect(mockState, effect, "card1");
		expect(mockState.summons[0].stats.damage).toBe(4); // 2 + 2
	});

	it("should handle target death gracefully during execution", () => {
		// This is a bit tricky to mock directly without mocking getTargets or processDamage
		// But we can ensure that if getTargets returns an empty array (simulating death/removal), nothing crashes

		const effect: CardEffect = {
			type: "DAMAGE",
			target: "ENEMY",
			damage: 10,
		};

		// No enemies in state
		mockState.enemies = [];

		expect(() => executeEffect(mockState, effect, "card1")).not.toThrow();
	});
});
