import { beforeEach, describe, expect, it, vi } from "vitest";
import { ENEMY_DEFINITIONS, SUMMON_DEFINITIONS } from "../data/enemies";
import { createEnemy, createSummon } from "./EntityFactory";

describe("EntityFactory", () => {
	beforeEach(() => {
		// Mock crypto.randomUUID
		vi.stubGlobal("crypto", {
			randomUUID: () => "test-uuid",
		});
	});

	describe("createEnemy", () => {
		it("creates an enemy with correct stats for a valid ID", () => {
			const enemy = createEnemy("SKELETON_GRUNT", 100);
			const def = ENEMY_DEFINITIONS.SKELETON_GRUNT;

			expect(enemy.id).toBe("enemy_test-uuid");
			expect(enemy.type).toBe("ENEMY");
			expect(enemy.position).toBe(100);
			expect(enemy.stats).toEqual(def.stats);
			expect(enemy.baseStats).toEqual(def.stats);
			expect(enemy.state).toBe("WALKING");
			expect(enemy.attackCooldown).toBe(0);
			expect(enemy.statusEffects).toEqual([]);
		});

		it("falls back to BASIC_ENEMY for an invalid ID", () => {
			const enemy = createEnemy("INVALID_ID", 50);
			const def = ENEMY_DEFINITIONS.BASIC_ENEMY;

			expect(enemy.stats).toEqual(def.stats);
		});

		it("creates a deep copy of stats", () => {
			const enemy = createEnemy("BASIC_ENEMY", 0);
			enemy.stats.hp = 999;

			expect(ENEMY_DEFINITIONS.BASIC_ENEMY.stats.hp).not.toBe(999);
		});
	});

	describe("createSummon", () => {
		it("creates a summon with correct stats for a valid ID", () => {
			const summon = createSummon("skeleton", 20);
			const def = SUMMON_DEFINITIONS.skeleton;

			expect(summon.id).toBe("summon_test-uuid");
			expect(summon.type).toBe("SUMMON");
			expect(summon.position).toBe(20);
			expect(summon.stats).toEqual(def.stats);
			expect(summon.baseStats).toEqual(def.stats);
			expect(summon.state).toBe("IDLE");
			expect(summon.attackCooldown).toBe(0);
			expect(summon.statusEffects).toEqual([]);
		});

		it("falls back to BASIC_SUMMON for an invalid ID", () => {
			const summon = createSummon("INVALID_ID", 10);
			const def = SUMMON_DEFINITIONS.BASIC_SUMMON;

			expect(summon.stats).toEqual(def.stats);
		});
	});
});
