import { useEffect } from "react";
import { useGameLoop } from "../../../engine/GameLoop";
import { useGameStore } from "../../../state/store";
import { BattlefieldView } from "./BattlefieldView";
import { DiscardPileView } from "./DiscardPileView";
import { DrawPileView } from "./DrawPileView";
import { DrawTimer } from "./DrawTimer";
import { HandView } from "./HandView";
import { ManaDisplay } from "./ManaDisplay";

export const CombatScreen: React.FC = () => {
	const initializeGame = useGameStore((state) => state.initializeGame);
	const isRunning = useGameStore((state) => state.isRunning);
	const toggleGame = useGameStore((state) => state.toggleGame);

	// Start the game loop
	useGameLoop();

	useEffect(() => {
		initializeGame();
	}, [initializeGame]);

	return (
		<div style={{ padding: "20px", fontFamily: "sans-serif" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<h1>Combat Prototype</h1>
				<button
					type="button"
					onClick={toggleGame}
					style={{
						padding: "8px 16px",
						fontSize: "16px",
						backgroundColor: isRunning ? "#f1c40f" : "#2ecc71",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
						color: "#fff",
						fontWeight: "bold",
					}}
				>
					{isRunning ? "PAUSE" : "START GAME"}
				</button>
			</div>

			<BattlefieldView />

			<div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
				<div>
					<ManaDisplay />
					<DrawTimer />
				</div>
				<div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
					<DrawPileView />
					<DiscardPileView />
				</div>
			</div>

			<HandView />
		</div>
	);
};
