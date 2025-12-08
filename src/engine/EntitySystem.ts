import { gameConfig } from "../config/gameConfig";
import type { DamageEvent, Entity, GameData } from "../types/game";
import { processDamage } from "./DamageSystem";

// --- Spatial Queries ---

export function findEntitiesInRadius(
	position: number,
	radius: number,
	entities: Entity[],
): Entity[] {
	return entities.filter((e) => Math.abs(e.position - position) <= radius);
}

export function findNearestEntity(
	from: Entity | number,
	entities: Entity[],
	filter?: (e: Entity) => boolean,
): Entity | null {
	const pos = typeof from === "number" ? from : from.position;
	let nearest: Entity | null = null;
	let minDist = Infinity;

	for (const entity of entities) {
		if (filter && !filter(entity)) continue;
		const dist = Math.abs(entity.position - pos);
		if (dist < minDist) {
			minDist = dist;
			nearest = entity;
		}
	}
	return nearest;
}

export function isInAttackRange(attacker: Entity, target: Entity): boolean {
	const distance = Math.abs(attacker.position - target.position);
	return distance <= attacker.stats.range;
}

function performAttack(state: GameData, attacker: Entity, target: Entity) {
	const damageEvent: DamageEvent = {
		sourceId: attacker.id,
		targetId: target.id,
		amount: attacker.stats.damage,
		type: "PHYSICAL",
	};
	const damageDealt = processDamage(damageEvent, attacker, target);
	attacker.attackCooldown =
		1 / Math.max(gameConfig.combat.minAttackSpeed, attacker.stats.attackSpeed);

	// Visual Effect
	state.visualEffects.push({
		id: crypto.randomUUID(),
		type: "DAMAGE",
		value: damageDealt,
		position: target.position,
		timestamp: Date.now(),
	});
}

// --- Update Logic ---

export function updateEnemies(state: GameData, dt: number) {
	for (const enemy of state.enemies) {
		if (enemy.state === "DEAD") continue;

		// Handle DYING state transition
		if (enemy.state === "DYING") {
			if (enemy.deathTimer === undefined) {
				enemy.deathTimer = gameConfig.combat.deathAnimationDuration;
			}
			enemy.deathTimer -= dt;
			if (enemy.deathTimer <= 0) {
				enemy.state = "DEAD";
			}
			continue;
		}

		// Handle Stun
		if (enemy.state === "STUNNED") {
			continue;
		}

		// Attack Cooldown
		if (enemy.attackCooldown > 0) {
			enemy.attackCooldown -= dt;
		}

		// State Machine
		if (enemy.state === "ATTACKING") {
			const target =
				enemy.targetId === state.tower.id
					? state.tower
					: state.summons.find((s) => s.id === enemy.targetId);

			if (
				!target ||
				target.state === "DEAD" ||
				!isInAttackRange(enemy, target)
			) {
				enemy.state = "WALKING";
				enemy.targetId = undefined;
			} else if (enemy.attackCooldown <= 0) {
				// Attack!
				performAttack(state, enemy, target);
			}
		}

		if (enemy.state === "WALKING") {
			// Move towards Tower (0)
			enemy.position -= enemy.stats.speed * dt;
			enemy.position = Math.max(gameConfig.combat.laneMin, enemy.position);

			// Check for targets
			// Priority: 1. Summons, 2. Tower

			// Check Summons first
			const nearestSummon = findNearestEntity(
				enemy,
				state.summons,
				(s) => s.state !== "DEAD" && s.position <= enemy.position, // Only block if in front (or same pos)
			);

			if (nearestSummon && isInAttackRange(enemy, nearestSummon)) {
				enemy.state = "ATTACKING";
				enemy.targetId = nearestSummon.id;
			}
			// Check Tower
			else if (isInAttackRange(enemy, state.tower)) {
				enemy.state = "ATTACKING";
				enemy.targetId = state.tower.id;
			}
		}
	}
}

export function updateSummons(state: GameData, dt: number) {
	for (const summon of state.summons) {
		if (summon.state === "DEAD") continue;

		// Handle DYING state transition
		if (summon.state === "DYING") {
			if (summon.deathTimer === undefined) {
				summon.deathTimer = gameConfig.combat.deathAnimationDuration;
			}
			summon.deathTimer -= dt;
			if (summon.deathTimer <= 0) {
				summon.state = "DEAD";
			}
			continue;
		}

		if (summon.state === "STUNNED") continue;

		// Attack Cooldown
		if (summon.attackCooldown > 0) {
			summon.attackCooldown -= dt;
		}

		// State Machine
		if (summon.state === "ATTACKING") {
			const target = state.enemies.find((e) => e.id === summon.targetId);

			if (
				!target ||
				target.state === "DEAD" ||
				!isInAttackRange(summon, target)
			) {
				// If target lost, go back to IDLE or WALKING depending on type
				// For now, assume mobile summons go to WALKING, stationary to IDLE
				// We don't have a 'mobile' flag easily checked here without casting,
				// but we can check speed > 0
				summon.state = summon.stats.speed > 0 ? "WALKING" : "IDLE";
				summon.targetId = undefined;
			} else if (summon.attackCooldown <= 0) {
				// Attack!
				performAttack(state, summon, target);
			}
		}

		if (summon.state === "WALKING" || summon.state === "IDLE") {
			// Move if mobile
			if (summon.stats.speed > 0 && summon.state === "WALKING") {
				summon.position += summon.stats.speed * dt;
				summon.position = Math.min(gameConfig.combat.laneMax, summon.position);
			}

			// Look for targets
			const nearestEnemy = findNearestEntity(
				summon,
				state.enemies,
				(e) => e.state !== "DEAD" && e.position >= summon.position,
			);

			if (nearestEnemy && isInAttackRange(summon, nearestEnemy)) {
				summon.state = "ATTACKING";
				summon.targetId = nearestEnemy.id;
			} else if (summon.stats.speed > 0) {
				// If no target in range, ensure we are walking
				summon.state = "WALKING";
			}
		}
	}
}

export function cleanupDeadEntities(state: GameData) {
	state.enemies = state.enemies.filter((e) => e.state !== "DEAD");
	state.summons = state.summons.filter((s) => s.state !== "DEAD");
	state.projectiles = state.projectiles.filter((p) => p.state !== "DEAD");
}
