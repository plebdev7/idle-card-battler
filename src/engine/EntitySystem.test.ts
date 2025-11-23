import { describe, expect, it } from "vitest";
import type { Entity, GameData } from "../types/game";
import {
	cleanupDeadEntities,
	findEntitiesInRadius,
	findNearestEntity,
	isInAttackRange,
	updateEnemies,
	updateProjectiles,
	updateSummons,
} from "./EntitySystem";

// Helper to create a mock entity
const createEntity = (
	id: string,
	type: Entity["type"],
	position: number,
	overrides: Partial<Entity> = {},
): Entity => ({
	id,
	type,
	position,
	state: "WALKING",
	stats: {
		hp: 10,
		maxHp: 10,
		speed: 10,
		range: 5,
		damage: 1,
		attackSpeed: 1,
		...overrides.stats,
	},
	attackCooldown: 0,
	...overrides,
});

// Helper to create a mock game state
const createGameState = (overrides: Partial<GameData> = {}): GameData => ({
	gold: 0,
	mana: 0,
	maxMana: 10,
	manaRegen: 1,
	tower: createEntity("tower", "TOWER", 0, {
		state: "IDLE",
		stats: {
			hp: 100,
			maxHp: 100,
			speed: 0,
			range: 0,
			damage: 0,
			attackSpeed: 0,
		},
	}),
	enemies: [],
	summons: [],
	projectiles: [],
	hand: [],
	drawPile: [],
	discardPile: [],
	voidPile: [],
	drawTimer: 0,
	drawSpeed: 1,
	maxHandSize: 5,
	wave: { current: 1, total: 1, status: "ACTIVE" },
	isRunning: true,
	tickCount: 0,
	time: 0,
	...overrides,
});

