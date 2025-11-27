import { beforeEach, describe, expect, it } from "vitest";
import type { Entity, GameData } from "../types/game";
import { updateProjectiles } from "./ProjectileSystem";

describe("ProjectileSystem", () => {
	let state: GameData;

	beforeEach(() => {
		state = {
			projectiles: [],
			enemies: [],
			// ... minimal mock state
			gold: 0,
			mana: 0,
			maxMana: 10,
			manaRegen: 1,
			essence: 0,
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
			summons: [],
			hand: [],
			drawPile: [],
			discardPile: [],
			voidPile: [],
			drawTimer: 0,
			drawSpeed: 0,
			maxHandSize: 0,
			wave: {
				current: 1,
				total: 5,
				phase: "COMPLETED",
				phaseTimer: 0,
				floor: 1,
				spawnQueue: [],
			},
			autoContinue: true,
			autoContinueDelay: 3,
			autoContinueTimer: 0,
			isRunning: true,
			tickCount: 0,
			time: 0,
		};
	});

	it("should move LINEAR projectiles", () => {
		const proj: Entity = {
			id: "p1",
			type: "PROJECTILE",
			position: 10,
			state: "WALKING",
			attackCooldown: 0,
			stats: { hp: 1, maxHp: 1, speed: 5, range: 0, damage: 0, attackSpeed: 0 },
			projectileData: {
				type: "LINEAR",
				hitRadius: 1,
				damage: 10,
				damageType: "PHYSICAL",
			},
			statusEffects: [],
		};
		state.projectiles.push(proj);

		updateProjectiles(state, 1); // dt = 1s

		expect(proj.position).toBe(15);
	});

	it("should move HOMING projectiles towards target", () => {
		const enemy: Entity = {
			id: "e1",
			type: "ENEMY",
			position: 20,
			state: "WALKING",
			attackCooldown: 0,
			stats: {
				hp: 100,
				maxHp: 100,
				speed: 0,
				range: 0,
				damage: 0,
				attackSpeed: 0,
			},
			statusEffects: [],
		};
		state.enemies.push(enemy);

		const proj: Entity = {
			id: "p1",
			type: "PROJECTILE",
			position: 10,
			state: "WALKING",
			attackCooldown: 0,
			targetId: "e1",
			stats: { hp: 1, maxHp: 1, speed: 5, range: 0, damage: 0, attackSpeed: 0 },
			projectileData: {
				type: "HOMING",
				hitRadius: 1,
				damage: 10,
				damageType: "PHYSICAL",
			},
			statusEffects: [],
		};
		state.projectiles.push(proj);

		updateProjectiles(state, 1);
		expect(proj.position).toBe(15); // Moved 5 towards 20
	});

	it("should handle collision and deal damage", () => {
		const enemy: Entity = {
			id: "e1",
			type: "ENEMY",
			position: 12,
			state: "WALKING",
			attackCooldown: 0,
			stats: {
				hp: 100,
				maxHp: 100,
				speed: 0,
				range: 0,
				damage: 0,
				attackSpeed: 0,
				armor: 0,
			},
			statusEffects: [],
		};
		state.enemies.push(enemy);

		const proj: Entity = {
			id: "p1",
			type: "PROJECTILE",
			position: 10,
			state: "WALKING",
			attackCooldown: 0,
			stats: { hp: 1, maxHp: 1, speed: 5, range: 0, damage: 0, attackSpeed: 0 },
			projectileData: {
				type: "LINEAR",
				hitRadius: 1,
				damage: 10,
				damageType: "PHYSICAL",
			},
			statusEffects: [],
		};
		state.projectiles.push(proj);

		// Move it to collide: 10 + 5 = 15. Enemy at 12.
		// Collision check: abs(12 - 15) = 3. Radius = 1 + 1 = 2. No collision yet?
		// Wait, logic is: move THEN check.
		// If it jumps over, we miss it. Simple collision.
		// Let's place it closer.
		proj.position = 11;

		updateProjectiles(state, 0.1); // Move to 11.5. Dist to 12 is 0.5. <= 2. Hit!

		expect(enemy.stats.hp).toBe(90);
		expect(proj.state).toBe("DEAD");
	});

	it("should cleanup out of bounds projectiles", () => {
		const proj: Entity = {
			id: "p1",
			type: "PROJECTILE",
			position: 120,
			state: "WALKING",
			attackCooldown: 0,
			stats: { hp: 1, maxHp: 1, speed: 5, range: 0, damage: 0, attackSpeed: 0 },
			projectileData: {
				type: "LINEAR",
				hitRadius: 1,
				damage: 10,
				damageType: "PHYSICAL",
			},
			statusEffects: [],
		};
		state.projectiles.push(proj);

		updateProjectiles(state, 1);
		expect(proj.state).toBe("DEAD");
	});

	it("should apply status effects on hit", () => {
		const enemy: Entity = {
			id: "e1",
			type: "ENEMY",
			position: 12,
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
		state.enemies.push(enemy);

		const proj: Entity = {
			id: "p1",
			type: "PROJECTILE",
			position: 10,
			state: "WALKING",
			attackCooldown: 0,
			stats: { hp: 1, maxHp: 1, speed: 5, range: 0, damage: 0, attackSpeed: 0 },
			projectileData: {
				type: "LINEAR",
				hitRadius: 1,
				damage: 10,
				damageType: "PHYSICAL",
				onHitEffects: [{ id: "s1", type: "SLOW", duration: 5, intensity: 0.5 }],
			},
			statusEffects: [],
		};
		state.projectiles.push(proj);

		// Move to collide
		updateProjectiles(state, 0.5); // 10 -> 12.5 (hits 12, dist 0.5 <= 2)

		expect(enemy.statusEffects).toHaveLength(1);
		expect(enemy.statusEffects[0].type).toBe("SLOW");
	});
});
