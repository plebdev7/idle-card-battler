import type { Entity } from "../types/game";

export const BASE_ENEMY_STATS = {
	hp: 20,
	maxHp: 20,
	speed: 5,
	range: 10,
	damage: 5,
	attackSpeed: 1,
};

export function createEnemy(id: string, position: number = 100): Entity {
	return {
		id,
		type: "ENEMY",
		position,
		stats: { ...BASE_ENEMY_STATS },
		state: "WALKING",
		attackCooldown: 0,
	};
}
