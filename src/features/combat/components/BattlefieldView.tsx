import type React from "react";
import { useGameStore } from "../../../state/store";
import type { Entity } from "../../../types/game";

export const BattlefieldView: React.FC = () => {
	const enemies = useGameStore((state) => state.enemies);
	const tower = useGameStore((state) => state.tower);

	return (
		<div
			style={{
				height: "300px",
				border: "2px solid #444",
				borderRadius: "8px",
				position: "relative",
				backgroundColor: "#2a2a2a",
				overflow: "hidden",
				marginBottom: "20px",
			}}
		>
			{/* Tower / Player Base */}
			<div
				style={{
					position: "absolute",
					left: "0",
					bottom: "0",
					width: "60px",
					height: "100%",
					backgroundColor: "#4a90e2",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "white",
					writingMode: "vertical-rl",
					textOrientation: "mixed",
					zIndex: 10,
				}}
			>
				<div>
					Tower HP: {tower.stats.hp}/{tower.stats.maxHp}
				</div>
			</div>

			{/* Enemies */}
			{enemies.map((enemy: Entity) => (
				<div
					key={enemy.id}
					style={{
						position: "absolute",
						left: `${enemy.position}%`,
						bottom: "20px",
						width: "40px",
						height: "40px",
						backgroundColor: "#e74c3c",
						border: "2px solid #c0392b",
						borderRadius: "4px",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						color: "white",
						fontSize: "10px",
						transition: "left 0.1s linear",
					}}
				>
					<div style={{ fontWeight: "bold" }}>E</div>
					<div>
						{enemy.stats.hp}/{enemy.stats.maxHp}
					</div>
				</div>
			))}

			{enemies.length === 0 && (
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						color: "#666",
					}}
				>
					No Enemies
				</div>
			)}
		</div>
	);
};
