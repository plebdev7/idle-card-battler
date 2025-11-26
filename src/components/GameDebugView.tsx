import type React from "react";
import { useGameStore } from "../state/store";
import type { Entity } from "../types/game";

export const GameDebugView: React.FC = () => {
	const {
		mana,
		maxMana,
		tower,
		gold,
		time,
		enemies,
		hand,
		isRunning,
		toggleGame,
		spawnEnemy,
		playCard,
		wave,
	} = useGameStore();

	return (
		<div style={{ padding: "20px", fontFamily: "monospace" }}>
			<h1>Idle Card Battler - Greybox Prototype</h1>

			<div
				style={{
					marginBottom: "20px",
					border: "1px solid #ccc",
					padding: "10px",
				}}
			>
				<h2>Wave Status</h2>
				<p>Floor: {wave.floor}</p>
				<p>
					Wave: {wave.current} / {wave.total}
				</p>
				<p>Phase: {wave.phase}</p>
				<p>Timer: {wave.phaseTimer.toFixed(1)}s</p>
				<p>Queue: {wave.spawnQueue.filter((e) => !e.spawned).length} pending</p>
			</div>

			<div
				style={{
					marginBottom: "20px",
					border: "1px solid #ccc",
					padding: "10px",
				}}
			>
				<h2>Status</h2>
				<p>Time: {time.toFixed(1)}s</p>
				<p>State: {isRunning ? "RUNNING" : "PAUSED"}</p>
				<button type="button" onClick={toggleGame}>
					{isRunning ? "PAUSE" : "START"}
				</button>
				<button
					type="button"
					onClick={spawnEnemy}
					style={{ marginLeft: "10px" }}
				>
					Spawn Test Enemy
				</button>
			</div>

			<div style={{ display: "flex", gap: "20px" }}>
				{/* Resources */}
				<div style={{ flex: 1, border: "1px solid #ccc", padding: "10px" }}>
					<h2>Resources</h2>
					<p>
						Tower HP: {tower.stats.hp} / {tower.stats.maxHp}
					</p>
					<p>
						Mana: {mana.toFixed(1)} / {maxMana}
					</p>
					<p>Gold: {gold}</p>
				</div>

				{/* Hand */}
				<div style={{ flex: 1, border: "1px solid #ccc", padding: "10px" }}>
					<h2>Hand</h2>
					<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
						{hand.map((card) => (
							<button
								type="button"
								key={card.id}
								onClick={() => playCard(card.id)}
								disabled={mana < card.currentCost}
								style={{
									padding: "10px",
									border: "1px solid #333",
									background: mana >= card.currentCost ? "#eef" : "#ccc",
									cursor: mana >= card.currentCost ? "pointer" : "not-allowed",
								}}
							>
								<div>
									<strong>{card.name}</strong>
								</div>
								<div>Cost: {card.currentCost}</div>
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Battlefield */}
			<div
				style={{
					marginTop: "20px",
					border: "1px solid #ccc",
					padding: "10px",
					minHeight: "200px",
				}}
			>
				<h2>Battlefield</h2>
				{enemies.length === 0 && <p>No enemies.</p>}
				{enemies.map((enemy: Entity) => (
					<div
						key={enemy.id}
						style={{
							border: "1px solid red",
							padding: "5px",
							margin: "5px 0",
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<span>
							Enemy #{enemy.id.slice(0, 4)} (HP: {enemy.stats.hp}/
							{enemy.stats.maxHp})
						</span>
						<span>Pos: {enemy.position.toFixed(0)}</span>
					</div>
				))}
			</div>
		</div>
	);
};
