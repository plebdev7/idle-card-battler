/**
 * Core game configuration.
 * Centralized config object for engine tuning and future runtime configuration.
 */

export const gameConfig = {
	combat: {
		// Lane boundaries (1D combat space)
		laneMin: 0,
		laneMax: 100,
		laneSpawnPosition: 100, // Enemy spawn point (right side)
		towerPosition: 0, // Tower position (left side)

		// Collision detection
		entityRadius: 1.0, // Hitbox radius for entities

		// Attack system
		minAttackSpeed: 0.1, // Prevent division by zero (results in 10s cooldown)
	},

	projectiles: {
		// Projectile culling bounds (prevents infinite projectiles)
		cullMin: -10,
		cullMax: 110,
	},

	statusEffects: {
		// DoT (Damage/Heal over Time) tick rate
		tickInterval: 1.0, // Seconds between ticks
	},

	waves: {
		// Wave progression timing
		clearingDelay: 2.0, // Delay before marking wave complete (seconds)
		spawnStagger: 0.5, // Delay between spawning units in same group (seconds)

		// Floor structure
		bossFloorFrequency: 10, // Boss appears every N floors
	},
} as const;

// Type for the config (useful for future runtime config)
export type GameConfig = typeof gameConfig;
