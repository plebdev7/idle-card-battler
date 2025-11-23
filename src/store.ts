import { create } from "zustand";
import type { Card, Entity, WaveState } from "./types/game";

interface GameState {
	// Resources
	gold: number;
	mana: number;
	maxMana: number;
	manaRegen: number;

	// Entities
	tower: Entity;
	enemies: Entity[];
	projectiles: Entity[]; // Placeholder for now

	// Cards
	hand: Card[];

	// Wave
	wave: WaveState;

	// Meta
	isRunning: boolean;
	tickCount: number; // Total ticks processed
	time: number; // Total game time in seconds

	// Actions
	tick: (dt: number) => void;
	playCard: (cardId: string) => void;
	toggleGame: () => void;
	spawnEnemy: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
	gold: 0,
	mana: 0,
	maxMana: 10,
	manaRegen: 1, // 1 mana per second

	tower: {
		id: "tower",
		type: "TOWER",
		position: 0,
		stats: {
			hp: 100,
			maxHp: 100,
			speed: 0,
			range: 0,
			damage: 0,
			attackSpeed: 0,
		},
		state: "IDLE",
	},
	enemies: [],
	projectiles: [],

	hand: [
		{ id: "c1", name: "Fireball", cost: 3, damage: 10 },
		{ id: "c2", name: "Zap", cost: 1, damage: 3 },
		{ id: "c3", name: "Meteor", cost: 5, damage: 20 },
	],

	wave: {
		current: 1,
		total: 10,
		status: "WAITING",
	},

	isRunning: false,
	tickCount: 0,
	time: 0,

	tick: (dt: number) => {
		const state = get();
		if (!state.isRunning) return;

		set((state) => {
			// Mana Regen
			const newMana = Math.min(
				state.maxMana,
				state.mana + state.manaRegen * dt,
			);

			// TODO: Implement full combat loop here (Entity updates, etc.)

			return {
				mana: newMana,
				time: state.time + dt,
				tickCount: state.tickCount + 1,
			};
		});
	},

	playCard: (cardId: string) => {
		const state = get();
		const card = state.hand.find((c) => c.id === cardId);
		if (!card || state.mana < card.cost) return;

		console.log(`Played ${card.name} for ${card.cost} mana`);

		set((state) => ({
			mana: state.mana - card.cost,
			// TODO: Apply card effects
		}));
	},

	toggleGame: () => set((state) => ({ isRunning: !state.isRunning })),

	spawnEnemy: () => {
		const id = Math.random().toString(36).substr(2, 9);
		set((state) => ({
			enemies: [
				...state.enemies,
				{
					id,
					type: "ENEMY",
					position: 100,
					stats: {
						hp: 20,
						maxHp: 20,
						speed: 5,
						range: 10,
						damage: 5,
						attackSpeed: 1,
					},
					state: "WALKING",
				},
			],
		}));
	},
}));
