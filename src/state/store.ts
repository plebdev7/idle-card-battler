import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { INITIAL_DECK } from "../data/cards";
import { createEnemy } from "../data/enemies";
import { performPlay, processTick } from "../engine/CombatSystem";
import type { Card, CardInstance, GameData } from "../types/game";

/**
 * Creates a new card instance from a card definition.
 *
 * @param card - The card definition template
 * @returns A new card instance with a unique ID and initial state
 */
const createCardInstance = (card: Card): CardInstance => ({
	// TODO: Consider using crypto.randomUUID() for guaranteed uniqueness
	id: Math.random().toString(36).substr(2, 9),
	defId: card.id,
	name: card.name,
	zone: "DRAW",
	currentCost: card.cost,
});

interface GameActions {
	tick: (dt: number) => void;
	playCard: (cardId: string) => void;
	initializeGame: () => void;
	toggleGame: () => void;
	spawnEnemy: () => void;
}

type GameStore = GameData & GameActions;

export const useGameStore = create<GameStore>()(
	immer((set) => ({
		// Initial State
		gold: 0,
		mana: 0,
		maxMana: 10,
		manaRegen: 1,
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
			attackCooldown: 0,
			statusEffects: [],
		},
		enemies: [],
		summons: [],
		projectiles: [],

		// Deck Cycle
		hand: [],
		drawPile: [],
		discardPile: [],
		voidPile: [],
		drawTimer: 0,
		drawSpeed: 3.0,
		maxHandSize: 5,

		wave: {
			current: 1,
			total: 10,
			status: "WAITING",
		},
		isRunning: false,
		tickCount: 0,
		time: 0,

		// Actions
		initializeGame: () => {
			set((state) => {
				state.drawPile = INITIAL_DECK.map(createCardInstance);
				state.hand = [];
				state.discardPile = [];
				state.voidPile = [];
				state.mana = 0;
				state.time = 0;
				state.tickCount = 0;
				state.isRunning = false;
			});
		},

		tick: (dt: number) => {
			set((state) => {
				processTick(state, dt);
			});
		},

		playCard: (cardId: string) => {
			set((state) => {
				performPlay(state, cardId);
			});
		},

		toggleGame: () =>
			set((state) => {
				state.isRunning = !state.isRunning;
			}),

		spawnEnemy: () => {
			// TODO: Consider using crypto.randomUUID() for guaranteed uniqueness
			const id = Math.random().toString(36).substr(2, 9);
			set((state) => {
				state.enemies.push(createEnemy(id));
			});
		},
	})),
);
