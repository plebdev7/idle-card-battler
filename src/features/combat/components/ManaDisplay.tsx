import type React from "react";
import { useGameStore } from "../../../state/store";

export const ManaDisplay: React.FC = () => {
	const mana = useGameStore((state) => state.mana);
	const maxMana = useGameStore((state) => state.maxMana);
	const manaRegen = useGameStore((state) => state.manaRegen);

	return (
		<div
			style={{
				padding: "10px",
				border: "1px solid #ccc",
				borderRadius: "5px",
				width: "200px",
			}}
		>
			<h3>Mana</h3>
			<div
				style={{
					height: "20px",
					backgroundColor: "#eee",
					borderRadius: "10px",
					overflow: "hidden",
					marginBottom: "5px",
				}}
			>
				<div
					style={{
						height: "100%",
						width: `${(mana / maxMana) * 100}%`,
						backgroundColor: "blue",
						transition: "width 0.1s linear",
					}}
				/>
			</div>
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<span>
					{mana.toFixed(1)} / {maxMana}
				</span>
				<span style={{ fontSize: "0.8em", color: "#666" }}>+{manaRegen}/s</span>
			</div>
		</div>
	);
};
