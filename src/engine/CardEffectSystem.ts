import type { CardEffect, Entity, GameData, TargetType } from "../types/game";
import { processDamage } from "./DamageSystem";
import { createSummon } from "./EntityFactory";
import { createStatusEffect } from "./StatusEffectSystem";

/**
 * Executes a single card effect on the game state.
 * Mutates state via immer (or direct mutation if not using immer).
 */
export function executeEffect(
	state: GameData,
	effect: CardEffect,
	_sourceCardId: string,
): void {
	switch (effect.type) {
		case "DAMAGE":
			executeDamageEffect(state, effect);
			break;
		case "HEAL":
			executeHealEffect(state, effect);
			break;
		case "STATUS":
			executeStatusEffect(state, effect);
			break;
		case "BUFF":
			executeBuffEffect(state, effect);
			break;
		case "SUMMON":
			executeSummonEffect(state, effect);
			break;
		case "RESOURCE":
			executeResourceEffect(state, effect);
			break;
		case "DRAW":
			executeDrawEffect(state, effect);
			break;
		case "ESSENCE":
			executeEssenceEffect(state, effect);
			break;
	}
}

function getTargets(state: GameData, targetType: TargetType): Entity[] {
	switch (targetType) {
		case "ENEMY": {
			// Target the front-most enemy (closest to 0)
			if (state.enemies.length === 0) return [];
			const sortedEnemies = [...state.enemies].sort(
				(a, b) => a.position - b.position,
			);
			return [sortedEnemies[0]];
		}
		case "ALL_ENEMIES":
			return state.enemies;
		case "TOWER":
			return [state.tower];
		case "ALL_SUMMONS":
			return state.summons;
		case "SELF":
			return [];
		default:
			return [];
	}
}

function executeDamageEffect(state: GameData, effect: CardEffect): void {
	const targets = getTargets(state, effect.target);

	for (const target of targets) {
		const damageDealt = processDamage(
			{
				sourceId: "tower",
				targetId: target.id,
				amount: effect.damage ?? 0,
				type: effect.damageType ?? "MAGICAL",
			},
			state.tower,
			target,
		);

		// Visual Effect
		state.visualEffects.push({
			id: crypto.randomUUID(),
			type: "DAMAGE",
			value: damageDealt,
			position: target.position,
			timestamp: Date.now(),
		});
	}
}

function executeHealEffect(state: GameData, effect: CardEffect): void {
	if (effect.target === "TOWER") {
		const healAmount = effect.heal ?? 0;
		const actualHeal = Math.min(
			state.tower.stats.maxHp - state.tower.stats.hp,
			healAmount,
		);
		state.tower.stats.hp = Math.min(
			state.tower.stats.maxHp,
			state.tower.stats.hp + healAmount,
		);

		// Visual Effect
		if (actualHeal > 0) {
			state.visualEffects.push({
				id: crypto.randomUUID(),
				type: "HEAL",
				value: actualHeal,
				position: state.tower.position,
				timestamp: Date.now(),
			});
		}
	}
}

function executeStatusEffect(state: GameData, effect: CardEffect): void {
	const targets = getTargets(state, effect.target);

	for (const target of targets) {
		if (effect.statusType) {
			const status = createStatusEffect(
				effect.statusType,
				effect.statusDuration ?? 0,
				effect.statusIntensity ?? 0,
				"tower",
			);
			target.statusEffects.push(status);

			// Visual Effect
			state.visualEffects.push({
				id: crypto.randomUUID(),
				type: "DEBUFF",
				text: effect.statusType,
				position: target.position,
				timestamp: Date.now(),
			});
		}
	}
}

function executeBuffEffect(state: GameData, effect: CardEffect): void {
	const targets = getTargets(state, effect.target);
	if (effect.statModifier) {
		for (const target of targets) {
			const stat = effect.statModifier.stat;
			if (typeof target.stats[stat] === "number") {
				target.stats[stat] += effect.statModifier.value;

				// Visual Effect
				state.visualEffects.push({
					id: crypto.randomUUID(),
					type: "BUFF",
					text: `+${effect.statModifier.value} ${stat}`,
					position: target.position,
					timestamp: Date.now(),
				});
			}
		}
	}
}

function executeSummonEffect(state: GameData, effect: CardEffect): void {
	if (effect.summonDefId) {
		const summon = createSummon(effect.summonDefId, 0); // Spawn at tower (0)
		state.summons.push(summon);
	}
}

function executeResourceEffect(state: GameData, effect: CardEffect): void {
	if (effect.manaGain) {
		state.mana = Math.min(state.maxMana, state.mana + effect.manaGain);
	}
}

function executeDrawEffect(state: GameData, effect: CardEffect): void {
	const count = effect.drawCount ?? 0;
	for (let i = 0; i < count; i++) {
		if (state.drawPile.length === 0) {
			if (state.discardPile.length === 0) break; // No cards left
			// Reshuffle
			state.drawPile = [...state.discardPile].sort(() => Math.random() - 0.5);
			state.discardPile = [];
		}

		if (state.hand.length < state.maxHandSize) {
			const card = state.drawPile.pop();
			if (card) {
				card.zone = "HAND";
				state.hand.push(card);
			}
		}
	}
}

function executeEssenceEffect(state: GameData, effect: CardEffect): void {
	if (effect.essence) {
		state.essence = (state.essence || 0) + effect.essence;
	}
}
