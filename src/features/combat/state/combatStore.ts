import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface CardInstance {
	id: string;
	defId: string;
	zone: "DRAW" | "HAND" | "PLAY" | "DISCARD" | "VOID";
	currentCost: number;
	name: string; // Added for display purposes
}

interface CombatState {
	mana: {
		current: number;
		max: number;
		regenRate: number; // per second
	};
	draw: {
		timer: number; // Current progress (0.0 to 1.0)
		speed: number; // Seconds to fill bar
	};
	zones: {
		draw: CardInstance[];
		hand: CardInstance[];
		play: CardInstance[];
		discard: CardInstance[];
		void: CardInstance[];
	};
	config: {
		maxHandSize: number;
	};
	ai: {
		cooldown: number;
	};
}

interface CombatActions {
	initializeCombat: (deck: CardInstance[]) => void;
	tick: (dt: number) => void;
	playCard: (cardId: string) => void;
	drawCard: () => void;
	debugAddMana: (amount: number) => void;
}

type CombatStore = CombatState & CombatActions;

export const useCombatStore = create<CombatStore>()(
	immer((set) => ({
		mana: {
			current: 0,
			max: 10,
			regenRate: 1.0,
		},
		draw: {
			timer: 0,
			speed: 3.0, // 3 seconds to draw
		},
		zones: {
			draw: [],
			hand: [],
			play: [],
			discard: [],
			void: [],
		},
		config: {
			maxHandSize: 5,
		},
		ai: {
			cooldown: 0,
		},

		initializeCombat: (deck) => {
			set((state) => {
				state.zones.draw = deck;
				state.zones.hand = [];
				state.zones.play = [];
				state.zones.discard = [];
				state.zones.void = [];
				state.mana.current = 0;
				state.draw.timer = 0;
				state.ai.cooldown = 0;
			});
		},

		tick: (dt) => {
			set((state) => {
				// 1. Mana Regen
				if (state.mana.current < state.mana.max) {
					state.mana.current = Math.min(
						state.mana.max,
						state.mana.current + state.mana.regenRate * dt,
					);
				}

				// 2. Draw Timer
				let cardDrawn = false;
				// Only advance if hand is not full
				if (state.zones.hand.length < state.config.maxHandSize) {
					state.draw.timer += dt / state.draw.speed;
					if (state.draw.timer >= 1.0) {
						state.draw.timer = 0;
						performDraw(state);
						cardDrawn = true;
					}
				} else {
					// Paused at 100% if hand is full
					state.draw.timer = Math.min(
						1.0,
						state.draw.timer + dt / state.draw.speed,
					);
				}

				// 3. AI Logic
				// If we just drawn a card, force a cooldown and skip AI this tick
				if (cardDrawn) {
					state.ai.cooldown = 1.5;
				} else {
					// Reduce cooldown
					if (state.ai.cooldown > 0) {
						state.ai.cooldown -= dt;
					}

					// Only try to play if cooldown is ready
					if (state.ai.cooldown <= 0) {
						const hand = state.zones.hand;
						const playableCards = hand.filter(
							(card: CardInstance) => card.currentCost <= state.mana.current,
						);

						if (playableCards.length > 0) {
							const randomCard =
								playableCards[Math.floor(Math.random() * playableCards.length)];
							performPlay(state, randomCard.id);
						}
					}
				}
			});
		},

		drawCard: () => {
			set((state) => {
				performDraw(state);
			});
		},

		playCard: (cardId) => {
			set((state) => {
				performPlay(state, cardId);
			});
		},

		debugAddMana: (amount) => {
			set((state) => {
				state.mana.current = Math.min(
					state.mana.max,
					state.mana.current + amount,
				);
			});
		},
	})),
);

// Internal helper to perform draw logic on the draft state
const performDraw = (state: CombatState) => {
	if (state.zones.draw.length === 0) {
		// Reshuffle
		if (state.zones.discard.length > 0) {
			state.zones.draw = [...state.zones.discard].sort(
				() => Math.random() - 0.5,
			);
			state.zones.discard = [];
		} else {
			// No cards to draw
			return;
		}
	}

	if (state.zones.draw.length > 0) {
		const card = state.zones.draw.pop();
		if (card) {
			card.zone = "HAND";
			state.zones.hand.push(card);
			// Add a reaction delay so the card is visible for at least 1 second
			state.ai.cooldown = 1.0;
		}
	}
};

// Internal helper to perform play logic on the draft state
const performPlay = (state: CombatState, cardId: string) => {
	const cardIndex = state.zones.hand.findIndex(
		(c: CardInstance) => c.id === cardId,
	);
	if (cardIndex === -1) return;

	const card = state.zones.hand[cardIndex];

	// Double check cost
	if (state.mana.current < card.currentCost) return;

	// Pay Cost
	state.mana.current -= card.currentCost;

	// Move to Play (then Discard)
	state.zones.hand.splice(cardIndex, 1);
	card.zone = "DISCARD";
	state.zones.discard.push(card);
};
