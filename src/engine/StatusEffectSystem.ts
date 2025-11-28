import { gameConfig } from "../config/gameConfig";
import type { Entity, GameData, StatusEffect } from "../types/game";
import { processDamage } from "./DamageSystem";

export function updateStatusEffects(state: GameData, dt: number) {
	// Update enemies
	for (const entity of state.enemies) {
		updateEntity(entity, dt);
	}
	// Update summons
	for (const entity of state.summons) {
		updateEntity(entity, dt);
	}
	// Tower usually doesn't move but might get effects?
	updateEntity(state.tower, dt);
}

function updateEntity(entity: Entity, dt: number) {
	if (entity.state === "DEAD") return;

	// 1. Initialize baseStats if missing (first run)
	if (!entity.baseStats) {
		entity.baseStats = { ...entity.stats };
	}

	// 2. Process Effects
	let speedMult = 1;
	let canMove = true;
	let canAttack = true;

	// Filter out expired effects
	entity.statusEffects = entity.statusEffects.filter((effect) => {
		effect.duration -= dt;

		// Handle DoTs
		if (
			effect.type === "POISON" ||
			effect.type === "BURN" ||
			effect.type === "REGEN"
		) {
			if (!effect.tickTimer)
				effect.tickTimer = gameConfig.statusEffects.tickInterval;
			effect.tickTimer -= dt;
			if (effect.tickTimer <= 0) {
				applyDot(entity, effect);
				effect.tickTimer = gameConfig.statusEffects.tickInterval;
			}
		}

		return effect.duration > 0;
	});

	// 3. Calculate Modifiers
	for (const effect of entity.statusEffects) {
		switch (effect.type) {
			case "SLOW":
				// Multiplicative stacking: 50% slow + 50% slow = 25% speed?
				// Spec says: "Max Intensity (Strongest slow applies)"
				// Wait, spec says: "Max Intensity".
				// But later: "Pattern: currentSpeed = baseSpeed * product(1 - slowAmount)"
				// Let's follow "Max Intensity" for SLOW as per table, but "product" pattern is mentioned in "Recalculate Stats".
				// Table says: "Max Intensity (Strongest slow applies)".
				// So if I have 0.5 and 0.2, I use 0.5.
				// But if I have multiple sources?
				// Let's implement Max Intensity logic.
				break;
			case "STUN":
				canMove = false;
				canAttack = false;
				break;
		}
	}

	// Calculate max slow intensity
	const maxSlow = entity.statusEffects
		.filter((e) => e.type === "SLOW")
		.reduce((max, e) => Math.max(max, e.intensity), 0);

	if (maxSlow > 0) {
		speedMult *= 1 - maxSlow;
	}

	// 4. Apply Stats
	// Reset to base
	entity.stats.speed = entity.baseStats.speed * speedMult;

	// Handle Stun State
	if (!canMove || !canAttack) {
		if (entity.state !== "STUNNED") {
			// Save previous state? Or just override.
			// If we override, we lose "ATTACKING" target.
			// But STUNNED implies interruption.
			entity.state = "STUNNED";
		}
	} else {
		if (entity.state === "STUNNED") {
			// Recover from stun
			entity.state = "IDLE"; // Or WALKING? EntitySystem will decide next frame.
		}
	}
}

function applyDot(entity: Entity, effect: StatusEffect) {
	if (effect.type === "POISON") {
		// True Damage
		const dmgEvent = {
			sourceId: effect.sourceId || "unknown",
			targetId: entity.id,
			amount: effect.intensity,
			type: "TRUE" as const,
		};
		// We need a dummy source for DamageCalculator if we want modifiers,
		// but POISON usually ignores source modifiers?
		// Let's just apply direct damage or use calculator.
		// Calculator handles death logic.
		const dummySource = {
			...entity,
			stats: { ...entity.stats, damageAmp: 0 },
		}; // Hacky
		processDamage(dmgEvent, dummySource, entity);
	} else if (effect.type === "BURN") {
		// Magic Damage
		const dmgEvent = {
			sourceId: effect.sourceId || "unknown",
			targetId: entity.id,
			amount: effect.intensity,
			type: "MAGICAL" as const,
		};
		const dummySource = {
			...entity,
			stats: { ...entity.stats, damageAmp: 0 },
		};
		processDamage(dmgEvent, dummySource, entity);
	} else if (effect.type === "REGEN") {
		// Heal
		entity.stats.hp = Math.min(
			entity.stats.maxHp,
			entity.stats.hp + effect.intensity,
		);
	}
}

export function applyStatusEffect(entity: Entity, effect: StatusEffect) {
	// Stacking Rules
	const existing = entity.statusEffects.find((e) => e.type === effect.type);

	if (existing) {
		switch (effect.type) {
			case "SLOW":
				// Max Intensity: Update if new is stronger?
				// Spec says: "Max Intensity (Strongest slow applies)".
				// This refers to the *effect* on speed.
				// But for application: do we replace?
				// Usually we keep both and calculate max.
				// Or we just update the existing one if new is stronger?
				// Let's just add it. We handle max calculation in update.
				entity.statusEffects.push(effect);
				break;
			case "STUN":
				// Duration Extend
				existing.duration += effect.duration;
				break;
			case "POISON":
			case "BURN":
			case "REGEN":
				// Intensity Stack: Add damage/heal?
				// Spec says: "Intensity Stack (Add damage)".
				// This implies we have one effect with increased intensity?
				// Or multiple effects running?
				// "Add damage" -> usually means multiple stacks running concurrently.
				// But if we merge them:
				// existing.intensity += effect.intensity;
				// existing.duration = Math.max(existing.duration, effect.duration); // Refresh duration?
				// Spec doesn't say about duration refresh.
				// "Intensity Stack" usually means they run parallel.
				entity.statusEffects.push(effect);
				break;
			default:
				entity.statusEffects.push(effect);
		}
	} else {
		entity.statusEffects.push(effect);
	}
}

export function createStatusEffect(
	type: import("../types/game").StatusEffectType,
	duration: number,
	intensity: number,
	sourceId?: string,
): StatusEffect {
	return {
		id: crypto.randomUUID(),
		type,
		duration,
		intensity,
		sourceId,
	};
}
