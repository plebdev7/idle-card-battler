# RFC 004: Entity System

## 1. Overview
This spec defines the **Entity System** that governs all game objects in the combat space: Enemies, Summons, Projectiles, and the Tower. It establishes:
- A unified entity architecture with shared properties and behaviors
- A 1D lane movement system with spatial tracking
- Attack range and targeting logic
- Data-driven entity definitions for extensibility

This system is the foundation for Sessions 2.2.4 (Combat Logic) and 2.2.5 (Wave Manager).

## 2. Base Entity Architecture

### 2.1 Entity Types
All game objects inherit from a base `Entity` interface (defined in `src/types/game.ts`):

```typescript
interface Entity {
  id: string;
  type: 'ENEMY' | 'SUMMON' | 'TOWER' | 'PROJECTILE';
  position: number; // 0 to 100 (see §3.1)
  stats: EntityStats;
  state: EntityState;
  targetId?: string;
}
```

### 2.2 Entity Stats
Stats are shared properties, though not all stats apply to all entity types:

```typescript
interface EntityStats {
  hp: number;           // Current health
  maxHp: number;        // Maximum health
  speed: number;        // Movement speed (units/second)
  range: number;        // Attack range (distance units)
  damage: number;       // Base damage per attack
  attackSpeed: number;  // Attacks per second
  armor?: number;       // Optional: Damage mitigation (see RFC 003)
}
```

| Stat | Tower | Enemy | Summon | Projectile |
| :--- | :---: | :---: | :----: | :--------: |
| `hp` / `maxHp` | ✓ | ✓ | ✓ | ✗ |
| `speed` | ✗ | ✓ | ✓* | ✓ |
| `range` | ✗ | ✓ | ✓ | ✗** |
| `damage` | ✗ | ✓ | ✓ | ✓ |
| `attackSpeed` | ✗ | ✓ | ✓ | ✗ |

*Summons may be stationary (speed = 0) or mobile.  
**Projectiles use collision detection instead of range.

### 2.3 Entity States
All entities follow a lifecycle state machine:

```typescript
type EntityState = 'IDLE' | 'WALKING' | 'ATTACKING' | 'STUNNED' | 'DYING' | 'DEAD';
```

| State | Description | Applies To |
| :--- | :--- | :--- |
| `IDLE` | Not moving or attacking (default for Tower, stationary Summons) | TOWER, SUMMON |
| `WALKING` | Moving toward target/goal | ENEMY, SUMMON |
| `ATTACKING` | Executing attack animation / locked in combat | ENEMY, SUMMON |
| `STUNNED` | Cannot move or attack (status effect) | ENEMY, SUMMON |
| `DYING` | Death animation/delay before removal | ENEMY, SUMMON, TOWER* |
| `DEAD` | Marked for cleanup | ALL |

*Tower entering `DYING` triggers Game Over.

**State Transitions (Enemies/Summons):**
- `WALKING` → `ATTACKING`: When target is in range
- `ATTACKING` → `WALKING`: When target moves out of range or dies
- Any → `STUNNED`: When stun effect is applied
- `STUNNED` → Previous State: When stun expires
- Any → `DYING`: When HP ≤ 0
- `DYING` → `DEAD`: After death animation duration

### 2.4 Entity Lifecycle Events
Entities trigger events at key lifecycle moments, allowing game logic to hook into state changes:

```typescript
interface EntityEvents {
  onSpawn?: (entity: Entity, gameState: GameData) => void;
  onDeath?: (entity: Entity, killer?: Entity, gameState: GameData) => void;
  onHit?: (entity: Entity, damage: number, source: Entity, gameState: GameData) => void;
  onKill?: (entity: Entity, victim: Entity, gameState: GameData) => void;
}
```

**Examples:**
- `onSpawn`: Necromancer enemy spawns additional skeletons on spawn
- `onDeath`: Skeleton explodes, dealing AOE damage to nearby entities
- `onHit`: Berserker gains attack speed when damaged
- `onKill`: Summon heals when it kills an enemy

## 3. Movement System (1D Lane Logic)

### 3.1 The Lane: Coordinate System
The combat space is a **single 1D lane** represented by a numeric position:

