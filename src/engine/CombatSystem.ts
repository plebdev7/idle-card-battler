import type { GameData } from "../types/game";

/**
 * Processes a single game tick, updating mana regeneration, draw timer, and game time.
 * This function mutates the state object directly (safe via immer middleware in Zustand).
 *
 * @param state - The mutable game state (via immer draft)
 * @param dt - Delta time in seconds since last tick
 */
export function processTick(state: GameData, dt: number) {
	if (!state.isRunning) return;

	// 1. Mana Regen
	if (state.mana < state.maxMana) {
		state.mana = Math.min(state.maxMana, state.mana + state.manaRegen * dt);
	}

	// 2. Draw Timer
	// Only advance if hand is not full
	if (state.hand.length < state.maxHandSize) {
		state.drawTimer += dt / state.drawSpeed;
		if (state.drawTimer >= 1.0) {
			state.drawTimer = 0;
			performDraw(state);
		}
	} else {
		// Paused at 100% if hand is full
		state.drawTimer = Math.min(1.0, state.drawTimer + dt / state.drawSpeed);
	}

	// 3. Update Time
	state.time += dt;
	state.tickCount += 1;
}

/**
 * Draws a card from the draw pile to the player's hand.
 * Automatically reshuffles the discard pile into the draw pile if needed.
 *
 * @param state - The mutable game state (via immer draft)
 */
export function performDraw(state: GameData) {
	if (state.drawPile.length === 0) {
		// Reshuffle
		if (state.discardPile.length > 0) {
			state.drawPile = [...state.discardPile].sort(() => Math.random() - 0.5);
			state.discardPile = [];
			state.drawPile.forEach((c) => {
				c.zone = "DRAW";
			});
		} else {
			return; // No cards
		}
	}

	if (state.drawPile.length > 0) {
		const card = state.drawPile.pop();
		if (card) {
			card.zone = "HAND";
			state.hand.push(card);
		}
	}
}

/**
 * Plays a card from the player's hand, consuming mana and moving it to the discard pile.
 *
 * @param state - The mutable game state (via immer draft)
 * @param cardId - The unique ID of the card instance to play
 */
export function performPlay(state: GameData, cardId: string) {
	const cardIndex = state.hand.findIndex((c) => c.id === cardId);
	if (cardIndex === -1) return;

	const card = state.hand[cardIndex];

	if (state.mana < card.currentCost) return;

	// Pay Cost
	state.mana -= card.currentCost;

	// Move to Discard
	state.hand.splice(cardIndex, 1);
	card.zone = "DISCARD";
	state.discardPile.push(card);

	// TODO: Apply Card Effects
	console.log(`Played ${card.name}`);
}
