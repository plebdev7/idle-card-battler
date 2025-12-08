import { gameConfig } from "../config/gameConfig";
import { CARD_DEFINITIONS } from "../data/cardDefinitions";
import type { CardEffect, CardInstance, GameData } from "../types/game";
import { performPlay } from "./CombatSystem";

/**
 * Basic AI decision logic (Tier 1: Random playable card)
 * Called every tick when the game is running.
 * Uses a cooldown timer to space out card plays for better visibility.
 */
export function updateAI(state: GameData, dt: number): void {
	// Decrement cooldown timer
	if (state.aiPlayCooldown > 0) {
		state.aiPlayCooldown = Math.max(0, state.aiPlayCooldown - dt);
		return;
	}

	// Find all playable cards in hand
	const playableCards = state.hand.filter((card) =>
		isCardPlayable(state, card),
	);

	if (playableCards.length === 0) return;

	// Tier 1: Random selection
	const randomCard =
		playableCards[Math.floor(Math.random() * playableCards.length)];
	performPlay(state, randomCard.id);

	// Reset cooldown after playing a card
	state.aiPlayCooldown = gameConfig.ai.playDelay;
}

/**
 * Helper to determine if a card can be played.
 */
export function isCardPlayable(state: GameData, card: CardInstance): boolean {
	// Check if card was just drawn (needs time to be visible)
	if (card.drawnAt !== undefined) {
		const timeSinceDraw = state.time - card.drawnAt;
		if (timeSinceDraw < gameConfig.ai.cardDrawDelay) {
			return false; // Card too fresh, let player see it first
		}
	}

	// Check mana
	if (state.mana < card.currentCost) return false;

	// Check target validity
	const cardDef = CARD_DEFINITIONS[card.defId];
	if (!cardDef) return false;

	// Check if card has valid targets (e.g., can't heal if tower is at max HP)
	for (const effect of cardDef.effects) {
		if (!hasValidTargets(state, effect)) {
			return false;
		}
	}

	return true;
}

function hasValidTargets(state: GameData, effect: CardEffect): boolean {
	// For Phase 2, we'll be permissive - most cards can always be played
	// Future: Add logic for "can't heal at full HP" etc.

	if (effect.target === "ENEMY" || effect.target === "ALL_ENEMIES") {
		return state.enemies.length > 0;
	}

	if (effect.target === "TOWER") {
		// Optional: Don't heal if full HP
		// if (effect.type === "HEAL" && state.tower.stats.hp >= state.tower.stats.maxHp) return false;
		return true;
	}

	return true;
}
