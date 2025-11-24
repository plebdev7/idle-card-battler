import { beforeEach, describe, expect, it } from "vitest";
import type { Entity, GameData, StatusEffect } from "../types/game";
import { applyStatusEffect, updateStatusEffects } from "./StatusEffectSystem";

describe("StatusEffectSystem", () => {
	let entity: Entity;
	let state: GameData;

	beforeEach(() => {
		entity = {
			id: "e1",
			type: "ENEMY",
			position: 0,
			state: "WALKING",
			attackCooldown: 0,
			stats: {
				hp: 100,
				maxHp: 100,
				speed: 10,
				range: 0,
				damage: 0,
				attackSpeed: 0,
			},
			statusEffects: [],
		};

		state = {
			enemies: [entity],
			summons: [],
			projectiles: [],
			gold: 0,
			mana: 0,
			maxMana: 10,
			manaRegen: 1,
			tower: {
				id: "tower",
				type: "TOWER",
				position: 0,
				stats: {
					hp: 100,
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
			hand: [],
			drawPile: [],
			discardPile: [],
			voidPile: [],
			drawTimer: 0,
			drawSpeed: 0,
			maxHandSize: 0,
			wave: { current: 1, total: 1, status: "ACTIVE" },
			isRunning: true,
			tickCount: 0,
			time: 0,
		};
	});

	it("should initialize baseStats on first update", () => {
		updateStatusEffects(state, 1);
		expect(entity.baseStats).toBeDefined();
		expect(entity.baseStats?.speed).toBe(10);
	});

	it("should apply SLOW effect", () => {
		const slow: StatusEffect = {
			id: "s1",
			type: "SLOW",
			duration: 5,
			intensity: 0.5, // 50% slow
		};
		applyStatusEffect(entity, slow);
		updateStatusEffects(state, 1);

		expect(entity.stats.speed).toBe(5); // 10 * 0.5
	});

	it("should use strongest SLOW effect", () => {
		const slow1: StatusEffect = {
			id: "s1",
			type: "SLOW",
			duration: 5,
			intensity: 0.5,
		};
		const slow2: StatusEffect = {
			id: "s2",
			type: "SLOW",
			duration: 5,
			intensity: 0.2,
		};

		applyStatusEffect(entity, slow1);
		applyStatusEffect(entity, slow2);
		updateStatusEffects(state, 1);

		expect(entity.stats.speed).toBe(5); // 0.5 is stronger
	});

	it("should apply STUN effect", () => {
		const stun: StatusEffect = {
			id: "st1",
			type: "STUN",
			duration: 2,
			intensity: 1,
		};
		applyStatusEffect(entity, stun);
		updateStatusEffects(state, 1);

		expect(entity.state).toBe("STUNNED");
	});

	it("should extend STUN duration", () => {
		const stun1: StatusEffect = {
			id: "st1",
			type: "STUN",
			duration: 2,
			intensity: 1,
		};
		const stun2: StatusEffect = {
			id: "st2",
			type: "STUN",
			duration: 3,
			intensity: 1,
		};

		applyStatusEffect(entity, stun1);
		applyStatusEffect(entity, stun2);

		expect(entity.statusEffects.length).toBe(1);
		expect(entity.statusEffects[0].duration).toBe(5);
	});

	it("should apply POISON damage over time", () => {
		const poison: StatusEffect = {
			id: "p1",
			type: "POISON",
			duration: 5,
			intensity: 10, // 10 damage per sec
		};
		applyStatusEffect(entity, poison);

		// Tick 1s
		updateStatusEffects(state, 1);
		expect(entity.stats.hp).toBe(90);

		// Tick 1s
		updateStatusEffects(state, 1);
		expect(entity.stats.hp).toBe(80);
	});

	it("should remove expired effects", () => {
		const slow: StatusEffect = {
			id: "s1",
			type: "SLOW",
			duration: 1,
			intensity: 0.5,
		};
		applyStatusEffect(entity, slow);

		updateStatusEffects(state, 0.5); // 0.5s left
		expect(entity.statusEffects.length).toBe(1);
		expect(entity.stats.speed).toBe(5);

		updateStatusEffects(state, 0.6); // Expired
		expect(entity.statusEffects.length).toBe(0);
		expect(entity.stats.speed).toBe(10); // Restore to base
	});
});
