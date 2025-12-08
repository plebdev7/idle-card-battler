import { useEffect } from "react";
import { useGameLoop } from "../../../engine/GameLoop";
import { useGameStore } from "../../../state/store";
import { BattlefieldView } from "./BattlefieldView";
import { CombatLog } from "./CombatLog";
import { DiscardPileView } from "./DiscardPileView";
import { DrawPileView } from "./DrawPileView";
import { DrawTimer } from "./DrawTimer";
import { HandView } from "./HandView";
import { ManaDisplay } from "./ManaDisplay";

const EssenceDisplay: React.FC = () => {
	const essence = useGameStore((state) => state.essence);
	return (
		<div
			style={{
				padding: "10px",
				backgroundColor: "#8e44ad",
				color: "white",
				borderRadius: "8px",
				textAlign: "center",
				fontWeight: "bold",
				boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
			}}
		>
			<div>Essence</div>
			<div style={{ fontSize: "24px" }}>{essence}</div>
		</div>
	);
};

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

			{/* Main layout: game area on left, combat log on right */}
			<div style={{ display: "flex", gap: "20px" }}>
				{/* Left side - main game area */}
				<div style={{ flex: 1 }}>
					<BattlefieldView />

					<div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
						<div>
							<ManaDisplay />
							<EssenceDisplay />
							<DrawTimer />
						</div>
						<div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
							<DrawPileView />
							<DiscardPileView />
						</div>
					</div>

					<HandView />
				</div>

				{/* Right side - combat log */}
				<div>
					<CombatLog />
				</div>
			</div>
		</div>
	);
};
