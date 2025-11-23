export interface Entity {
	id: string;
	type: "ENEMY" | "SUMMON" | "TOWER" | "PROJECTILE";
	position: number; // 0 to 100
	stats: {
		hp: number;
		maxHp: number;
		speed: number;
		range: number;
		damage: number;
		attackSpeed: number; // Attacks per second
	};
	state: "WALKING" | "ATTACKING" | "IDLE" | "DEAD";
	targetId?: string; // Current focus
}

export interface WaveState {
	current: number;
	total: number;
	status: "ACTIVE" | "WAITING" | "COMPLETED";
}

export interface Card {
	id: string;
	name: string;
	cost: number;
	damage?: number;
}
