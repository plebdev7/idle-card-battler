import { ENEMY_DEFINITIONS, SUMMON_DEFINITIONS } from "../data/enemies";
import type { Entity } from "../types/game";

export function createEnemy(defId: string, position: number): Entity {
	const def = ENEMY_DEFINITIONS[defId] || ENEMY_DEFINITIONS.BASIC_ENEMY;
	const stats = { ...def.stats };

	return {
		id: `enemy_${crypto.randomUUID()}`,
		type: "ENEMY",
		position,
		stats,
		baseStats: { ...stats },
		state: "WALKING",
		attackCooldown: 0,
		statusEffects: [],
	};
}

export function createSummon(defId: string, position: number): Entity {
	const def = SUMMON_DEFINITIONS[defId] || SUMMON_DEFINITIONS.BASIC_SUMMON;
	const stats = { ...def.stats };

	return {
		id: `summon_${crypto.randomUUID()}`,
		type: "SUMMON",
		position,
		stats,
		baseStats: { ...stats },
		state: "IDLE", // Start idle
		attackCooldown: 0,
		statusEffects: [],
	};
}
