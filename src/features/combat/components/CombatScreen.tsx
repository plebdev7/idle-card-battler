import type React from "react";
import { useEffect } from "react";
import { useGameLoop } from "../hooks/useGameLoop";
import { type CardInstance, useCombatStore } from "../state/combatStore";
import { DiscardPileView } from "./DiscardPileView";
import { DrawPileView } from "./DrawPileView";
import { DrawTimer } from "./DrawTimer";
import { HandView } from "./HandView";
import { ManaDisplay } from "./ManaDisplay";

const TEST_DECK: CardInstance[] = [
	{ id: "1", defId: "strike", name: "Strike", zone: "DRAW", currentCost: 1 },
	{ id: "2", defId: "strike", name: "Strike", zone: "DRAW", currentCost: 1 },
	{ id: "3", defId: "defend", name: "Defend", zone: "DRAW", currentCost: 1 },
	{
		id: "4",
		defId: "fireball",
		name: "Fireball",
		zone: "DRAW",
		currentCost: 2,
	},
	{ id: "5", defId: "heal", name: "Heal", zone: "DRAW", currentCost: 2 },
	{ id: "6", defId: "strike", name: "Strike", zone: "DRAW", currentCost: 1 },
	{ id: "7", defId: "defend", name: "Defend", zone: "DRAW", currentCost: 1 },
	{ id: "8", defId: "zap", name: "Zap", zone: "DRAW", currentCost: 0 },
	{ id: "9", defId: "zap", name: "Zap", zone: "DRAW", currentCost: 0 },
	{ id: "10", defId: "meteor", name: "Meteor", zone: "DRAW", currentCost: 5 },
];

export const CombatScreen: React.FC = () => {
	const initializeCombat = useCombatStore((state) => state.initializeCombat);

	// Start the game loop
	useGameLoop();

	useEffect(() => {
		initializeCombat(TEST_DECK);
	}, [initializeCombat]);

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
