import type React from "react";
import { useCombatStore } from "../state/combatStore";

export const ManaDisplay: React.FC = () => {
	const mana = useCombatStore((state) => state.mana);

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
						width: `${(mana.current / mana.max) * 100}%`,
						backgroundColor: "blue",
						transition: "width 0.1s linear",
					}}
				/>
			</div>
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<span>
					{mana.current.toFixed(1)} / {mana.max}
				</span>
				<span style={{ fontSize: "0.8em", color: "#666" }}>
					+{mana.regenRate}/s
				</span>
			</div>
		</div>
	);
};
