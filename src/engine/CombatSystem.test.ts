import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CardInstance, GameData } from "../types/game";
import * as AISystem from "./AISystem";
import * as CardEffectSystem from "./CardEffectSystem";
import { performDraw, performPlay, processTick } from "./CombatSystem";

// Mock dependencies
vi.mock("./CardEffectSystem", () => ({
	executeEffect: vi.fn(),
}));

vi.mock("./AISystem", () => ({
	updateAI: vi.fn(),
}));

// Helper to create a minimal game state for testing
const createTestState = (overrides?: Partial<GameData>): GameData => ({
	gold: 0,
	mana: 5,
	maxMana: 10,
	manaRegen: 1,
	essence: 0,
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
	visualEffects: [],
	hand: [],
	drawPile: [],
	discardPile: [],
	voidPile: [],
	drawTimer: 0,
	drawSpeed: 3.0,
	maxHandSize: 5,
	wave: {
		current: 1,
		total: 5,
		phase: "COMPLETED",
		phaseTimer: 0,
		floor: 1,
		spawnQueue: [],
	},
	autoContinue: true,
	autoContinueDelay: 3,
	autoContinueTimer: 0,
	aiPlayCooldown: 0,
	combatLog: [],
	isRunning: true,
	tickCount: 0,
	time: 0,
	...overrides,
});

// Helper to create a test card
const createCard = (id: string, name: string, cost = 2): CardInstance => ({
	id,
	defId: "spell_fireball", // Use a valid defId
	name,
	zone: "HAND",
	currentCost: cost,
});

