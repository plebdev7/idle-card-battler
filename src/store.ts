import { create } from "zustand";

export interface Card {
	id: string;
	name: string;
	cost: number;
	damage?: number;
}

export interface Enemy {
	id: string;
	name: string;
	hp: number;
	maxHp: number;
	speed: number;
	position: number; // 0 to 100 (0 = Tower)
}

interface GameState {
	// Resources
	gold: number;
	mana: number;
	maxMana: number;
	manaRegen: number;
	towerHp: number;
	maxTowerHp: number;

	// Combat
	enemies: Enemy[];
	hand: Card[];

	// Meta
	isRunning: boolean;
	time: number;

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
	towerHp: 100,
	maxTowerHp: 100,

	enemies: [],
	hand: [
		{ id: "c1", name: "Fireball", cost: 3, damage: 10 },
		{ id: "c2", name: "Zap", cost: 1, damage: 3 },
		{ id: "c3", name: "Meteor", cost: 5, damage: 20 },
	],

	isRunning: false,
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

			// Enemy Logic (Simple movement)
			// TODO: Implement real movement

			return {
				mana: newMana,
				time: state.time + dt,
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
					name: "Skeleton",
					hp: 20,
					maxHp: 20,
					speed: 5,
					position: 100,
				},
			],
		}));
	},
}));
