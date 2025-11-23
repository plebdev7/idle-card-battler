import type { Entity, GameData } from "../types/game";

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

// --- Update Logic ---

export function updateEnemies(state: GameData, dt: number) {
	for (const enemy of state.enemies) {
		if (enemy.state === "DEAD" || enemy.state === "DYING") continue;

		// Handle Stun
		if (enemy.state === "STUNNED") {
			// TODO: Handle stun duration decrement
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
				// TODO: Implement damage application
				// console.log(`Enemy ${enemy.id} attacks ${target.id}`);
				enemy.attackCooldown = 1 / enemy.stats.attackSpeed;
			}
		}

		if (enemy.state === "WALKING") {
			// Move towards Tower (0)
			enemy.position -= enemy.stats.speed * dt;
			enemy.position = Math.max(0, enemy.position);

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
		if (summon.state === "DEAD" || summon.state === "DYING") continue;

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
				// console.log(`Summon ${summon.id} attacks ${target.id}`);
				summon.attackCooldown = 1 / summon.stats.attackSpeed;
			}
		}

		if (summon.state === "WALKING" || summon.state === "IDLE") {
			// Move if mobile
			if (summon.stats.speed > 0 && summon.state === "WALKING") {
				summon.position += summon.stats.speed * dt;
				// TODO: Clamp position?
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

export function updateProjectiles(state: GameData, dt: number) {
	for (let i = state.projectiles.length - 1; i >= 0; i--) {
		const proj = state.projectiles[i];
		if (proj.state === "DEAD") continue;

		// Move
		// Assuming linear movement for now towards 100
		// TODO: Handle different projectile modes (Homing, Linear)
		proj.position += proj.stats.speed * dt;

		// Collision
		// Simple linear collision with first enemy
		// TODO (Session 2.2.4): Make hitRadius a projectile property for different collision sizes
		const hitRadius = 1; // Default
		const target = state.enemies.find(
			(e) =>
				Math.abs(e.position - proj.position) <= hitRadius && e.state !== "DEAD",
		);

		if (target) {
			// Hit!
			// console.log(`Projectile ${proj.id} hit ${target.id}`);
			proj.state = "DEAD"; // Mark for cleanup
			// TODO: Apply damage
		}

		// Cleanup if out of bounds
		if (proj.position > 100 || proj.position < 0) {
			proj.state = "DEAD";
		}
	}
}

export function cleanupDeadEntities(state: GameData) {
	state.enemies = state.enemies.filter((e) => e.state !== "DEAD");
	state.summons = state.summons.filter((s) => s.state !== "DEAD");
	state.projectiles = state.projectiles.filter((p) => p.state !== "DEAD");
}
