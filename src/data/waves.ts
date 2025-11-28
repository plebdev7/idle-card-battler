export interface SpawnEvent {
	enemyDefId: string; // Enemy type (e.g., 'SKELETON_GRUNT')
	position: number; // Spawn position (default 100)
	delay: number; // Seconds after wave start
	count?: number; // Number of this enemy (default 1)
}

export interface WaveRewards {
	gold: number;
	essence?: number;
}

export interface WaveConfig {
	waveId: string; // Unique identifier
	floor: number; // Which floor this applies to
	waveNumber: number; // Wave number within floor (1-5)
	spawns: SpawnEvent[]; // Enemy spawn events
	difficulty: number; // Scaling multiplier (future use)
	rewards?: WaveRewards; // Gold/Essence for completion
}

// Floor 1 Wave Configurations
export const FLOOR_1_WAVES: WaveConfig[] = [
	{
		waveId: "floor1_wave1",
		floor: 1,
		waveNumber: 1,
		spawns: [
			{ enemyDefId: "SKELETON_GRUNT", position: 100, delay: 0.0, count: 3 },
		],
		difficulty: 1.0,
		rewards: { gold: 10 },
	},
	{
		waveId: "floor1_wave2",
		floor: 1,
		waveNumber: 2,
		spawns: [
			{ enemyDefId: "SKELETON_GRUNT", position: 100, delay: 0.0, count: 2 },
			{ enemyDefId: "SKELETON_GRUNT", position: 95, delay: 2.0, count: 2 },
		],
		difficulty: 1.0,
		rewards: { gold: 15 },
	},
	{
		waveId: "floor1_wave3",
		floor: 1,
		waveNumber: 3,
		spawns: [
			{ enemyDefId: "BONE_SHIELD", position: 100, delay: 0.0 },
			{ enemyDefId: "SKELETON_GRUNT", position: 90, delay: 3.0, count: 2 },
		],
		difficulty: 1.1,
		rewards: { gold: 20 },
	},
	{
		waveId: "floor1_wave4",
		floor: 1,
		waveNumber: 4,
		spawns: [
			{ enemyDefId: "SKELETON_GRUNT", position: 100, delay: 0.0, count: 3 },
			{ enemyDefId: "BONE_SHIELD", position: 95, delay: 4.0 },
			{ enemyDefId: "SKELETON_GRUNT", position: 90, delay: 6.0, count: 2 },
		],
		difficulty: 1.1,
		rewards: { gold: 25 },
	},
	{
		waveId: "floor1_wave5",
		floor: 1,
		waveNumber: 5,
		spawns: [
			{ enemyDefId: "BONE_SHIELD", position: 100, delay: 0.0 },
			{ enemyDefId: "SKELETON_GRUNT", position: 90, delay: 2.0, count: 2 },
			{ enemyDefId: "SKELETON_GRUNT", position: 95, delay: 4.0, count: 2 },
		],
		difficulty: 1.2,
		rewards: { gold: 50 },
	},
];

export function getWaveConfig(floor: number, wave: number): WaveConfig {
	// Validate inputs
	if (floor < 1) {
		console.warn(`Invalid floor number: ${floor}. Defaulting to floor 1.`);
		floor = 1;
	}
	if (wave < 1 || wave > 5) {
		console.warn(`Invalid wave number: ${wave}. Clamping to 1-5.`);
		wave = Math.max(1, Math.min(5, wave));
	}

	// For prototype, loop Floor 1 waves for all floors
	const waveIndex = (wave - 1) % 5;
	const config = FLOOR_1_WAVES[waveIndex];

	if (!config) {
		throw new Error(
			`Critical: No wave config found for floor ${floor}, wave ${wave}`,
		);
	}

	return config;
}
