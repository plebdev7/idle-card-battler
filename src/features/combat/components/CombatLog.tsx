import { useGameStore } from "../../../state/store";

export const CombatLog: React.FC = () => {
	const combatLog = useGameStore((state) => state.combatLog);

	// Show last 10 entries, newest first
	const recentEntries = combatLog.slice(-10).reverse();

	const getEventColor = (type: string): string => {
		switch (type) {
			case "CARD_PLAYED":
				return "#9b59b6"; // Purple
			case "DAMAGE":
				return "#e74c3c"; // Red
			case "HEAL":
				return "#2ecc71"; // Green
			case "STATUS":
			case "DEBUFF":
				return "#e67e22"; // Orange
			case "WAVE_START":
			case "WAVE_COMPLETE":
				return "#f1c40f"; // Yellow
			case "DEATH":
				return "#c0392b"; // Dark red
			default:
				return "#95a5a6"; // Gray
		}
	};

	const formatTimestamp = (timestamp: number, currentTime: number): string => {
		const diff = currentTime - timestamp;
		if (diff < 1) return "now";
		if (diff < 60) return `${Math.floor(diff)}s ago`;
		return `${Math.floor(diff / 60)}m ago`;
	};

	const currentTime = useGameStore((state) => state.time);

	return (
		<div
			style={{
				padding: "10px",
				backgroundColor: "#2c3e50",
				borderRadius: "8px",
				height: "400px",
				width: "300px",
				display: "flex",
				flexDirection: "column",
				boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
			}}
		>
			<h3
				style={{
					margin: "0 0 10px 0",
					color: "#ecf0f1",
					fontSize: "16px",
					borderBottom: "2px solid #34495e",
					paddingBottom: "8px",
				}}
			>
				Combat Log
			</h3>
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					display: "flex",
					flexDirection: "column",
					gap: "4px",
				}}
			>
				{recentEntries.length === 0 ? (
					<div
						style={{ color: "#95a5a6", fontStyle: "italic", fontSize: "14px" }}
					>
						No events yet...
					</div>
				) : (
					recentEntries.map((entry) => (
						<div
							key={entry.id}
							style={{
								padding: "6px 8px",
								backgroundColor: "#34495e",
								borderRadius: "4px",
								borderLeft: `3px solid ${getEventColor(entry.type)}`,
								fontSize: "13px",
							}}
						>
							<div
								style={{
									color: getEventColor(entry.type),
									fontWeight: "bold",
									marginBottom: "2px",
								}}
							>
								{entry.message}
							</div>
							<div style={{ color: "#95a5a6", fontSize: "11px" }}>
								{formatTimestamp(entry.timestamp, currentTime)}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