describe("EntitySystem", () => {
	describe("Spatial Queries", () => {
		it("findEntitiesInRadius returns entities within range", () => {
			const e1 = createEntity("e1", "ENEMY", 10);
			const e2 = createEntity("e2", "ENEMY", 20);
			const e3 = createEntity("e3", "ENEMY", 30);
			const entities = [e1, e2, e3];

			const result = findEntitiesInRadius(15, 6, entities);
			expect(result).toContain(e1);
			expect(result).toContain(e2);
			expect(result).not.toContain(e3);
		});

		it("findNearestEntity returns the closest entity", () => {
			const e1 = createEntity("e1", "ENEMY", 10);
			const e2 = createEntity("e2", "ENEMY", 20);
			const entities = [e1, e2];

			const result = findNearestEntity(18, entities);
			expect(result).toBe(e2);
		});

		it("findNearestEntity respects filter", () => {
			const e1 = createEntity("e1", "ENEMY", 10);
			const e2 = createEntity("e2", "ENEMY", 20); // Closest but ignored
			const entities = [e1, e2];

			const result = findNearestEntity(18, entities, (e) => e.id !== "e2");
			expect(result).toBe(e1);
		});

		it("isInAttackRange checks range correctly", () => {
			const attacker = createEntity("a", "ENEMY", 10, {
				stats: {
					range: 5,
					speed: 0,
					hp: 10,
					maxHp: 10,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const targetInRange = createEntity("t1", "TOWER", 14);
			const targetOutOfRange = createEntity("t2", "TOWER", 16);

			expect(isInAttackRange(attacker, targetInRange)).toBe(true);
			expect(isInAttackRange(attacker, targetOutOfRange)).toBe(false);
		});

		it("findNearestEntity returns null when no entities exist", () => {
			const result = findNearestEntity(10, []);
			expect(result).toBeNull();
		});

		it("findNearestEntity works with Entity as 'from' parameter", () => {
			const sourceEntity = createEntity("source", "SUMMON", 15);
			const e1 = createEntity("e1", "ENEMY", 10);
			const e2 = createEntity("e2", "ENEMY", 20);

			const result = findNearestEntity(sourceEntity, [e1, e2]);
			expect(result).toBe(e1); // 15-10=5 vs 20-15=5, but e1 comes first
		});

		it("findEntitiesInRadius with radius 0 returns exact position", () => {
			const e1 = createEntity("e1", "ENEMY", 10);
			const e2 = createEntity("e2", "ENEMY", 10);
			const e3 = createEntity("e3", "ENEMY", 11);

			const result = findEntitiesInRadius(10, 0, [e1, e2, e3]);
			expect(result).toContain(e1);
			expect(result).toContain(e2);
			expect(result).not.toContain(e3);
		});
	});

	describe("updateEnemies", () => {
		it("moves enemies towards tower (0)", () => {
			const enemy = createEntity("e1", "ENEMY", 50, {
				stats: {
					speed: 10,
					hp: 10,
					maxHp: 10,
					range: 5,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ enemies: [enemy] });

			updateEnemies(state, 1.0); // 1 second

			expect(enemy.position).toBe(40); // 50 - 10
		});

		it("stops enemies at tower (0)", () => {
			const enemy = createEntity("e1", "ENEMY", 5, {
				stats: {
					speed: 10,
					hp: 10,
					maxHp: 10,
					range: 5,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ enemies: [enemy] });

			updateEnemies(state, 1.0);

			expect(enemy.position).toBe(0);
		});

		it("transitions to ATTACKING when in range of Tower", () => {
			const enemy = createEntity("e1", "ENEMY", 6, {
				stats: {
					speed: 10,
					range: 5,
					hp: 10,
					maxHp: 10,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ enemies: [enemy] });

			// Move closer to be in range (6 - 10 < 0, clamped to 0)
			// But wait, logic is: Move -> Check Range.
			// If pos becomes 0, dist is 0, range 5. Should attack.

			updateEnemies(state, 1.0);

			expect(enemy.position).toBe(0);
			expect(enemy.state).toBe("ATTACKING");
			expect(enemy.targetId).toBe(state.tower.id);
		});

		it("transitions to ATTACKING when in range of Summon", () => {
			const summon = createEntity("s1", "SUMMON", 40);
			const enemy = createEntity("e1", "ENEMY", 50, {
				stats: {
					speed: 10,
					range: 5,
					hp: 10,
					maxHp: 10,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ enemies: [enemy], summons: [summon] });

			// Move to 40. Range 5.
			updateEnemies(state, 1.0);

			expect(enemy.position).toBe(40);
			expect(enemy.state).toBe("ATTACKING");
			expect(enemy.targetId).toBe(summon.id);
		});

		it("skips DEAD enemies", () => {
			const enemy = createEntity("e1", "ENEMY", 50, { state: "DEAD" });
			const state = createGameState({ enemies: [enemy] });

			updateEnemies(state, 1.0);

			expect(enemy.position).toBe(50); // No movement
		});

		it("skips DYING enemies", () => {
			const enemy = createEntity("e1", "ENEMY", 50, { state: "DYING" });
			const state = createGameState({ enemies: [enemy] });

			updateEnemies(state, 1.0);

			expect(enemy.position).toBe(50); // No movement
		});

		it("skips STUNNED enemies", () => {
			const enemy = createEntity("e1", "ENEMY", 50, {
				state: "STUNNED",
				stats: {
					speed: 10,
					hp: 10,
					maxHp: 10,
					range: 5,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ enemies: [enemy] });

			updateEnemies(state, 1.0);

			expect(enemy.position).toBe(50); // No movement
			expect(enemy.state).toBe("STUNNED");
		});

		it("decrements attack cooldown", () => {
			const enemy = createEntity("e1", "ENEMY", 50, {
				attackCooldown: 2.0,
			});
			const state = createGameState({ enemies: [enemy] });

			updateEnemies(state, 0.5);

			expect(enemy.attackCooldown).toBe(1.5);
		});

		it("triggers attack when cooldown reaches 0", () => {
			const enemy = createEntity("e1", "ENEMY", 3, {
				state: "ATTACKING",
				attackCooldown: 0,
				targetId: "tower",
				stats: {
					range: 5,
					attackSpeed: 2,
					speed: 10,
					hp: 10,
					maxHp: 10,
					damage: 1,
				},
			});
			const state = createGameState({ enemies: [enemy] });

			updateEnemies(state, 1.0);

			expect(enemy.attackCooldown).toBeCloseTo(0.5); // 1 / attackSpeed = 1/2
		});

		it("does not attack when cooldown > 0", () => {
			const enemy = createEntity("e1", "ENEMY", 3, {
				state: "ATTACKING",
				attackCooldown: 0.5,
				targetId: "tower",
				stats: {
					range: 5,
					attackSpeed: 2,
					speed: 10,
					hp: 10,
					maxHp: 10,
					damage: 1,
				},
			});
			const state = createGameState({ enemies: [enemy] });

			updateEnemies(state, 0.3);

			expect(enemy.attackCooldown).toBeCloseTo(0.2);
		});

		it("transitions back to WALKING when target is lost", () => {
			const enemy = createEntity("e1", "ENEMY", 50, {
				state: "ATTACKING",
				targetId: "nonexistent",
			});
			const state = createGameState({ enemies: [enemy] });

			updateEnemies(state, 1.0);

			expect(enemy.state).toBe("WALKING");
			expect(enemy.targetId).toBeUndefined();
		});

		it("transitions back to WALKING when target is DEAD", () => {
			const summon = createEntity("s1", "SUMMON", 50, { state: "DEAD" });
			const enemy = createEntity("e1", "ENEMY", 50, {
				state: "ATTACKING",
				targetId: "s1",
			});
			const state = createGameState({ enemies: [enemy], summons: [summon] });

			updateEnemies(state, 1.0);

			expect(enemy.state).toBe("WALKING");
			expect(enemy.targetId).toBeUndefined();
		});

		it("transitions back to WALKING when target out of range", () => {
			const summon = createEntity("s1", "SUMMON", 100);
			const enemy = createEntity("e1", "ENEMY", 50, {
				state: "ATTACKING",
				targetId: "s1",
				stats: {
					range: 5,
					speed: 10,
					hp: 10,
					maxHp: 10,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ enemies: [enemy], summons: [summon] });

			updateEnemies(state, 1.0);

			expect(enemy.state).toBe("WALKING");
			expect(enemy.targetId).toBeUndefined();
		});
	});
	describe("updateSummons", () => {
		it("moves mobile summons towards enemies", () => {
			const summon = createEntity("s1", "SUMMON", 10, {
				stats: {
					speed: 10,
					hp: 10,
					maxHp: 10,
					range: 5,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ summons: [summon] });

			updateSummons(state, 1.0);

			expect(summon.position).toBe(20); // 10 + 10
		});

		it("stops mobile summons when in range of enemy", () => {
			const enemy = createEntity("e1", "ENEMY", 30);
			const summon = createEntity("s1", "SUMMON", 20, {
				stats: {
					speed: 10,
					range: 5,
					hp: 10,
					maxHp: 10,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ summons: [summon], enemies: [enemy] });

			// Move to 30? No, check logic.
			// Logic: Move -> Check.
			// 20 + 10 = 30. Dist 0. Range 5. Attack.
			updateSummons(state, 1.0);

			expect(summon.position).toBe(30);
			expect(summon.state).toBe("ATTACKING");
			expect(summon.targetId).toBe(enemy.id);
		});

		it("skips DEAD summons", () => {
			const summon = createEntity("s1", "SUMMON", 20, { state: "DEAD" });
			const state = createGameState({ summons: [summon] });

			updateSummons(state, 1.0);

			expect(summon.position).toBe(20); // No movement
		});

		it("skips DYING summons", () => {
			const summon = createEntity("s1", "SUMMON", 20, { state: "DYING" });
			const state = createGameState({ summons: [summon] });

			updateSummons(state, 1.0);

			expect(summon.position).toBe(20); // No movement
		});

		it("skips STUNNED summons", () => {
			const summon = createEntity("s1", "SUMMON", 20, {
				state: "STUNNED",
				stats: {
					speed: 10,
					hp: 10,
					maxHp: 10,
					range: 5,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ summons: [summon] });

			updateSummons(state, 1.0);

			expect(summon.position).toBe(20); // No movement
			expect(summon.state).toBe("STUNNED");
		});

		it("stationary summons (speed=0) stay at IDLE", () => {
			const summon = createEntity("s1", "SUMMON", 20, {
				state: "IDLE",
				stats: {
					speed: 0,
					hp: 10,
					maxHp: 10,
					range: 5,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ summons: [summon] });

			updateSummons(state, 1.0);

			expect(summon.position).toBe(20); // No movement
			expect(summon.state).toBe("IDLE");
		});

		it("stationary summons can attack when enemy in range", () => {
			const enemy = createEntity("e1", "ENEMY", 24);
			const summon = createEntity("s1", "SUMMON", 20, {
				state: "IDLE",
				stats: {
					speed: 0,
					range: 5,
					hp: 10,
					maxHp: 10,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ summons: [summon], enemies: [enemy] });

			updateSummons(state, 1.0);

			expect(summon.state).toBe("ATTACKING");
			expect(summon.targetId).toBe(enemy.id);
		});

		it("decrements attack cooldown for summons", () => {
			const summon = createEntity("s1", "SUMMON", 20, {
				attackCooldown: 2.0,
			});
			const state = createGameState({ summons: [summon] });

			updateSummons(state, 0.5);

			expect(summon.attackCooldown).toBe(1.5);
		});

		it("triggers attack when cooldown reaches 0", () => {
			const enemy = createEntity("e1", "ENEMY", 24);
			const summon = createEntity("s1", "SUMMON", 20, {
				state: "ATTACKING",
				attackCooldown: 0,
				targetId: "e1",
				stats: {
					range: 5,
					attackSpeed: 2,
					speed: 10,
					hp: 10,
					maxHp: 10,
					damage: 1,
				},
			});
			const state = createGameState({ summons: [summon], enemies: [enemy] });

			updateSummons(state, 1.0);

			expect(summon.attackCooldown).toBeCloseTo(0.5); // 1 / attackSpeed = 1/2
		});

		it("mobile summon transitions to WALKING when target lost", () => {
			const summon = createEntity("s1", "SUMMON", 20, {
				state: "ATTACKING",
				targetId: "nonexistent",
				stats: {
					speed: 10,
					hp: 10,
					maxHp: 10,
					range: 5,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ summons: [summon] });

			updateSummons(state, 1.0);

			expect(summon.state).toBe("WALKING");
			expect(summon.targetId).toBeUndefined();
		});

		it("stationary summon transitions to IDLE when target lost", () => {
			const summon = createEntity("s1", "SUMMON", 20, {
				state: "ATTACKING",
				targetId: "nonexistent",
				stats: {
					speed: 0,
					hp: 10,
					maxHp: 10,
					range: 5,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ summons: [summon] });

			updateSummons(state, 1.0);

			expect(summon.state).toBe("IDLE");
			expect(summon.targetId).toBeUndefined();
		});

		it("transitions back to appropriate state when target is DEAD", () => {
			const enemy = createEntity("e1", "ENEMY", 24, { state: "DEAD" });
			const summon = createEntity("s1", "SUMMON", 20, {
				state: "ATTACKING",
				targetId: "e1",
				stats: {
					speed: 10,
					hp: 10,
					maxHp: 10,
					range: 5,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ summons: [summon], enemies: [enemy] });

			updateSummons(state, 1.0);

			expect(summon.state).toBe("WALKING"); // Mobile, so goes to WALKING
			expect(summon.targetId).toBeUndefined();
		});

		it("transitions when target out of range", () => {
			const enemy = createEntity("e1", "ENEMY", 100);
			const summon = createEntity("s1", "SUMMON", 20, {
				state: "ATTACKING",
				targetId: "e1",
				stats: {
					speed: 10,
					range: 5,
					hp: 10,
					maxHp: 10,
					damage: 1,
					attackSpeed: 1,
				},
			});
			const state = createGameState({ summons: [summon], enemies: [enemy] });

			updateSummons(state, 1.0);

			expect(summon.state).toBe("WALKING");
			expect(summon.targetId).toBeUndefined();
		});
	});

	describe("updateProjectiles", () => {
		it("moves projectiles forward", () => {
			const projectile = createEntity("p1", "PROJECTILE", 10, {
				stats: {
					speed: 20,
					hp: 1,
					maxHp: 1,
					range: 0,
					damage: 5,
					attackSpeed: 0,
				},
			});
			const state = createGameState({ projectiles: [projectile] });

			updateProjectiles(state, 1.0);

			expect(projectile.position).toBe(30); // 10 + 20
		});

		it("detects collision with enemy", () => {
			const enemy = createEntity("e1", "ENEMY", 15);
			const projectile = createEntity("p1", "PROJECTILE", 14, {
				stats: {
					speed: 1,
					hp: 1,
					maxHp: 1,
					range: 0,
					damage: 5,
					attackSpeed: 0,
				},
			});
			const state = createGameState({
				enemies: [enemy],
				projectiles: [projectile],
			});

			updateProjectiles(state, 1.0);

			// Projectile moves from 14 to 15, hits enemy at 15 (distance = 0 <= hitRadius 1)
			expect(projectile.state).toBe("DEAD");
		});

		it("marks projectile DEAD when out of bounds (>100)", () => {
			const projectile = createEntity("p1", "PROJECTILE", 95, {
				stats: {
					speed: 20,
					hp: 1,
					maxHp: 1,
					range: 0,
					damage: 5,
					attackSpeed: 0,
				},
			});
			const state = createGameState({ projectiles: [projectile] });

			updateProjectiles(state, 1.0);

			expect(projectile.position).toBeGreaterThan(100);
			expect(projectile.state).toBe("DEAD");
		});

		it("marks projectile DEAD when out of bounds (<0)", () => {
			const projectile = createEntity("p1", "PROJECTILE", 5, {
				stats: {
					speed: -20,
					hp: 1,
					maxHp: 1,
					range: 0,
					damage: 5,
					attackSpeed: 0,
				},
			});
			const state = createGameState({ projectiles: [projectile] });

			updateProjectiles(state, 1.0);

			expect(projectile.position).toBeLessThan(0);
			expect(projectile.state).toBe("DEAD");
		});

		it("skips DEAD projectiles", () => {
			const projectile = createEntity("p1", "PROJECTILE", 10, {
				state: "DEAD",
				stats: {
					speed: 20,
					hp: 1,
					maxHp: 1,
					range: 0,
					damage: 5,
					attackSpeed: 0,
				},
			});
			const state = createGameState({ projectiles: [projectile] });

			updateProjectiles(state, 1.0);

			expect(projectile.position).toBe(10); // No movement
		});

		it("does not hit DEAD enemies", () => {
			const enemy = createEntity("e1", "ENEMY", 25, { state: "DEAD" });
			const projectile = createEntity("p1", "PROJECTILE", 24, {
				stats: {
					speed: 20,
					hp: 1,
					maxHp: 1,
					range: 0,
					damage: 5,
					attackSpeed: 0,
				},
			});
			const state = createGameState({
				enemies: [enemy],
				projectiles: [projectile],
			});

			updateProjectiles(state, 1.0);

			// Projectile moves to 44, which is past the enemy, so it continues
			expect(projectile.position).toBe(44);
			expect(projectile.state).toBe("WALKING"); // Still alive, continues flying
		});
	});

	describe("cleanupDeadEntities", () => {
		it("removes DEAD enemies", () => {
			const enemy1 = createEntity("e1", "ENEMY", 10, { state: "DEAD" });
			const enemy2 = createEntity("e2", "ENEMY", 20);
			const state = createGameState({ enemies: [enemy1, enemy2] });

			cleanupDeadEntities(state);

			expect(state.enemies).toHaveLength(1);
			expect(state.enemies[0]).toBe(enemy2);
		});

		it("removes DEAD summons", () => {
			const summon1 = createEntity("s1", "SUMMON", 10, { state: "DEAD" });
			const summon2 = createEntity("s2", "SUMMON", 20);
			const state = createGameState({ summons: [summon1, summon2] });

			cleanupDeadEntities(state);

			expect(state.summons).toHaveLength(1);
			expect(state.summons[0]).toBe(summon2);
		});

		it("removes DEAD projectiles", () => {
			const proj1 = createEntity("p1", "PROJECTILE", 10, { state: "DEAD" });
			const proj2 = createEntity("p2", "PROJECTILE", 20);
			const state = createGameState({ projectiles: [proj1, proj2] });

			cleanupDeadEntities(state);

			expect(state.projectiles).toHaveLength(1);
			expect(state.projectiles[0]).toBe(proj2);
		});

		it("preserves non-DEAD entities", () => {
			const enemy1 = createEntity("e1", "ENEMY", 10, { state: "WALKING" });
			const enemy2 = createEntity("e2", "ENEMY", 20, { state: "ATTACKING" });
			const enemy3 = createEntity("e3", "ENEMY", 30, { state: "DYING" });
			const state = createGameState({ enemies: [enemy1, enemy2, enemy3] });

			cleanupDeadEntities(state);

			expect(state.enemies).toHaveLength(3); // All preserved (DYING is not DEAD)
		});
	});
});
