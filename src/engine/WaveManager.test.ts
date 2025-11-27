import { beforeEach, describe, expect, it } from "vitest";
import type { Entity, GameData } from "../types/game";
import {
	checkLossCondition,
	startNextFloor,
	startWave,
	updateAutoContinue,
	updateWaveManager,
} from "./WaveManager";

// Mock GameData helper
function createMockState(): GameData {
	return {
		gold: 0,
		mana: 0,
		maxMana: 100,
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
		hand: [],
		drawPile: [],
		discardPile: [],
		voidPile: [],
		drawTimer: 0,
		drawSpeed: 1,
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
		isRunning: true,
		tickCount: 0,
		time: 0,
	};
}

describe("WaveManager", () => {
	let state: GameData;

	beforeEach(() => {
		state = createMockState();
	});

	describe("startWave", () => {
		it("should initialize spawn queue and set phase to SPAWNING", () => {
			startWave(state, 1, 1);
			expect(state.wave.phase).toBe("SPAWNING");
			expect(state.wave.spawnQueue.length).toBeGreaterThan(0);
			expect(state.wave.spawnQueue[0].spawned).toBe(false);
		});
	});

	describe("updateWaveManager", () => {
		it("should spawn enemies when time is reached", () => {
			startWave(state, 1, 1);
			// Force first spawn time to be now
			state.wave.spawnQueue[0].spawnTime = 0;

			updateWaveManager(state, 0.1);

			expect(state.enemies.length).toBe(1);
			expect(state.wave.spawnQueue[0].spawned).toBe(true);
		});

		it("should transition to ACTIVE when all enemies spawned", () => {
			startWave(state, 1, 1);
			// Mark all as spawned
			for (const e of state.wave.spawnQueue) {
				e.spawned = true;
			}

			updateWaveManager(state, 0.1);
			expect(state.wave.phase).toBe("ACTIVE");
		});

		it("should transition to CLEARING when all enemies dead", () => {
			state.wave.phase = "ACTIVE";
			state.enemies = []; // No enemies

			updateWaveManager(state, 0.1);
			expect(state.wave.phase).toBe("CLEARING");
			expect(state.wave.phaseTimer).toBe(2.0);
		});

		it("should transition to COMPLETED after clearing delay", () => {
			state.wave.phase = "CLEARING";
			state.wave.phaseTimer = 0.1;

			updateWaveManager(state, 0.2); // Exceed timer
			expect(state.wave.phase).toBe("COMPLETED");
		});

		it("should grant rewards on completion", () => {
			state.wave.phase = "CLEARING";
			state.wave.phaseTimer = 0.1;
			state.gold = 0;

			updateWaveManager(state, 0.2);
			expect(state.gold).toBeGreaterThan(0);
		});

		it("should increment wave number on completion", () => {
			state.wave.current = 1;
			state.wave.phase = "CLEARING";
			state.wave.phaseTimer = 0.1;

			updateWaveManager(state, 0.2);
			expect(state.wave.current).toBe(2);
		});
	});

	describe("startNextFloor", () => {
		it("should increment floor and reset wave", () => {
			state.wave.floor = 1;
			state.wave.current = 5;

			startNextFloor(state);

			expect(state.wave.floor).toBe(2);
			expect(state.wave.current).toBe(1);
			expect(state.wave.phase).toBe("SPAWNING");
		});

		it("should clear combat state", () => {
			state.enemies = [{} as Entity];
			state.summons = [{} as Entity];
			state.projectiles = [{} as Entity];

			startNextFloor(state);

			expect(state.enemies.length).toBe(0);
			expect(state.summons.length).toBe(0);
			expect(state.projectiles.length).toBe(0);
		});
	});

	describe("checkLossCondition", () => {
		it("should return true and stop game if tower hp <= 0", () => {
			state.tower.stats.hp = 0;
			const lost = checkLossCondition(state);
			expect(lost).toBe(true);
			expect(state.isRunning).toBe(false);
			expect(state.tower.state).toBe("DEAD");
		});

		it("should return false if tower hp > 0", () => {
			state.tower.stats.hp = 10;
			const lost = checkLossCondition(state);
			expect(lost).toBe(false);
			expect(state.isRunning).toBe(true);
		});

		it("should handle tower death during CLEARING phase", () => {
			state.wave.phase = "CLEARING";
			state.wave.phaseTimer = 1.0;
			state.tower.stats.hp = 0;

			checkLossCondition(state);

			expect(state.isRunning).toBe(false);
			expect(state.tower.state).toBe("DEAD");
		});
	});

	describe("Spawning Logic - Multiple Enemies", () => {
		it("should spawn multiple enemies with staggered timing", () => {
			// Wave 1-1 has 3 skeleton grunts with count: 3
			startWave(state, 1, 1);

			// Should have 3 entries in spawn queue (count: 3)
			expect(state.wave.spawnQueue.length).toBe(3);

			// Each should have staggered spawn times
			const times = state.wave.spawnQueue.map((e) => e.spawnTime);
			expect(times[0]).toBeLessThan(times[1]);
			expect(times[1]).toBeLessThan(times[2]);
		});

		it("should handle waves with multiple spawn groups", () => {
			// Wave 1-2 has 2 groups with different delays
			startWave(state, 1, 2);

			// 2 grunts at delay 0, 2 grunts at delay 2
			expect(state.wave.spawnQueue.length).toBe(4);

			// Check spawn times are properly set
			const firstGroupTime = state.wave.spawnQueue[0].spawnTime;
			const secondGroupTime = state.wave.spawnQueue[2].spawnTime;

			expect(secondGroupTime).toBeGreaterThan(firstGroupTime);
		});

		it("should spawn all enemies at their designated times", () => {
			startWave(state, 1, 1);
			state.time = 0;

			// Set all spawn times to trigger
			for (const e of state.wave.spawnQueue) {
				e.spawnTime = 0;
			}

			updateWaveManager(state, 0.1);

			expect(state.enemies.length).toBe(3);
			expect(state.wave.phase).toBe("ACTIVE");
		});

		it("should handle empty spawn queue edge case", () => {
			state.wave.spawnQueue = [];
			state.wave.phase = "SPAWNING";

			updateWaveManager(state, 0.1);

			// Should transition to ACTIVE immediately
			expect(state.wave.phase).toBe("ACTIVE");
		});
	});

	describe("Auto-Continue System", () => {
		it("should trigger wave start after delay when enabled", () => {
			state.wave.phase = "COMPLETED";
			state.wave.current = 1;
			state.autoContinue = true;
			state.autoContinueTimer = 0.5;

			updateAutoContinue(state, 1.0); // Exceed timer

			expect(state.wave.phase).toBe("SPAWNING");
		});

		it("should not trigger when auto-continue is disabled", () => {
			state.wave.phase = "COMPLETED";
			state.wave.current = 1;
			state.autoContinue = false;
			state.autoContinueTimer = 0.5;

			updateAutoContinue(state, 1.0);

			expect(state.wave.phase).toBe("COMPLETED");
		});

		it("should reset timer after triggering", () => {
			state.wave.phase = "COMPLETED";
			state.wave.current = 1;
			state.autoContinue = true;
			state.autoContinueDelay = 3.0;
			state.autoContinueTimer = 0.5;

			updateAutoContinue(state, 1.0);

			expect(state.autoContinueTimer).toBe(3.0);
		});

		it("should not trigger in phases other than COMPLETED", () => {
			state.wave.phase = "ACTIVE";
			state.autoContinue = true;
			state.autoContinueTimer = 0.5;
			const initialPhase = state.wave.phase;

			updateAutoContinue(state, 1.0);

			expect(state.wave.phase).toBe(initialPhase);
		});
	});

	describe("Wave Progression", () => {
		it("should trigger floor completion on last wave", () => {
			state.wave.current = 5;
			state.wave.total = 5;
			state.wave.phase = "CLEARING";
			state.wave.phaseTimer = 0.1;
			state.wave.floor = 1;

			updateWaveManager(state, 0.2);

			// Should advance to floor 2
			expect(state.wave.floor).toBe(2);
			expect(state.wave.current).toBe(1);
		});

		it("should not increment wave past total", () => {
			state.wave.current = 5;
			state.wave.total = 5;
			state.wave.phase = "CLEARING";
			state.wave.phaseTimer = 0.1;

			updateWaveManager(state, 0.2);

			// After floor completes, should reset to wave 1
			expect(state.wave.current).toBe(1);
		});

		it("should grant correct rewards for each wave", () => {
			const initialGold = 100;
			state.gold = initialGold;
			state.wave.phase = "CLEARING";
			state.wave.phaseTimer = 0.1;
			state.wave.current = 1;

			updateWaveManager(state, 0.2);

			// Wave 1-1 gives 10 gold
			expect(state.gold).toBeGreaterThan(initialGold);
		});
	});

	describe("Floor Transitions and Boss Detection", () => {
		it("should set total waves to 1 for boss floors", () => {
			state.wave.floor = 9;
			state.wave.current = 5;
			state.wave.total = 5;

			startNextFloor(state);

			// Floor 10 is a boss floor
			expect(state.wave.floor).toBe(10);
			expect(state.wave.total).toBe(1);
		});

		it("should set total waves to 5 for standard floors", () => {
			state.wave.floor = 10;
			state.wave.current = 1;
			state.wave.total = 1;

			startNextFloor(state);

			// Floor 11 is a standard floor
			expect(state.wave.floor).toBe(11);
			expect(state.wave.total).toBe(5);
		});

		it("should detect boss floors at every 10th floor", () => {
			const bossFloors = [10, 20, 30, 40, 50];
			const standardFloors = [9, 11, 19, 21, 29, 31];

			// Boss floors should have 1 wave
			for (const floor of bossFloors) {
				state.wave.floor = floor - 1;
				startNextFloor(state);
				expect(state.wave.total).toBe(1);
			}

			// Standard floors should have 5 waves
			for (const floor of standardFloors) {
				state.wave.floor = floor - 1;
				startNextFloor(state);
				expect(state.wave.total).toBe(5);
			}
		});

		it("should preserve tower HP across floor transitions", () => {
			state.tower.stats.hp = 50;
			state.tower.stats.maxHp = 100;

			startNextFloor(state);

			expect(state.tower.stats.hp).toBe(50);
			expect(state.tower.stats.maxHp).toBe(100);
		});

		it("should preserve gold across floor transitions", () => {
			state.gold = 500;

			startNextFloor(state);

			expect(state.gold).toBe(500);
		});

		it("should clear projectiles on floor transition", () => {
			state.projectiles = [{} as Entity];

			startNextFloor(state);

			expect(state.projectiles.length).toBe(0);
		});
	});

	describe("Edge Cases", () => {
		it("should handle phase timer at exactly 0.0", () => {
			state.wave.phase = "CLEARING";
			state.wave.phaseTimer = 0.0;

			updateWaveManager(state, 0.0);

			expect(state.wave.phase).toBe("COMPLETED");
		});

		it("should handle very large dt values", () => {
			state.wave.phase = "CLEARING";
			state.wave.phaseTimer = 1.0;

			updateWaveManager(state, 999.0); // Large time jump

			expect(state.wave.phase).toBe("COMPLETED");
		});

		it("should spawn enemies even with very small time increments", () => {
			startWave(state, 1, 1);
			state.wave.spawnQueue[0].spawnTime = 0.001;
			state.time = 0;

			// Advance time very slowly
			for (let i = 0; i < 10; i++) {
				state.time += 0.0001;
				updateWaveManager(state, 0.0001);
			}

			state.time = 0.002; // Past spawn time
			updateWaveManager(state, 0.001);

			expect(state.enemies.length).toBeGreaterThan(0);
		});

		it("should handle COMPLETED phase without auto-continue", () => {
			state.wave.phase = "COMPLETED";
			state.autoContinue = false;

			updateWaveManager(state, 1.0);

			// Should remain in COMPLETED
			expect(state.wave.phase).toBe("COMPLETED");
		});

		it("should handle multiple enemies spawning at exact same time", () => {
			startWave(state, 1, 1);
			// Set all to spawn at same time
			for (const e of state.wave.spawnQueue) {
				e.spawnTime = 0;
				e.spawned = false;
			}

			updateWaveManager(state, 0.1);

			expect(state.enemies.length).toBe(3);
			expect(state.wave.phase).toBe("ACTIVE");
		});
	});

	describe("Boundary Conditions", () => {
		it("should handle wave number 1 (minimum)", () => {
			startWave(state, 1, 1);

			expect(state.wave.phase).toBe("SPAWNING");
			expect(state.wave.spawnQueue.length).toBeGreaterThan(0);
		});

		it("should handle wave number 5 (maximum for standard floor)", () => {
			startWave(state, 1, 5);

			expect(state.wave.phase).toBe("SPAWNING");
			expect(state.wave.spawnQueue.length).toBeGreaterThan(0);
		});

		it("should handle floor 9 to 10 transition (pre-boss to boss)", () => {
			state.wave.floor = 9;
			state.wave.current = 5;
			state.wave.total = 5;

			startNextFloor(state);

			expect(state.wave.floor).toBe(10);
			expect(state.wave.total).toBe(1);
		});

		it("should handle floor 10 to 11 transition (boss to standard)", () => {
			state.wave.floor = 10;
			state.wave.current = 1;
			state.wave.total = 1;

			startNextFloor(state);

			expect(state.wave.floor).toBe(11);
			expect(state.wave.total).toBe(5);
		});

		it("should handle spawn time precision edge cases", () => {
			startWave(state, 1, 1);
			state.wave.spawnQueue[0].spawnTime = 1.0;
			state.time = 0.9999999;

			updateWaveManager(state, 0.1);

			// Should NOT spawn yet (time < spawnTime by tiny margin)
			// Then should spawn when time advances
			state.time = 1.0;
			updateWaveManager(state, 0.1);

			expect(state.wave.spawnQueue[0].spawned).toBe(true);
		});
	});
});
