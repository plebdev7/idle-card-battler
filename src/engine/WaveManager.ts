import { gameConfig } from "../config/gameConfig";
import { getWaveConfig } from "../data/waves";
import type { GameData, SpawnQueueEntry } from "../types/game";
import { createEnemy } from "./EntityFactory";

// --- Core Update Loop ---

export function updateWaveManager(state: GameData, dt: number) {
	switch (state.wave.phase) {
		case "SPAWNING":
			updateWaveSpawning(state, dt);
			break;

		case "ACTIVE":
			// Check if all enemies defeated
			if (state.enemies.length === 0) {
				state.wave.phase = "CLEARING";
				state.wave.phaseTimer = gameConfig.waves.clearingDelay;
			}
			break;

		case "CLEARING":
			state.wave.phaseTimer -= dt;
			if (state.wave.phaseTimer <= 0) {
				handleWaveComplete(state);
				state.wave.phase = "COMPLETED";
			}
			break;

		case "COMPLETED":
			// Waiting for external trigger to start next wave
			// (Player clicks "Next Wave" or auto-continue after delay)
			break;
	}
}

// --- Spawning Logic ---

function updateWaveSpawning(state: GameData, _dt: number) {
	// Process spawn queue
	for (const entry of state.wave.spawnQueue) {
		if (!entry.spawned && state.time >= entry.spawnTime) {
			spawnEnemy(state, entry.enemyDefId, entry.position);
			entry.spawned = true;
		}
	}

	// Check if all spawned
	const allSpawned = state.wave.spawnQueue.every((e) => e.spawned);
	if (allSpawned) {
		state.wave.phase = "ACTIVE";
	}
}

function spawnEnemy(state: GameData, defId: string, position: number) {
	const enemy = createEnemy(defId, position);
	state.enemies.push(enemy);
}

// --- Progression Logic ---

function handleWaveComplete(state: GameData) {
	const waveConfig = getWaveConfig(state.wave.floor, state.wave.current);

	// Grant gold rewards (per wave)
	if (waveConfig.rewards) {
		state.gold += waveConfig.rewards.gold;
	}

	console.log(`Wave ${state.wave.current} complete!`);

	// Prepare for next wave (don't auto-start yet)
	if (state.wave.current < state.wave.total) {
		// More waves in this floor
		state.wave.current += 1;
		// Wait for player input or auto-continue timer
	} else {
		// Floor complete
		handleFloorComplete(state);
	}
}

function handleFloorComplete(state: GameData) {
	console.log(`Floor ${state.wave.floor} complete!`);

	// Transition to Break Room (future: UI state change)
	// For prototype: Auto-continue to next floor
	startNextFloor(state);
}

export function startNextFloor(state: GameData) {
	state.wave.floor += 1;
	state.wave.current = 1;
	state.wave.total = isFloorBoss(state.wave.floor) ? 1 : 5;

	// Clear combat state (fresh start each floor)
	state.summons = [];
	state.projectiles = [];
	state.enemies = [];

	// Load first wave of new floor
	startWave(state, state.wave.floor, state.wave.current);
}

function isFloorBoss(floor: number): boolean {
	return floor % gameConfig.waves.bossFloorFrequency === 0;
}

// --- Wave Initialization ---

export function startWave(state: GameData, floor: number, waveNumber: number) {
	const config = getWaveConfig(floor, waveNumber);

	// Build spawn queue
	state.wave.spawnQueue = config.spawns.flatMap((spawn) => {
		const entries: SpawnQueueEntry[] = [];
		const count = spawn.count || 1;

		for (let i = 0; i < count; i++) {
			// Simple staggering for groups
			const staggerDelay = i * gameConfig.waves.spawnStagger;

			entries.push({
				enemyDefId: spawn.enemyDefId,
				position: spawn.position, // Future: Add variance
				spawnTime: state.time + spawn.delay + staggerDelay,
				spawned: false,
			});
		}
		return entries;
	});

	state.wave.phase = "SPAWNING";
	state.wave.phaseTimer = 0;
}

// --- Auto-Continue ---

export function updateAutoContinue(state: GameData, dt: number) {
	if (!state.autoContinue) return;
	if (state.wave.phase !== "COMPLETED") return;

	state.autoContinueTimer -= dt;

	if (state.autoContinueTimer <= 0) {
		// Start next wave
		startWave(state, state.wave.floor, state.wave.current);
		state.autoContinueTimer = state.autoContinueDelay; // Reset
	}
}

// --- Win/Loss ---

export function checkLossCondition(state: GameData): boolean {
	if (state.tower.stats.hp <= 0) {
		state.tower.state = "DEAD";
		state.isRunning = false;
		// Game over state is handled by UI (run stops)
		return true;
	}
	return false;
}
