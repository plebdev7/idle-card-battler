import type React from "react";
import { useCombatStore } from "../state/combatStore";

export const HandView: React.FC = () => {
	const hand = useCombatStore((state) => state.zones.hand);
	const mana = useCombatStore((state) => state.mana);

	return (
		<div
			style={{
				display: "flex",
				gap: "10px",
				padding: "20px",
				border: "1px solid #ccc",
				minHeight: "150px",
				alignItems: "center",
				marginTop: "20px",
			}}
		>
			{hand.length === 0 && <div style={{ color: "#999" }}>Hand Empty</div>}
			{hand.map((card) => (
				<div
					key={card.id}
					style={{
						width: "100px",
						height: "140px",
						border: "1px solid #333",
						borderRadius: "8px",
						padding: "5px",
						backgroundColor: mana.current >= card.currentCost ? "#fff" : "#ddd",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						opacity: mana.current >= card.currentCost ? 1 : 0.6,
					}}
				>
					<div style={{ fontWeight: "bold", fontSize: "0.9em" }}>
						{card.name}
					</div>
					<div
						style={{
							alignSelf: "flex-end",
							backgroundColor: "blue",
							color: "white",
							borderRadius: "50%",
							width: "24px",
							height: "24px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{card.currentCost}
					</div>
				</div>
			))}
		</div>
	);
};
