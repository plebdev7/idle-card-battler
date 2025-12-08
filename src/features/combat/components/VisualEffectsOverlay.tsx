import type React from "react";
import { useEffect, useState } from "react";
import { useGameStore } from "../../../state/store";
import type { VisualEffect } from "../../../types/game";
import styles from "./VisualEffectsOverlay.module.css";

export const VisualEffectsOverlay: React.FC = () => {
	const visualEffects = useGameStore((state) => state.visualEffects);
	const [visibleEffects, setVisibleEffects] = useState<VisualEffect[]>([]);

	// Sync with store, but we might want to handle animations locally?
	// For now, just render what's in the store.
	// Optimization: In a real app, we'd probably want to only add new ones and let them expire locally.
	// But since the store is the source of truth, let's just render the last N effects
	// and rely on CSS animations to fade them out.

	// Actually, if we just render from store, they will persist until store is cleared.
	// The plan said "The store should periodically clean up old effects... or the UI can handle the 'pop' animation".
	// Let's filter to only show effects from the last 1 second.
	useEffect(() => {
		const now = Date.now();
		const recent = visualEffects.filter((e) => now - e.timestamp < 1000);
		setVisibleEffects(recent);

		const interval = setInterval(() => {
			const now = Date.now();
			setVisibleEffects(visualEffects.filter((e) => now - e.timestamp < 1000));
		}, 100);

		return () => clearInterval(interval);
	}, [visualEffects]);

	return (
		<div className={styles.overlayContainer}>
			{visibleEffects.map((effect) => (
				<div
					key={effect.id}
					className={styles.effect}
					style={{
						left: `${effect.position}%`,
						color: getColorForEffect(effect.type),
					}}
				>
					{effect.text || effect.value}
				</div>
			))}
		</div>
	);
};

function getColorForEffect(type: VisualEffect["type"]): string {
	switch (type) {
		case "DAMAGE":
			return "#e74c3c"; // Red
		case "HEAL":
			return "#2ecc71"; // Green
		case "BUFF":
			return "#3498db"; // Blue
		case "DEBUFF":
			return "#9b59b6"; // Purple
		case "BLOCK":
			return "#95a5a6"; // Gray
		default:
			return "#fff";
	}
}
