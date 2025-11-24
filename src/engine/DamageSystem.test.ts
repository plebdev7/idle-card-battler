import { beforeEach, describe, expect, it } from "vitest";
import type { DamageEvent, Entity } from "../types/game";
import { processDamage } from "./DamageSystem";

describe("DamageSystem", () => {
	let source: Entity;
	let target: Entity;

	beforeEach(() => {
		source = {
			id: "source",
			type: "TOWER",
			position: 0,
			state: "IDLE",
			attackCooldown: 0,
			stats: {
				hp: 100,
				maxHp: 100,
				speed: 1,
				range: 1,
				damage: 5,
				attackSpeed: 1,
			},
			statusEffects: [],
		};

		target = {
			id: "target",
			type: "ENEMY",
			position: 10,
			state: "WALKING",
			attackCooldown: 0,
			stats: {
				hp: 100,
				maxHp: 100,
				speed: 1,
				range: 1,
				damage: 5,
				attackSpeed: 1,
			},
			statusEffects: [],
		};
	});

	it("should apply base physical damage correctly", () => {
		const event: DamageEvent = {
			sourceId: source.id,
			targetId: target.id,
			amount: 10,
			type: "PHYSICAL",
		};

		const damage = processDamage(event, source, target);
		expect(damage).toBe(10);
		expect(target.stats.hp).toBe(90);
	});

	it("should apply armor mitigation", () => {
		target.stats.armor = 5;
		const event: DamageEvent = {
			sourceId: source.id,
			targetId: target.id,
			amount: 10,
			type: "PHYSICAL",
		};

		const damage = processDamage(event, source, target);
		expect(damage).toBe(5); // 10 - 5
		expect(target.stats.hp).toBe(95);
	});

	it("should ensure minimum 1 damage even with high armor", () => {
		target.stats.armor = 20;
		const event: DamageEvent = {
			sourceId: source.id,
			targetId: target.id,
			amount: 10,
			type: "PHYSICAL",
		};

		const damage = processDamage(event, source, target);
		expect(damage).toBe(1);
		expect(target.stats.hp).toBe(99);
	});

	it("should ignore armor for TRUE damage", () => {
		target.stats.armor = 20;
		const event: DamageEvent = {
			sourceId: source.id,
			targetId: target.id,
			amount: 10,
			type: "TRUE",
		};

		const damage = processDamage(event, source, target);
		expect(damage).toBe(10);
		expect(target.stats.hp).toBe(90);
	});

	it("should apply magic resist for MAGICAL damage", () => {
		target.stats.magicResist = 5;
		const event: DamageEvent = {
			sourceId: source.id,
			targetId: target.id,
			amount: 10,
			type: "MAGICAL",
		};

		const damage = processDamage(event, source, target);
		expect(damage).toBe(5);
		expect(target.stats.hp).toBe(95);
	});

	it("should apply source damage amp", () => {
		source.stats.damageAmp = 0.5; // +50%
		const event: DamageEvent = {
			sourceId: source.id,
			targetId: target.id,
			amount: 10,
			type: "PHYSICAL",
		};

		const damage = processDamage(event, source, target);
		expect(damage).toBe(15);
		expect(target.stats.hp).toBe(85);
	});

	it("should apply target damage taken amp", () => {
		target.stats.damageTakenAmp = 0.2; // +20% taken
		const event: DamageEvent = {
			sourceId: source.id,
			targetId: target.id,
			amount: 10,
			type: "PHYSICAL",
		};

		const damage = processDamage(event, source, target);
		expect(damage).toBe(12);
		expect(target.stats.hp).toBe(88);
	});

	it("should apply critical hit multiplier", () => {
		const event: DamageEvent = {
			sourceId: source.id,
			targetId: target.id,
			amount: 10,
			type: "PHYSICAL",
			isCritical: true,
		};

		const damage = processDamage(event, source, target);
		expect(damage).toBe(15); // 10 * 1.5
		expect(target.stats.hp).toBe(85);
	});

	it("should set state to DYING when HP reaches 0", () => {
		const event: DamageEvent = {
			sourceId: source.id,
			targetId: target.id,
			amount: 100,
			type: "TRUE",
		};

		processDamage(event, source, target);
		expect(target.stats.hp).toBe(0);
		expect(target.state).toBe("DYING");
	});
});
