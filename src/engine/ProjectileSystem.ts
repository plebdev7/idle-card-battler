import type { Entity, GameData } from "../types/game";
import { processDamage } from "./DamageSystem";
import { applyStatusEffect } from "./StatusEffectSystem";

export function updateProjectiles(state: GameData, dt: number) {
	for (let i = state.projectiles.length - 1; i >= 0; i--) {
		const proj = state.projectiles[i];
		if (proj.state === "DEAD") continue;

		moveProjectile(proj, state, dt);
		checkCollisions(proj, state);
		checkBounds(proj);
	}
}

function moveProjectile(proj: Entity, state: GameData, dt: number) {
	if (!proj.projectileData) return;

	switch (proj.projectileData.type) {
		case "LINEAR":
			// Move in direction of speed (positive = right, negative = left)
			proj.position += proj.stats.speed * dt;
			break;

		case "HOMING": {
			if (!proj.targetId) {
				// If no target, behave like linear or fizzle?
				// Spec says: "Projectile continues to last known position."
				// For now, just move forward
				proj.position += proj.stats.speed * dt;
				return;
			}

			const target = state.enemies.find((e) => e.id === proj.targetId);
			if (!target || target.state === "DEAD") {
				// Target lost, clear targetId and continue linear
				proj.targetId = undefined;
				proj.position += proj.stats.speed * dt;
			} else {
				// Move towards target
				const direction = target.position > proj.position ? 1 : -1;
				proj.position += direction * Math.abs(proj.stats.speed) * dt;
			}
			break;
		}
		case "AOE":
			// Stationary, usually
			break;
	}
}

function checkCollisions(proj: Entity, state: GameData) {
	if (!proj.projectileData) return;

	// Simple linear collision
	// In a real game, we might use a spatial partition if N is large
	const hitRadius = proj.projectileData.hitRadius;

	// For now, assume Entity size is 1.0
	const ENTITY_RADIUS = 1.0;

	// Re-filter with correct radius logic
	const hitTargets = state.enemies.filter(
		(e) =>
			e.state !== "DEAD" &&
			Math.abs(e.position - proj.position) <= hitRadius + ENTITY_RADIUS,
	);

	if (hitTargets.length > 0) {
		if (proj.projectileData.type === "AOE") {
			for (const target of hitTargets) {
				applyHit(proj, target);
			}
			// AOE usually has a duration or one-time trigger.
			// If it's a "blast" projectile, it should die after hitting.
			// If it's a "zone", it stays.
			// Spec says "AOE: Stationary... Hit all enemies".
			// Let's assume for now projectiles die on hit unless piercing.
			if (!proj.projectileData.piercing) {
				proj.state = "DEAD";
			}
		} else {
			// Linear/Homing: Hit the closest one? Or the first one found?
			// Spec says "Hit first enemy in path".
			// Since we are 1D, "first" means closest to projectile in movement direction?
			// Or just any intersecting?
			// Let's just hit the first one in the list for now, or closest.
			const closest = hitTargets.sort(
				(a, b) =>
					Math.abs(a.position - proj.position) -
					Math.abs(b.position - proj.position),
			)[0];

			if (closest) {
				applyHit(proj, closest);
				if (!proj.projectileData.piercing) {
					proj.state = "DEAD";
				}
			}
		}
	}
}

function applyHit(proj: Entity, target: Entity) {
	if (!proj.projectileData) return;

	// Create Damage Event
	const damageEvent = {
		sourceId: proj.id, // Or proj.sourceId if we track who fired it? Entity has no sourceId.
		// Wait, StatusEffect has sourceId.
		// We should probably track owner of projectile.
		// For now, use proj.id as source, which implies the projectile dealt the damage.
		targetId: target.id,
		amount: proj.projectileData.damage,
		type: proj.projectileData.damageType,
	};

	// We need 'source' entity for modifiers.
	// If projectile is the source, it might not have stats like 'damageAmp'.
	// Ideally we pass the original caster.
	// But for this session, let's use the projectile itself as the source
	// and assume it carries the stats snapshot or we just ignore source modifiers for now.
	// Actually, `DamageCalculator` uses `source.stats.damageAmp`.
	// Projectile stats are in `proj.stats`.
	processDamage(damageEvent, proj, target);

	// Apply status effects
	if (proj.projectileData.onHitEffects) {
		for (const effect of proj.projectileData.onHitEffects) {
			// Clone effect to avoid reference issues if reused
			const newEffect = { ...effect, sourceId: proj.id };
			applyStatusEffect(target, newEffect);
		}
	}
}

function checkBounds(proj: Entity) {
	if (proj.position < -10 || proj.position > 110) {
		proj.state = "DEAD";
	}
}
