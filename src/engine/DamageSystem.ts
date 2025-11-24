import type { DamageEvent, Entity } from "../types/game";

/**
 * Processes a damage event and applies it to the target entity.
 * Returns the final damage amount dealt.
 */
export function processDamage(
	event: DamageEvent,
	source: Entity,
	target: Entity,
): number {
	let damage = event.amount;

	// 1. Outgoing Modifiers (Source)
	if (source.stats.damageAmp) {
		damage *= 1 + source.stats.damageAmp;
	}

	// 2. Incoming Modifiers (Target)
	if (target.stats.damageTakenAmp) {
		damage *= 1 + target.stats.damageTakenAmp;
	}

	// 3. Critical Hit
	if (event.isCritical) {
		damage *= 1.5; // Default crit multiplier
	}

	// 4. Mitigation
	if (event.type !== "TRUE") {
		if (event.type === "PHYSICAL" && target.stats.armor) {
			damage = Math.max(1, damage - target.stats.armor);
		} else if (event.type === "MAGICAL" && target.stats.magicResist) {
			damage = Math.max(1, damage - target.stats.magicResist);
		}
	}

	// 5. Final Application
	damage = Math.floor(damage); // Ensure integer damage
	target.stats.hp = Math.max(0, target.stats.hp - damage);

	// Handle Death
	if (target.stats.hp <= 0) {
		target.state = "DYING";
	}

	return damage;
}
