import type React from "react";
import { useGameStore } from "../../../state/store";
import type { Entity } from "../../../types/game";
import styles from "./BattlefieldView.module.css";
import { VisualEffectsOverlay } from "./VisualEffectsOverlay";

export const BattlefieldView: React.FC = () => {
	const enemies = useGameStore((state) => state.enemies);
	const summons = useGameStore((state) => state.summons);
	const projectiles = useGameStore((state) => state.projectiles);
	const tower = useGameStore((state) => state.tower);

	return (
		<div className={styles.container}>
			{/* Tower / Player Base */}
			<div className={styles.tower}>
				<div>
					Tower HP: {tower.stats.hp}/{tower.stats.maxHp}
				</div>
			</div>

			{/* Summons */}
			{summons.map((summon: Entity) => (
				<div
					key={summon.id}
					className={styles.summon}
					style={{ left: `${summon.position}%` }}
				>
					{summon.stats.hp}
				</div>
			))}

			{/* Enemies */}
			{enemies.map((enemy: Entity) => (
				<div
					key={enemy.id}
					className={styles.enemy}
					style={{ left: `${enemy.position}%` }}
				>
					<div className={styles.enemyLabel}>E</div>
					<div>
						{enemy.stats.hp}/{enemy.stats.maxHp}
					</div>
				</div>
			))}

			{/* Projectiles */}
			{projectiles.map((proj: Entity) => (
				<div
					key={proj.id}
					className={styles.projectile}
					style={{ left: `${proj.position}%` }}
				/>
			))}

			<VisualEffectsOverlay />

			{enemies.length === 0 && summons.length === 0 && (
				<div className={styles.noCombat}>No Active Combat</div>
			)}
		</div>
	);
};
