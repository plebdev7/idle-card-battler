import type React from "react";
import { useGameStore } from "../../../state/store";
import styles from "./HandView.module.css";

export const HandView: React.FC = () => {
	const hand = useGameStore((state) => state.hand);
	const mana = useGameStore((state) => state.mana);

	return (
		<div className={styles.handContainer}>
			{hand.length === 0 && <div className={styles.emptyHand}>Hand Empty</div>}
			{hand.map((card) => {
				const isPlayable = mana >= card.currentCost;
				return (
					<div
						key={card.id}
						className={`${styles.card} ${
							isPlayable ? styles.cardPlayable : styles.cardUnplayable
						}`}
					>
						<div className={styles.cardName}>{card.name}</div>
						<div className={styles.cardCost}>{card.currentCost}</div>
					</div>
				);
			})}
		</div>
	);
};
