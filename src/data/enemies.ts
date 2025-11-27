import type { EntityStats } from "../types/game";

export interface EntityDefinition {
	id: string;
	name: string;
	stats: EntityStats;
}

export const ENEMY_DEFINITIONS: Record<string, EntityDefinition> = {
	BASIC_ENEMY: {
		id: "BASIC_ENEMY",
		name: "Basic Enemy",
		stats: {
			hp: 10,
			maxHp: 10,
			speed: 5,
			range: 10,
			damage: 2,
			attackSpeed: 1.0,
		},
	},
	SKELETON_GRUNT: {
		id: "SKELETON_GRUNT",
		name: "Skeleton Grunt",
		stats: {
			hp: 20,
			maxHp: 20,
			speed: 8,
			range: 5,
			damage: 3,
			attackSpeed: 0.8,
		},
	},
	BONE_SHIELD: {
		id: "BONE_SHIELD",
		name: "Bone Shield",
		stats: {
			hp: 50,
			maxHp: 50,
			speed: 3,
			range: 5,
			damage: 2,
			attackSpeed: 0.5,
		},
	},
};

export const SUMMON_DEFINITIONS: Record<string, EntityDefinition> = {
	BASIC_SUMMON: {
		id: "BASIC_SUMMON",
		name: "Basic Summon",
		stats: {
			hp: 10,
			maxHp: 10,
			speed: 0,
			range: 2,
			damage: 2,
			attackSpeed: 1.0,
		},
	},
	skeleton: {
		id: "skeleton",
		name: "Skeleton Warrior",
		stats: {
			hp: 10,
			maxHp: 10,
			speed: 5,
			range: 2,
			damage: 2,
			attackSpeed: 1.0,
		},
	},
};

// Legacy export for backward compatibility with tests
export const BASE_ENEMY_STATS = ENEMY_DEFINITIONS.BASIC_ENEMY.stats;