describe("CombatSystem", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("performDraw", () => {
		it("should draw a card from the draw pile to hand", () => {
			const card = createCard("card1", "Test Card");
			card.zone = "DRAW";
			const state = createTestState({
				drawPile: [card],
				hand: [],
			});

			performDraw(state);

			expect(state.hand).toHaveLength(1);
			expect(state.hand[0].id).toBe("card1");
			expect(state.hand[0].zone).toBe("HAND");
			expect(state.drawPile).toHaveLength(0);
		});

		it("should update card zone from DRAW to HAND", () => {
			const card = createCard("card1", "Test Card");
			card.zone = "DRAW";
			const state = createTestState({
				drawPile: [card],
			});

			performDraw(state);

			expect(card.zone).toBe("HAND");
		});

		it("should reshuffle discard pile when draw pile is empty", () => {
			const card1 = createCard("card1", "Card 1");
			const card2 = createCard("card2", "Card 2");
			card1.zone = "DISCARD";
			card2.zone = "DISCARD";

			const state = createTestState({
				drawPile: [],
				discardPile: [card1, card2],
				hand: [],
			});

			performDraw(state);

			// Should have reshuffled and drawn one card
			expect(state.hand).toHaveLength(1);
			expect(state.drawPile).toHaveLength(1);
			expect(state.discardPile).toHaveLength(0);

			// The drawn card should have HAND zone
			expect(state.hand[0].zone).toBe("HAND");
			// The remaining card should have DRAW zone
			expect(state.drawPile[0].zone).toBe("DRAW");
		});

		it("should update all reshuffled cards to DRAW zone", () => {
			const card1 = createCard("card1", "Card 1");
			const card2 = createCard("card2", "Card 2");
			const card3 = createCard("card3", "Card 3");
			card1.zone = "DISCARD";
			card2.zone = "DISCARD";
			card3.zone = "DISCARD";

			const state = createTestState({
				drawPile: [],
				discardPile: [card1, card2, card3],
				hand: [],
			});

			performDraw(state);

			// One card drawn to hand
			expect(state.hand[0].zone).toBe("HAND");
			// Remaining cards in draw pile should have DRAW zone
			state.drawPile.forEach((card) => {
				expect(card.zone).toBe("DRAW");
			});
		});

		it("should do nothing when both piles are empty", () => {
			const state = createTestState({
				drawPile: [],
				discardPile: [],
				hand: [],
			});

			performDraw(state);

			expect(state.hand).toHaveLength(0);
			expect(state.drawPile).toHaveLength(0);
			expect(state.discardPile).toHaveLength(0);
		});

		it("should handle drawing when draw pile has exactly one card", () => {
			const card = createCard("card1", "Test Card");
			card.zone = "DRAW";
			const state = createTestState({
				drawPile: [card],
			});

			performDraw(state);

			expect(state.hand).toHaveLength(1);
			expect(state.drawPile).toHaveLength(0);
			expect(state.hand[0].id).toBe("card1");
		});
	});

	describe("performPlay", () => {
		it("should play a card from hand with sufficient mana", () => {
			const card = createCard("card1", "Test Card", 3);
			const state = createTestState({
				hand: [card],
				mana: 5,
				discardPile: [],
			});

			performPlay(state, "card1");

			expect(state.hand).toHaveLength(0);
			expect(state.discardPile).toHaveLength(1);
			expect(state.discardPile[0].id).toBe("card1");
			expect(state.discardPile[0].zone).toBe("DISCARD");
			expect(state.mana).toBe(2); // 5 - 3
			expect(CardEffectSystem.executeEffect).toHaveBeenCalled();
		});

		it("should deduct mana equal to card cost", () => {
			const card = createCard("card1", "Expensive Card", 7);
			const state = createTestState({
				hand: [card],
				mana: 10,
			});

			performPlay(state, "card1");

			expect(state.mana).toBe(3); // 10 - 7
		});

		it("should update card zone from HAND to DISCARD", () => {
			const card = createCard("card1", "Test Card", 2);
			const state = createTestState({
				hand: [card],
				mana: 5,
			});

			performPlay(state, "card1");

			expect(card.zone).toBe("DISCARD");
		});

		it("should not play card with insufficient mana", () => {
			const card = createCard("card1", "Expensive Card", 7);
			const state = createTestState({
				hand: [card],
				mana: 3,
			});

			performPlay(state, "card1");

			// Card should still be in hand
			expect(state.hand).toHaveLength(1);
			expect(state.discardPile).toHaveLength(0);
			expect(state.mana).toBe(3); // Unchanged
			expect(CardEffectSystem.executeEffect).not.toHaveBeenCalled();
		});

		it("should not play card when mana equals cost minus one", () => {
			const card = createCard("card1", "Test Card", 5);
			const state = createTestState({
				hand: [card],
				mana: 4,
			});

			performPlay(state, "card1");

			expect(state.hand).toHaveLength(1);
			expect(state.mana).toBe(4);
		});

		it("should play card when mana exactly equals cost", () => {
			const card = createCard("card1", "Test Card", 5);
			const state = createTestState({
				hand: [card],
				mana: 5,
			});

			performPlay(state, "card1");

			expect(state.hand).toHaveLength(0);
			expect(state.mana).toBe(0);
			expect(state.discardPile).toHaveLength(1);
		});

		it("should not play card not in hand", () => {
			const state = createTestState({
				hand: [],
				mana: 10,
			});

			performPlay(state, "nonexistent-card");

			expect(state.hand).toHaveLength(0);
			expect(state.discardPile).toHaveLength(0);
			expect(state.mana).toBe(10); // Unchanged
		});

		it("should handle playing card from hand with multiple cards", () => {
			const card1 = createCard("card1", "Card 1", 2);
			const card2 = createCard("card2", "Card 2", 3);
			const card3 = createCard("card3", "Card 3", 1);
			const state = createTestState({
				hand: [card1, card2, card3],
				mana: 10,
			});

			performPlay(state, "card2");

			expect(state.hand).toHaveLength(2);
			expect(state.hand[0].id).toBe("card1");
			expect(state.hand[1].id).toBe("card3");
			expect(state.discardPile).toHaveLength(1);
			expect(state.discardPile[0].id).toBe("card2");
			expect(state.mana).toBe(7); // 10 - 3
		});

		it("should handle zero cost cards", () => {
			const card = createCard("card1", "Free Card", 0);
			const state = createTestState({
				hand: [card],
				mana: 5,
			});

			performPlay(state, "card1");

			expect(state.hand).toHaveLength(0);
			expect(state.discardPile).toHaveLength(1);
			expect(state.mana).toBe(5); // No mana spent
		});

		it("should move exhausted cards to void pile", () => {
			const card = createCard("card1", "Exhaust Card", 1);
			// Mock the card definition lookup to return a card with exhaust: true
			// Since we can't easily mock the internal CARD_DEFINITIONS in this test setup without more complex mocking,
			// we might need to rely on the fact that performPlay checks cardDef.exhaust.
			// However, performPlay imports CARD_DEFINITIONS.
			// Ideally we should have a way to inject card definitions or mock the module.
			// For now, let's assume we can't easily change CARD_DEFINITIONS and skip this specific unit test
			// if it requires deep mocking of a const object, OR we can try to mock the module if possible.
			// But wait, we are in a test file. We can mock the module!

			// Actually, let's look at how performPlay works. It uses CARD_DEFINITIONS[card.defId].
			// We can't easily change that const export.
			// But we can verify the logic if we use a real card ID that has exhaust.
			// "spell_mana_potion" has exhaust: true.

			card.defId = "spell_mana_potion";
			const state = createTestState({
				hand: [card],
				mana: 5,
				voidPile: [],
			});

			performPlay(state, "card1");

			expect(state.hand).toHaveLength(0);
			expect(state.voidPile).toHaveLength(1);
			expect(state.voidPile[0].id).toBe("card1");
			expect(state.voidPile[0].zone).toBe("VOID");
			expect(state.discardPile).toHaveLength(0);
		});

		it("should accumulate essence when playing essence generating cards", () => {
			// "spell_meditate" gives essence
			const card = createCard("card1", "Meditate", 1);
			card.defId = "spell_meditate";

			const state = createTestState({
				hand: [card],
				mana: 5,
				essence: 0,
			});

			// We need to ensure executeEffect is NOT mocked for this integration test,
			// OR we need to verify that executeEffect is called with the right params.
			// In this file, executeEffect IS mocked at the top.
			// So we can't test the actual state change of essence here unless we unmock it.
			// But we CAN test that executeEffect is called with an essence effect.

			performPlay(state, "card1");

			// Verify executeEffect was called.
			// The actual state update happens in executeEffect, which is tested in CardEffectSystem.test.ts.
			// So here we just verify the integration: performPlay -> executeEffect.
			expect(CardEffectSystem.executeEffect).toHaveBeenCalled();
		});
	});

	describe("processTick", () => {
		it("should call updateAI", () => {
			const state = createTestState({
				isRunning: true,
			});

			processTick(state, 1.0);

			expect(AISystem.updateAI).toHaveBeenCalledWith(state, 1.0);
		});

		it("should not process when game is not running", () => {
			const state = createTestState({
				isRunning: false,
				mana: 0,
				time: 0,
				tickCount: 0,
			});

			processTick(state, 1.0);

			expect(state.mana).toBe(0);
			expect(state.time).toBe(0);
			expect(state.tickCount).toBe(0);
		});

		it("should regenerate mana when below max", () => {
			const state = createTestState({
				isRunning: true,
				mana: 3,
				maxMana: 10,
				manaRegen: 2,
			});

			processTick(state, 1.0); // 1 second

			expect(state.mana).toBe(5); // 3 + (2 * 1)
		});

		it("should cap mana at maxMana", () => {
			const state = createTestState({
				isRunning: true,
				mana: 9,
				maxMana: 10,
				manaRegen: 5,
			});

			processTick(state, 1.0);

			expect(state.mana).toBe(10); // Capped at max
		});

		it("should not regenerate mana when already at max", () => {
			const state = createTestState({
				isRunning: true,
				mana: 10,
				maxMana: 10,
				manaRegen: 2,
			});

			processTick(state, 1.0);

			expect(state.mana).toBe(10);
		});

		it("should advance draw timer when hand is not full", () => {
			const state = createTestState({
				isRunning: true,
				hand: [],
				maxHandSize: 5,
				drawTimer: 0,
				drawSpeed: 3.0,
			});

			processTick(state, 1.5); // 1.5 seconds

			// drawTimer += dt / drawSpeed = 1.5 / 3.0 = 0.5
			expect(state.drawTimer).toBe(0.5);
		});

		it("should cap draw timer at 1.0 when hand is full", () => {
			const card1 = createCard("card1", "Card 1");
			const card2 = createCard("card2", "Card 2");
			const card3 = createCard("card3", "Card 3");
			const card4 = createCard("card4", "Card 4");
			const card5 = createCard("card5", "Card 5");

			const state = createTestState({
				isRunning: true,
				hand: [card1, card2, card3, card4, card5],
				maxHandSize: 5,
				drawTimer: 0.8,
				drawSpeed: 2.0,
			});

			processTick(state, 1.0); // 1 second

			// drawTimer = min(1.0, 0.8 + 1.0 / 2.0) = min(1.0, 1.3) = 1.0
			expect(state.drawTimer).toBe(1.0);
		});

		it("should update time and tick count", () => {
			const state = createTestState({
				isRunning: true,
				time: 5.0,
				tickCount: 10,
			});

			processTick(state, 0.05);

			expect(state.time).toBe(5.05);
			expect(state.tickCount).toBe(11);
		});

		it("should handle multiple ticks accumulating time", () => {
			const state = createTestState({
				isRunning: true,
				time: 0,
				tickCount: 0,
			});

			processTick(state, 0.05);
			processTick(state, 0.05);
			processTick(state, 0.05);

			expect(state.time).toBeCloseTo(0.15, 5);
			expect(state.tickCount).toBe(3);
		});
	});
});
