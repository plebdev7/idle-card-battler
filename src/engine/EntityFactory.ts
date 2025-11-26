import type { Entity } from "../types/game";

export function createEnemy(defId: string, position: number): Entity {
	// TODO: Refactor to data-driven approach - create src/data/enemies.ts with stat definitions
	// Basic stats based on defId
	// In a real app, this would come from a data file/database
	let stats = {
		hp: 10,
		maxHp: 10,
		speed: 5,
		range: 10,
		damage: 2,
		attackSpeed: 1.0,
	};

	if (defId === "SKELETON_GRUNT") {
		stats = {
			hp: 20,
			maxHp: 20,
			speed: 8,
			range: 5,
			damage: 3,
			attackSpeed: 0.8,
		};
	} else if (defId === "BONE_SHIELD") {
		stats = {
			hp: 50,
			maxHp: 50,
			speed: 3,
			range: 5,
			damage: 2,
			attackSpeed: 0.5,
		};
	}

	return {
		// TODO: Consider using crypto.randomUUID() or nanoid for guaranteed unique IDs
		id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		type: "ENEMY",
		position,
		stats,
		baseStats: { ...stats },
		state: "WALKING",
		attackCooldown: 0,
		statusEffects: [],
	};
}
