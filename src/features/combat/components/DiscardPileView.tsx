import type React from "react";
import { useGameStore } from "../../../state/store";

export const DiscardPileView: React.FC = () => {
	const discardSize = useGameStore((state) => state.discardPile.length);

	return (
		<div
			style={{
				width: "80px",
				height: "110px",
				border: "2px solid #999",
				borderRadius: "8px",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#e0e0e0",
				color: "#666",
			}}
		>
			<div style={{ textAlign: "center" }}>
				<div>Discard</div>
				<div style={{ fontSize: "1.5em", fontWeight: "bold" }}>
					{discardSize}
				</div>
			</div>
		</div>
	);
};