```
[TOWER]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[SPAWN]
   0    10   20   30   40   50   60   70   80   90   100
```

- **Position 0**: The Tower (player's base)
- **Position 100**: Enemy spawn point
- **Enemies**: Move from 100 → 0 (negative velocity)
- **Summons**: Spawn near 0, may move toward 100 (positive velocity)
- **Projectiles**: Travel linearly or track targets

**Coordinate System Properties:**
- Positions are **floats** (allowing subpixel precision)
- Visually, the 1D position can be mapped to 2D (X-axis), with Y-axis used for visual variety (unit layering, animation offsets)
- Future expansion to multi-lane is possible by adding a `laneId` property

### 3.2 Movement Behaviors

#### 3.2.1 Enemies
**Default Behavior:**
```typescript
function updateEnemyMovement(enemy: Entity, dt: number) {
  if (enemy.state === 'WALKING') {
    enemy.position -= enemy.stats.speed * dt;
    enemy.position = Math.max(0, enemy.position); // Clamp at Tower
    
    // Check if reached attack range
    const target = findTarget(enemy);
    if (target && distanceTo(enemy, target) <= enemy.stats.range) {
      enemy.state = 'ATTACKING';
      enemy.targetId = target.id;
    }
  }
}
```

**Target Priority:**
1. Nearest Summon blocking the path (position < enemy.position)
2. If no Summons exist, target the Tower (position 0)

**Special Enemy Archetypes (from RFC 001):**
- **Assassin**: Ignores Summons (always targets Tower)
- **Ranged**: Can attack from distance (high `range` value, doesn't need to close gap)
- **Support**: Moves until in range of allies (uses different targeting logic)

#### 3.2.2 Summons
**Stationary Summons** (e.g., Towers, Walls):
- `stats.speed = 0`
- `state = 'IDLE'` or `'ATTACKING'`
- Spawned at a fixed position (e.g., 10-20 units from Tower)

**Mobile Summons** (e.g., Skeletons, Minions):
- Move toward enemies (position 100) to intercept
- Stop when in range of nearest enemy
- May have "leash" distance (don't venture beyond position X)

```typescript
function updateSummonMovement(summon: Entity, dt: number, enemies: Entity[]) {
  if (summon.stats.speed === 0) return; // Stationary
  
  if (summon.state === 'WALKING') {
    const nearestEnemy = findNearestEnemy(summon, enemies);
    if (nearestEnemy) {
      if (distanceTo(summon, nearestEnemy) <= summon.stats.range) {
        summon.state = 'ATTACKING';
        summon.targetId = nearestEnemy.id;
      } else {
        summon.position += summon.stats.speed * dt; // Move toward enemies
      }
    }
  }
}
```

#### 3.2.3 Projectiles
Projectiles have three movement modes:

**1. Homing (Targeted)**
- Locks onto an enemy `targetId`
- Travels at `speed` toward target's current position
- Hits when distance ≤ collision threshold (e.g., 1 unit)
- Misses if target dies before impact (or re-targets nearest enemy, card-dependent)

**2. Linear (Skillshot)**
- Travels in a straight line from Tower (position 0) → Spawn (position 100)
- Hits first enemy within hitbox radius (e.g., 2 units)
- Continues or disappears after first hit (card-dependent)

**3. Instant (AOE)**
- No movement (`speed = 0`)
- Spawns at target position with `radius`
- Applies effect to all entities within radius immediately
- Removed after single tick

### 3.3 Movement Modifiers (Status Effects)
Status effects alter movement and attack behavior. The entity system includes interface stubs for status effects, with full implementation deferred to a future session.

**Supported Effect Types:**

| Modifier | Effect | Implementation |
| :--- | :--- | :--- |
| **Slow** | Reduce `stats.speed` by X% | Multiply base speed |
| **Stun** | Set `state = 'STUNNED'` | Block movement/attacks |
| **Root** | Set `stats.speed = 0` | Can still attack |
| **Haste** | Increase `stats.speed` by X% | Multiply base speed |
| **Knockback** | Instantly move position by X units | Add to position (clamped to 0-100) |
| **Poison** | Deal damage over time | Tick damage per second |
| **Burn** | Deal damage over time | Tick damage per second |
| **Regeneration** | Heal over time | Tick healing per second |
| **Shield** | Absorb damage | Temporary HP buffer |

**Interface Stub:**
```typescript
interface Entity {
  // ... existing fields
  statusEffects?: StatusEffect[]; // Active effects on this entity
}

interface StatusEffect {
  id: string;                       // Unique effect instance ID
  type: StatusEffectType;
  duration: number;                 // Seconds remaining
  intensity?: number;               // Magnitude (e.g., 50% slow, 5 dps poison)
  stackCount?: number;              // For stackable effects
  source?: string;                  // Entity ID that applied this effect
}

type StatusEffectType = 
  | 'SLOW' | 'STUN' | 'ROOT' | 'HASTE' | 'KNOCKBACK'
  | 'POISON' | 'BURN' | 'BLEED' | 'FREEZE'
  | 'REGENERATION' | 'SHIELD' | 'INVULNERABLE';
```

**TODO (Future Session):**
- [ ] Implement `applyStatusEffect(target: Entity, effect: StatusEffect)`
- [ ] Implement `updateStatusEffects(entity: Entity, dt: number)` - tick duration, apply DoT damage
- [ ] Define stacking behavior (duration extends vs. intensity stacks)
- [ ] Add visual indicators (status effect icons on entities)
- [ ] Card integration (cards that apply status effects)

## 4. Spatial Tracking

### 4.1 Spatial Queries
The combat system needs efficient position-based queries:

**Core Functions:**
```typescript
// Find all entities within a radius of a position
function findEntitiesInRadius(
  position: number,
  radius: number,
  entities: Entity[]
): Entity[] {
  return entities.filter(e => Math.abs(e.position - position) <= radius);
}

// Find nearest entity of a specific type
function findNearestEntity(
  from: Entity | number,
  entities: Entity[],
  filter?: (e: Entity) => boolean
): Entity | null {
  const pos = typeof from === 'number' ? from : from.position;
  let nearest: Entity | null = null;
  let minDist = Infinity;
  
  for (const entity of entities) {
    if (filter && !filter(entity)) continue;
    const dist = Math.abs(entity.position - pos);
    if (dist < minDist) {
      minDist = dist;
      nearest = entity;
    }
  }
  return nearest;
}

// Find frontmost enemy (closest to Tower)
function findFrontmostEnemy(enemies: Entity[]): Entity | null {
  return enemies.reduce((frontmost, enemy) => 
    !frontmost || enemy.position < frontmost.position ? enemy : frontmost
  , null as Entity | null);
}
```

**Usage Examples:**
- **AOE Spell**: `findEntitiesInRadius(50, 10, enemies)` → All enemies within 10 units of position 50
- **Summon Targeting**: `findNearestEntity(summon, enemies, e => e.state !== 'DEAD')` → Nearest living enemy
- **Assassin Targeting**: `findEntity(enemies, e => e.type === 'TOWER')` → Always target Tower

### 4.2 Collision Detection

**Range-Based Collision (Melee/Ranged Attacks):**
```typescript
function isInAttackRange(attacker: Entity, target: Entity): boolean {
  const distance = Math.abs(attacker.position - target.position);
  return distance <= attacker.stats.range;
}
```

**Projectile Collision:**
```typescript
function checkProjectileCollision(
  projectile: Entity,
  targets: Entity[],
  hitRadius: number = 1.0
): Entity | null {
  for (const target of targets) {
    if (Math.abs(projectile.position - target.position) <= hitRadius) {
      return target;
    }
  }
  return null;
}
```

**AOE Collision:**
```typescript
function getAOETargets(
  center: number,
  radius: number,
  entities: Entity[]
): Entity[] {
  return findEntitiesInRadius(center, radius, entities)
    .filter(e => e.state !== 'DEAD');
}
```

### 4.3 Spatial Indexing (Future Optimization)
For now, spatial queries use linear search (`O(n)`). If performance becomes an issue with 100+ entities:
- Implement spatial hashing (divide lane into buckets)
- Use a sorted array (entities ordered by position)
- Use a quadtree (if expanding to 2D)

## 5. Attack Range & Targeting

### 5.1 Attack Range
Attack range defines when an entity can attack a target:

| Entity Type | Typical Range | Notes |
| :--- | :---: | :--- |
| Melee Enemy | 5-10 | Must close gap to Tower/Summon |
| Ranged Enemy | 30-50 | Attacks from distance |
| Melee Summon | 5-10 | Intercepts enemies |
| Tower | N/A | Tower doesn't attack directly (uses spells) |

**Range Visualization:**
```
[TOWER]━━━━━━━[SUMMON]━━━━━━━━━━━━━━━━━━━━[ENEMY]━━━━━━━━━[SPAWN]
   0           15                       60              100
   
Enemy Range: 10 → Can attack from position ≥ 50
Summon Range: 5 → Can attack from position ≤ 20
```

### 5.2 Target Acquisition

#### 5.2.1 Enemy Targeting Logic
**Default (Melee/Tank):**
1. Find nearest Summon with `position < enemy.position`
2. If Summon exists and distance ≤ range, attack Summon
3. Else, continue walking toward Tower (position 0)
4. If Tower distance ≤ range, attack Tower

**Assassin Override:**
- Always target Tower (ignores Summons entirely)

**Ranged Behavior:**
- Stop walking when any valid target is in range
- Target Tower if no Summons block line-of-sight (future: LOS system)

**Support Behavior:**
- Target nearest ally instead of enemy
- Uses support-specific logic (healing, buffing)

#### 5.2.2 Summon Targeting Logic
**Default:**
1. Find nearest Enemy with `position > summon.position`
2. If distance ≤ range, attack Enemy
3. Else, walk toward Enemy (if mobile)

**Priority Targeting (AI/Card-Specific):**
- Target lowest HP enemy in range
- Target highest threat (highest DPS)
- Target specific archetype (e.g., "Kill Healers First")

#### 5.2.3 Projectile Targeting
**Homing:**
- Target is specified at spawn (`targetId`)
- Projectile tracks target until hit or target dies

**Linear:**
- Target is first entity in collision path

**AOE:**
- All entities within radius at detonation position

### 5.3 Attack Cooldowns
Attacks are governed by `stats.attackSpeed` (attacks per second):

```typescript
interface Entity {
  // ... existing fields
  attackCooldown: number; // seconds until next attack
}

function updateAttackCooldown(entity: Entity, dt: number) {
  if (entity.attackCooldown > 0) {
    entity.attackCooldown -= dt;
  }
  
  if (entity.state === 'ATTACKING' && entity.attackCooldown <= 0) {
    performAttack(entity);
    entity.attackCooldown = 1 / entity.stats.attackSpeed; // Reset
  }
}
```

**Example:**
- `attackSpeed = 1.0` → Attack every 1 second
- `attackSpeed = 2.0` → Attack every 0.5 seconds
- `attackSpeed = 0.5` → Attack every 2 seconds

## 6. Data-Driven Entity Definitions

### 6.1 Enemy Definitions
**File:** `src/data/enemies.ts`

This file defines enemy **templates** (base stats) and **factory functions** to spawn instances.

```typescript
// Enemy Template (Data)
interface EnemyTemplate {
  defId: string;
  name: string;
  archetype: 'SWARM' | 'TANK' | 'RANGED' | 'ASSASSIN' | 'SUPPORT';
  baseStats: EntityStats;
  behavior?: Partial<EnemyBehavior>; // Optional overrides
}

// Behavior Overrides
interface EnemyBehavior {
  ignoresSummons: boolean;  // Assassin
  attacksFromRange: boolean; // Ranged
  healsAllies: boolean;     // Support
}

// Enemy Database
export const ENEMIES: Record<string, EnemyTemplate> = {
  SKELETON_GRUNT: {
    defId: 'SKELETON_GRUNT',
    name: 'Skeleton Grunt',
    archetype: 'SWARM',
    baseStats: {
      hp: 15,
      maxHp: 15,
      speed: 12,       // Fast
      range: 5,        // Melee
      damage: 3,       // Low damage
      attackSpeed: 1.0
    }
  },
  
  BONE_SHIELD: {
    defId: 'BONE_SHIELD',
    name: 'Bone Shield',
    archetype: 'TANK',
    baseStats: {
      hp: 80,
      maxHp: 80,
      speed: 4,        // Slow
      range: 5,        // Melee
      damage: 8,       // Moderate damage
      attackSpeed: 0.5, // Slow attacks
      armor: 5         // Damage reduction
    }
  },
  
  GHOST: {
    defId: 'GHOST',
    name: 'Ghost',
    archetype: 'ASSASSIN',
    baseStats: {
      hp: 20,
      maxHp: 20,
      speed: 20,       // Very fast
      range: 5,
      damage: 15,      // High damage
      attackSpeed: 1.5
    },
    behavior: {
      ignoresSummons: true // Assassin behavior
    }
  },
  
  NECROMANCER: {
    defId: 'NECROMANCER',
    name: 'Necromancer',
    archetype: 'SUPPORT',
    baseStats: {
      hp: 30,
      maxHp: 30,
      speed: 6,
      range: 40,       // Casts from distance
      damage: 5,       // Low direct damage
      attackSpeed: 0.3 // Slow casts
    },
    behavior: {
      healsAllies: true
    }
  }
};

// Factory Function
export function createEnemy(
  defId: string,
  position: number = 100,
  instanceId: string = generateId()
): Entity {
  const template = ENEMIES[defId];
  if (!template) throw new Error(`Unknown enemy: ${defId}`);
  
  return {
    id: instanceId,
    type: 'ENEMY',
    position,
    stats: { ...template.baseStats },
    state: 'WALKING',
    attackCooldown: 0,
    behavior: template.behavior // Store template reference
  };
}
```

### 6.2 Summon Definitions
**File:** `src/data/summons.ts` (to be created in Session 2.2.4)

Similar structure to enemies, but with summon-specific properties:

```typescript
interface SummonTemplate {
  defId: string;
  name: string;
  type: 'MELEE' | 'RANGED' | 'STATIONARY' | 'MOBILE';
  baseStats: EntityStats;
  spawnPosition: number; // Default position (e.g., 15 units from Tower)
}

export const SUMMONS: Record<string, SummonTemplate> = {
  SKELETON_WARRIOR: {
    defId: 'SKELETON_WARRIOR',
    name: 'Skeleton Warrior',
    type: 'MELEE',
    baseStats: {
      hp: 40,
      maxHp: 40,
      speed: 8,
      range: 5,
      damage: 10,
      attackSpeed: 1.2
    },
    spawnPosition: 15
  },
  
  ARCANE_TURRET: {
    defId: 'ARCANE_TURRET',
    name: 'Arcane Turret',
    type: 'STATIONARY',
    baseStats: {
      hp: 50,
      maxHp: 50,
      speed: 0,          // Immobile
      range: 30,         // Long range
      damage: 15,
      attackSpeed: 0.8
    },
    spawnPosition: 10
  }
};
```

### 6.3 Projectile Definitions
**File:** `src/data/projectiles.ts` (to be created in Session 2.2.4)

```typescript
interface ProjectileTemplate {
  defId: string;
  name: string;
  mode: 'HOMING' | 'LINEAR' | 'AOE';
  speed: number;      // Units per second (0 for AOE)
  damage: number;
  hitRadius?: number; // Collision radius (linear/AOE)
  aoeRadius?: number; // Explosion radius (AOE only)
}

export const PROJECTILES: Record<string, ProjectileTemplate> = {
  FIREBALL: {
    defId: 'FIREBALL',
    name: 'Fireball',
    mode: 'HOMING',
    speed: 50,
    damage: 10,
    hitRadius: 1
  },
  
  CHAIN_LIGHTNING: {
    defId: 'CHAIN_LIGHTNING',
    name: 'Chain Lightning',
    mode: 'LINEAR',
    speed: 100,
    damage: 8,
    hitRadius: 5  // Wide hitbox
  },
  
  METEOR: {
    defId: 'METEOR',
    name: 'Meteor',
    mode: 'AOE',
    speed: 0,
    damage: 25,
    aoeRadius: 15
  }
};
```

## 7. Integration with Combat System

### 7.1 Combat System Update Sequence
The `CombatSystem.ts` update loop (from RFC 003) will integrate entity updates:

```typescript
export function processTick(state: GameData, dt: number) {
  if (!state.isRunning) return;
  
  // 1. Time & Resources (existing)
  updateMana(state, dt);
  updateDrawTimer(state, dt);
  
  // 2. Wave Management (future: Session 2.2.5)
  // updateWaveSpawner(state, dt);
  
  // 3. Entity Updates (THIS SPEC)
  updateEnemies(state, dt);
  updateSummons(state, dt);
  updateProjectiles(state, dt);
  
  // 4. Combat Resolution (future: Session 2.2.4)
  // processDamage(state);
  
  // 5. Cleanup
  cleanupDeadEntities(state);
  
  // 6. Win/Loss Check (future: Session 2.2.5)
  // checkWinLoss(state);
  
  state.time += dt;
  state.tickCount += 1;
}
```

### 7.2 Entity Update Functions (Pseudocode)
```typescript
function updateEnemies(state: GameData, dt: number) {
  for (const enemy of state.enemies) {
    if (enemy.state === 'DEAD') continue;
    
    // Update movement
    updateEnemyMovement(enemy, dt, state.summons, state.tower);
    
    // Update attack cooldown
    updateAttackCooldown(enemy, dt);
  }
}

function cleanupDeadEntities(state: GameData) {
  state.enemies = state.enemies.filter(e => e.state !== 'DEAD');
  state.projectiles = state.projectiles.filter(p => p.state !== 'DEAD');
  // Note: Summons may have special cleanup (leave corpses, etc.)
}
```

### 7.3 Event Hook Execution
When entities trigger events, the combat system propagates them:

```typescript
function applyDamage(target: Entity, damage: number, source: Entity, state: GameData) {
  // Apply damage (see Session 2.2.4: Damage Pipeline)
  target.stats.hp -= damage;
  
  // Trigger onHit event
  if (target.onHit) {
    target.onHit(target, damage, source, state);
  }
  
  // Check death
  if (target.stats.hp <= 0) {
    target.state = 'DYING';
    
    // Trigger onDeath
    if (target.onDeath) {
      target.onDeath(target, source, state);
    }
    
    // Trigger killer's onKill
    if (source.onKill) {
      source.onKill(source, target, state);
    }
  }
}
```

## 8. Edge Cases & Design Considerations

### 8.1 Enemy Reaches Tower Before Attacking
**Problem:** Enemy has range 10, but reaches position 0 (Tower) while in `WALKING` state.

**Solution:** Movement clamping + forced state transition:
```typescript
enemy.position = Math.max(0, enemy.position);
if (enemy.position === 0 && enemy.state === 'WALKING') {
  enemy.state = 'ATTACKING';
  enemy.targetId = tower.id;
}
```

### 8.2 Target Dies Mid-Attack
**Problem:** Enemy is `ATTACKING` Summon, Summon dies. What happens?

**Solution:** Re-acquire target or revert to `WALKING`:
```typescript
if (entity.state === 'ATTACKING') {
  const target = findEntityById(entity.targetId);
  if (!target || target.state === 'DEAD') {
    entity.targetId = undefined;
    entity.state = 'WALKING'; // Resume movement
  }
}
```

### 8.3 Projectile Target Dies Before Impact
**Problem:** Homing Fireball targets Enemy, Enemy dies mid-flight.

**Design Choice:**
1. **Fizzle**: Projectile disappears (wasted)
2. **Re-target**: Find new nearest enemy
3. **Impact Anyway**: Hit corpse position (AOE explosion)

**Recommendation:** Make this **card-dependent** (future: card effect flags).

### 8.4 Multiple Entities Occupying Same Position
**Problem:** Two enemies both at position 60. How do attacks resolve?

**Solution:** Position collisions are allowed (entities stack). Attack targeting uses `findNearestEntity` which returns first found. Visual layering handles display.

### 8.5 Knockback Clipping Through Tower/Spawn
**Problem:** Knockback pushes enemy to position -10 or 110.

**Solution:** Clamp positions after applying knockback:
```typescript
enemy.position = Math.max(0, Math.min(100, enemy.position + knockback));
```

## 9. Future Extensibility

### 9.1 Multi-Lane Support
To add multiple lanes in the future:

```typescript
interface Entity {
  // ... existing fields
  laneId?: number; // 0 = center lane, 1 = top lane, etc.
}

function findNearestEntity(from: Entity, entities: Entity[]): Entity | null {
  // Filter by same lane
  const sameLane = entities.filter(e => e.laneId === from.laneId);
  // ... existing logic
}
```

### 9.2 Flying/Grounded Units
Add a `layer` property for vertical positioning:

```typescript
interface Entity {
  // ... existing fields
  layer?: 'GROUND' | 'AIR';
}

// Melee attacks can't hit AIR units
function canAttack(attacker: Entity, target: Entity): boolean {
  if (attacker.layer === 'GROUND' && target.layer === 'AIR') {
    return false; // Need ranged/magic
  }
  return isInAttackRange(attacker, target);
}
```

### 9.3 Dynamic Obstacles
Add `OBSTACLE` entity type for terrain:

```typescript
type EntityType = 'ENEMY' | 'SUMMON' | 'TOWER' | 'PROJECTILE' | 'OBSTACLE';

// Enemies path around obstacles
function findNextPosition(enemy: Entity, obstacles: Entity[]): number {
  // Simplified pathfinding (check for obstacles in path)
}
```

## 10. Summary & Next Steps

### 10.1 What This Spec Defines
✓ **Base Entity Architecture**: Unified interface for all game objects  
✓ **Movement System**: 1D lane with position-based movement for Enemies, Summons, Projectiles  
✓ **Spatial Tracking**: Position queries, collision detection, frontmost/nearest targeting  
✓ **Attack Range & Targeting**: Range-based combat, target acquisition, attack cooldowns  
✓ **Data-Driven Definitions**: Enemy/Summon/Projectile templates for extensibility  
✓ **Integration Points**: How `CombatSystem.ts` uses entity updates  
✓ **Status Effect Stubs**: Interface definitions for future status effect implementation  

### 10.2 What This Spec Does NOT Define (Future Sessions)
- **Damage Pipeline**: How damage is calculated, armor applied, healing resolved (Session 2.2.4)
- **Projectile Implementation**: Full projectile behavior (spawning, collision resolution) (Session 2.2.4)
- **Status Effects Implementation**: Full DoT/Buff/Debuff system logic (stubbed in §3.3, implement in future session)
- **Wave Spawner**: How/when enemies are spawned (Session 2.2.5)
- **Win/Loss Logic**: Victory conditions, Tower death handling (Session 2.2.5)

### 10.3 Implementation Checklist (for Session 2.2.3)
When implementing this spec, create:

1. **Type Extensions** (`src/types/game.ts`):
   - Add `attackCooldown`, `behavior` fields to `Entity`
   - Define `EnemyBehavior`, `StatusEffect` interfaces
   - Add lifecycle event types

2. **Spatial Utilities** (`src/engine/spatial.ts`):
   - `findEntitiesInRadius()`
   - `findNearestEntity()`
   - `isInAttackRange()`
   - `checkProjectileCollision()`

3. **Movement Logic** (`src/engine/movement.ts`):
   - `updateEnemyMovement()`
   - `updateSummonMovement()`
   - `updateProjectileMovement()`

4. **Targeting Logic** (`src/engine/targeting.ts`):
   - `findTarget(enemy)` → Returns target entity
   - `updateAttackCooldown()`
   - Target acquisition for each archetype

5. **Data Definitions** (extend `src/data/enemies.ts`, create `summons.ts`, `projectiles.ts`):
   - Enemy templates with archetype behaviors
   - Summon templates
   - Projectile templates

6. **Integration** (`src/engine/CombatSystem.ts`):
   - Add entity update calls to `processTick()`
   - Implement `cleanupDeadEntities()`

7. **Tests**:
   - Movement edge cases (clamping, state transitions)
   - Spatial queries (nearest, radius)
   - Targeting logic (Assassin ignores Summons, etc.)
