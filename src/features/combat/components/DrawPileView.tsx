import type React from "react";
import { useGameStore } from "../../../state/store";

export const DrawPileView: React.FC = () => {
	const drawSize = useGameStore((state) => state.drawPile.length);

	return (
		<div
			style={{
				width: "80px",
				height: "110px",
				border: "2px dashed #999",
				borderRadius: "8px",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#f0f0f0",
				color: "#666",
			}}
		>
			<div style={{ textAlign: "center" }}>
				<div>Draw</div>
				<div style={{ fontSize: "1.5em", fontWeight: "bold" }}>{drawSize}</div>
			</div>
		</div>
	);
};
