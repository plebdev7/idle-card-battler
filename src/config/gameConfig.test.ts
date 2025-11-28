import { describe, expect, it } from "vitest";
import { gameConfig } from "./gameConfig";

describe("gameConfig", () => {
	it("is defined", () => {
		expect(gameConfig).toBeDefined();
	});

	it("has valid combat settings", () => {
		expect(gameConfig.combat.laneMin).toBeLessThan(gameConfig.combat.laneMax);
		expect(gameConfig.combat.minAttackSpeed).toBeGreaterThan(0);
		expect(gameConfig.combat.entityRadius).toBeGreaterThan(0);
	});

	it("has valid projectile settings", () => {
		expect(gameConfig.projectiles.cullMin).toBeLessThan(
			gameConfig.projectiles.cullMax,
		);
	});

	it("has valid wave settings", () => {
		expect(gameConfig.waves.clearingDelay).toBeGreaterThanOrEqual(0);
		expect(gameConfig.waves.spawnStagger).toBeGreaterThanOrEqual(0);
		expect(gameConfig.waves.bossFloorFrequency).toBeGreaterThan(0);
	});
});
