import { useEffect } from "react";
import { useGameLoop } from "../../../engine/GameLoop";
import { useGameStore } from "../../../state/store";
import { DiscardPileView } from "./DiscardPileView";
import { DrawPileView } from "./DrawPileView";
import { DrawTimer } from "./DrawTimer";
import { HandView } from "./HandView";
import { ManaDisplay } from "./ManaDisplay";

export const CombatScreen: React.FC = () => {
	const initializeGame = useGameStore((state) => state.initializeGame);

	// Start the game loop
	useGameLoop();

	useEffect(() => {
		initializeGame();
	}, [initializeGame]);

	return (
		<div style={{ padding: "20px", fontFamily: "sans-serif" }}>
			<h1>Combat Debug</h1>
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
