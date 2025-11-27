import { beforeEach, describe, expect, it } from "vitest";
import { INITIAL_DECK } from "../data/cards";
import { BASE_ENEMY_STATS } from "../data/enemies";
import { useGameStore } from "./store";

describe("useGameStore", () => {
	beforeEach(() => {
		// Reset store to initial state before each test
		useGameStore.setState({
			gold: 0,
			mana: 0,
			maxMana: 10,
			manaRegen: 1,
			essence: 0,
			hand: [],
			drawPile: [],
			discardPile: [],
			voidPile: [],
			drawTimer: 0,
			drawSpeed: 3.0,
			maxHandSize: 5,
			enemies: [],
			projectiles: [],
			isRunning: false,
			tickCount: 0,
			time: 0,
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
		});
	});

	describe("initializeGame", () => {
		it("should initialize draw pile with cards from INITIAL_DECK", () => {
			const { initializeGame } = useGameStore.getState();

			initializeGame();

			const state = useGameStore.getState();
			expect(state.drawPile).toHaveLength(INITIAL_DECK.length);
		});

		it("should create card instances with unique IDs", () => {
			const { initializeGame } = useGameStore.getState();

			initializeGame();

			const state = useGameStore.getState();
			const ids = state.drawPile.map((card) => card.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length); // All IDs should be unique
		});

		it("should set all cards to DRAW zone", () => {
			const { initializeGame } = useGameStore.getState();

			initializeGame();

			const state = useGameStore.getState();
			state.drawPile.forEach((card) => {
				expect(card.zone).toBe("DRAW");
			});
		});

		it("should copy card properties from INITIAL_DECK", () => {
			const { initializeGame } = useGameStore.getState();

			initializeGame();

			const state = useGameStore.getState();
			expect(state.drawPile[0].name).toBe(INITIAL_DECK[0].name);
			expect(state.drawPile[0].defId).toBe(INITIAL_DECK[0].id);
			expect(state.drawPile[0].currentCost).toBe(INITIAL_DECK[0].cost);
		});

		it("should clear hand to empty array", () => {
			const { initializeGame } = useGameStore.getState();

			// Set up some cards in hand
			useGameStore.setState({
				hand: [
					{
						id: "test1",
						defId: "spell_fireball",
						name: "Test",
						zone: "HAND",
						currentCost: 1,
					},
				],
			});

			initializeGame();

			const state = useGameStore.getState();
			expect(state.hand).toEqual([]);
		});

		it("should clear discard pile to empty array", () => {
			const { initializeGame } = useGameStore.getState();

			useGameStore.setState({
				discardPile: [
					{
						id: "test1",
						defId: "spell_fireball",
						name: "Test",
						zone: "DISCARD",
						currentCost: 1,
					},
				],
			});

			initializeGame();

			const state = useGameStore.getState();
			expect(state.discardPile).toEqual([]);
		});

		it("should clear void pile to empty array", () => {
			const { initializeGame } = useGameStore.getState();

			useGameStore.setState({
				voidPile: [
					{
						id: "test1",
						defId: "spell_fireball",
						name: "Test",
						zone: "VOID",
						currentCost: 1,
					},
				],
			});

			initializeGame();

			const state = useGameStore.getState();
			expect(state.voidPile).toEqual([]);
		});

		it("should reset mana to 0", () => {
			const { initializeGame } = useGameStore.getState();

			useGameStore.setState({ mana: 10 });

			initializeGame();

			const state = useGameStore.getState();
			expect(state.mana).toBe(0);
		});

		it("should reset time to 0", () => {
			const { initializeGame } = useGameStore.getState();

			useGameStore.setState({ time: 123.45 });

			initializeGame();

			const state = useGameStore.getState();
			expect(state.time).toBe(0);
		});

		it("should reset tickCount to 0", () => {
			const { initializeGame } = useGameStore.getState();

			useGameStore.setState({ tickCount: 500 });

			initializeGame();

			const state = useGameStore.getState();
			expect(state.tickCount).toBe(0);
		});

		it("should set isRunning to false", () => {
			const { initializeGame } = useGameStore.getState();

			useGameStore.setState({ isRunning: true });

			initializeGame();

			const state = useGameStore.getState();
			expect(state.isRunning).toBe(false);
		});

		it("should initialize essence to 0", () => {
			const { initializeGame } = useGameStore.getState();

			useGameStore.setState({ essence: 100 });

			initializeGame();

			const state = useGameStore.getState();
			expect(state.essence).toBe(0);
		});
	});

	describe("tick", () => {
		it("should process tick when game is running", () => {
			const { tick, toggleGame } = useGameStore.getState();

			toggleGame(); // Start the game
			const initialTime = useGameStore.getState().time;

			tick(0.05);

			const state = useGameStore.getState();
			expect(state.time).toBeGreaterThan(initialTime);
		});

		it("should increment tickCount", () => {
			const { tick, toggleGame } = useGameStore.getState();

			toggleGame(); // Start the game

			tick(0.05);

			const state = useGameStore.getState();
			expect(state.tickCount).toBe(1);
		});

		it("should regenerate mana based on dt", () => {
			const { tick, toggleGame } = useGameStore.getState();

			useGameStore.setState({ mana: 0, manaRegen: 2, maxMana: 10 });
			toggleGame();

			tick(1.0); // 1 second

			const state = useGameStore.getState();
			expect(state.mana).toBe(2); // 0 + (2 * 1)
		});

		it("should handle fractional delta time", () => {
			const { tick, toggleGame } = useGameStore.getState();

			toggleGame();

			tick(0.016); // ~16ms frame

			const state = useGameStore.getState();
			expect(state.time).toBeCloseTo(0.016, 5);
		});
	});

	describe("playCard", () => {
		it("should play a card when valid", () => {
			const { playCard } = useGameStore.getState();

			const testCard = {
				id: "test-card-1",
				defId: "spell_fireball",
				name: "Test Card",
				zone: "HAND" as const,
				currentCost: 2,
			};

			useGameStore.setState({
				hand: [testCard],
				mana: 5,
				discardPile: [],
			});

			playCard("test-card-1");

			const state = useGameStore.getState();
			expect(state.hand).toHaveLength(0);
			expect(state.discardPile).toHaveLength(1);
			expect(state.mana).toBe(3); // 5 - 2
		});

		it("should not affect state when card not in hand", () => {
			const { playCard } = useGameStore.getState();

			useGameStore.setState({
				hand: [],
				mana: 10,
			});

			playCard("nonexistent-card");

			const state = useGameStore.getState();
			expect(state.hand).toHaveLength(0);
			expect(state.mana).toBe(10); // Unchanged
		});

		it("should not play card with insufficient mana", () => {
			const { playCard } = useGameStore.getState();

			const testCard = {
				id: "test-card-1",
				defId: "spell_fireball",
				name: "Expensive Card",
				zone: "HAND" as const,
				currentCost: 7,
			};

			useGameStore.setState({
				hand: [testCard],
				mana: 3,
			});

			playCard("test-card-1");

			const state = useGameStore.getState();
			expect(state.hand).toHaveLength(1); // Card still in hand
			expect(state.mana).toBe(3); // Mana unchanged
		});
	});

	describe("toggleGame", () => {
		it("should toggle isRunning from false to true", () => {
			const { toggleGame } = useGameStore.getState();

			expect(useGameStore.getState().isRunning).toBe(false);

			toggleGame();

			expect(useGameStore.getState().isRunning).toBe(true);
		});

		it("should toggle isRunning from true to false", () => {
			const { toggleGame } = useGameStore.getState();

			useGameStore.setState({ isRunning: true });

			toggleGame();

			expect(useGameStore.getState().isRunning).toBe(false);
		});

		it("should toggle multiple times correctly", () => {
			const { toggleGame } = useGameStore.getState();

			toggleGame(); // false -> true
			expect(useGameStore.getState().isRunning).toBe(true);

			toggleGame(); // true -> false
			expect(useGameStore.getState().isRunning).toBe(false);

			toggleGame(); // false -> true
			expect(useGameStore.getState().isRunning).toBe(true);
		});
	});

	describe("spawnEnemy", () => {
		it("should add an enemy to the enemies array", () => {
			const { spawnEnemy } = useGameStore.getState();

			spawnEnemy();

			const state = useGameStore.getState();
			expect(state.enemies).toHaveLength(1);
		});

		it("should create enemy with unique ID", () => {
			const { spawnEnemy } = useGameStore.getState();

			spawnEnemy();

			const state = useGameStore.getState();
			expect(state.enemies[0].id).toBeDefined();
			expect(typeof state.enemies[0].id).toBe("string");
			expect(state.enemies[0].id.length).toBeGreaterThan(0);
		});

		it("should create enemy with correct type", () => {
			const { spawnEnemy } = useGameStore.getState();

			spawnEnemy();

			const state = useGameStore.getState();
			expect(state.enemies[0].type).toBe("ENEMY");
		});

		it("should create enemy with base stats", () => {
			const { spawnEnemy } = useGameStore.getState();

			spawnEnemy();

			const state = useGameStore.getState();
			expect(state.enemies[0].stats).toEqual(BASE_ENEMY_STATS);
		});

		it("should create enemy at default position 100", () => {
			const { spawnEnemy } = useGameStore.getState();

			spawnEnemy();

			const state = useGameStore.getState();
			expect(state.enemies[0].position).toBe(100);
		});

		it("should create enemy with WALKING state", () => {
			const { spawnEnemy } = useGameStore.getState();

			spawnEnemy();

			const state = useGameStore.getState();
			expect(state.enemies[0].state).toBe("WALKING");
		});

		it("should spawn multiple enemies with different IDs", () => {
			const { spawnEnemy } = useGameStore.getState();

			spawnEnemy();
			spawnEnemy();
			spawnEnemy();

			const state = useGameStore.getState();
			expect(state.enemies).toHaveLength(3);

			const ids = state.enemies.map((e) => e.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(3); // All IDs should be unique
		});
	});
});
