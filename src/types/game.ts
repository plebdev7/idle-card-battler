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
	magicResist?: number; // Added for magic mitigation
	damageAmp?: number; // Outgoing damage multiplier (0.1 = +10%)
	damageTakenAmp?: number; // Incoming damage multiplier (0.1 = +10%)
}

export type DamageType = "PHYSICAL" | "MAGICAL" | "TRUE";

export interface DamageEvent {
	sourceId: string;
	targetId: string;
	amount: number;
	type: DamageType;
	isCritical?: boolean;
	tags?: string[];
}

export type ProjectileType = "HOMING" | "LINEAR" | "AOE";

export interface ProjectileData {
	type: ProjectileType;
	hitRadius: number;
	damage: number; // Snapshot damage at spawn
	damageType: DamageType;
	piercing?: boolean;
	// We can store effect objects here to apply on hit
	onHitEffects?: StatusEffect[];
}

export type StatusEffectType = "SLOW" | "STUN" | "POISON" | "BURN" | "REGEN";

export interface StatusEffect {
	id: string;
	type: StatusEffectType;
	duration: number;
	intensity: number;
	sourceId?: string;
	tickTimer?: number; // For DoTs
}

export interface Entity {
	id: string;
	type: EntityType;
	position: number; // 0 to 100
	stats: EntityStats;
	baseStats?: EntityStats; // Added for recalculation
	state: EntityState;
	targetId?: string; // Current focus
	attackCooldown: number;
	behavior?: Record<string, unknown>; // For specific AI overrides
	statusEffects: StatusEffect[]; // Made required (default empty)
	projectileData?: ProjectileData; // Specific for projectiles
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
