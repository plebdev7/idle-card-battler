export type EntityType = "ENEMY" | "SUMMON" | "TOWER" | "PROJECTILE";
export type EntityState =
	| "WALKING"
	| "ATTACKING"
	| "IDLE"
	| "STUNNED"
	| "DYING"
	| "DEAD";

export interface EntityStats {
	hp: number;
	maxHp: number;
	speed: number;
	range: number;
	damage: number;
	attackSpeed: number; // Attacks per second
	armor?: number;
}

export interface StatusEffect {
	id: string;
	type: string; // TODO: Define StatusEffectType union when implementing status effects
	duration: number;
	intensity?: number;
	source?: string;
}

export interface Entity {
	id: string;
	type: EntityType;
	position: number; // 0 to 100
	stats: EntityStats;
	state: EntityState;
	targetId?: string; // Current focus
	attackCooldown: number;
	behavior?: Record<string, unknown>; // For specific AI overrides
	statusEffects?: StatusEffect[];
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

export interface CardInstance {
	id: string;
	defId: string;
	zone: "DRAW" | "HAND" | "PLAY" | "DISCARD" | "VOID";
	currentCost: number;
	name: string;
}

export interface GameData {
	// Resources
	gold: number;
	mana: number;
	maxMana: number;
	manaRegen: number;

	// Entities
	tower: Entity;
	enemies: Entity[];
	summons: Entity[];
	projectiles: Entity[];

	// Cards & Deck Cycle
	hand: CardInstance[]; // Replaces Card[]
	drawPile: CardInstance[];
	discardPile: CardInstance[];
	voidPile: CardInstance[];

	drawTimer: number;
	drawSpeed: number;
	maxHandSize: number;

	// Wave
	wave: WaveState;

	// Meta
	isRunning: boolean;
	tickCount: number;
	time: number;
}
