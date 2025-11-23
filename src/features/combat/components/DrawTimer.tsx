import type React from "react";
import { useGameStore } from "../../../state/store";

export const DrawTimer: React.FC = () => {
	const drawTimer = useGameStore((state) => state.drawTimer);
	const drawSpeed = useGameStore((state) => state.drawSpeed);

	return (
		<div
			style={{
				padding: "10px",
				border: "1px solid #ccc",
				borderRadius: "5px",
				width: "200px",
				marginTop: "10px",
			}}
		>
			<h3>Draw Timer</h3>
			<div
				style={{
					height: "10px",
					backgroundColor: "#eee",
					borderRadius: "5px",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						height: "100%",
						width: `${drawTimer * 100}%`,
						backgroundColor: "green",
						transition: "width 0.1s linear",
					}}
				/>
			</div>
			<div
				style={{
					textAlign: "right",
					fontSize: "0.8em",
					color: "#666",
					marginTop: "2px",
				}}
			>
				{(drawSpeed * (1 - drawTimer)).toFixed(1)}s
			</div>
		</div>
	);
};
