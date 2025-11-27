import type { Card } from "../types/game";

export const CARD_DEFINITIONS: Record<string, Card> = {
	spell_fireball: {
		id: "spell_fireball",
		name: "Fireball",
		cost: 3,
		type: "SPELL",
		effects: [
			{ type: "DAMAGE", target: "ENEMY", damage: 10, damageType: "MAGICAL" },
		],
	},
	spell_zap: {
		id: "spell_zap",
		name: "Zap",
		cost: 1,
		type: "SPELL",
		effects: [
			{ type: "DAMAGE", target: "ENEMY", damage: 3, damageType: "MAGICAL" },
			{ type: "DRAW", target: "SELF", drawCount: 1 },
		],
	},
	spell_meteor: {
		id: "spell_meteor",
		name: "Meteor",
		cost: 5,
		type: "SPELL",
		effects: [
			{
				type: "DAMAGE",
				target: "ALL_ENEMIES",
				damage: 20,
				damageType: "MAGICAL",
			},
		],
	},
	spell_minor_heal: {
		id: "spell_minor_heal",
		name: "Minor Heal",
		cost: 2,
		type: "SPELL",
		effects: [{ type: "HEAL", target: "TOWER", heal: 5 }],
	},
	spell_frostbolt: {
		id: "spell_frostbolt",
		name: "Frostbolt",
		cost: 2,
		type: "SPELL",
		effects: [
			{ type: "DAMAGE", target: "ENEMY", damage: 5, damageType: "MAGICAL" },
			{
				type: "STATUS",
				target: "ENEMY",
				statusType: "SLOW",
				statusDuration: 3,
				statusIntensity: 0.5,
			},
		],
	},
	spell_meditate: {
		id: "spell_meditate",
		name: "Meditate",
		cost: 1,
		type: "SPELL",
		effects: [{ type: "ESSENCE", target: "SELF", essence: 2 }],
	},
	summon_skeleton: {
		id: "summon_skeleton",
		name: "Skeleton",
		cost: 3,
		type: "SUMMON",
		effects: [{ type: "SUMMON", target: "SELF", summonDefId: "skeleton" }],
	},
	spell_mana_potion: {
		id: "spell_mana_potion",
		name: "Mana Potion",
		cost: 0,
		type: "SPELL",
		effects: [{ type: "RESOURCE", target: "SELF", manaGain: 2 }],
		exhaust: true,
	},
	enchant_rage: {
		id: "enchant_rage",
		name: "Rage",
		cost: 2,
		type: "ENCHANT",
		effects: [
			{
				type: "BUFF",
				target: "ALL_SUMMONS",
				statModifier: { stat: "damage", value: 2, duration: 5 },
			},
		],
	},
	spell_study: {
		id: "spell_study",
		name: "Study",
		cost: 1,
		type: "SPELL",
		effects: [{ type: "DRAW", target: "SELF", drawCount: 2 }],
	},
};

// Starter deck composition
export const STARTER_DECK_IDS = [
	"spell_fireball",
	"spell_fireball",
	"spell_fireball",
	"spell_fireball",
	"spell_zap",
	"spell_zap",
	"spell_zap",
	"spell_zap",
	"spell_meteor",
	"spell_meteor",
];
