# RFC 006: Wave Manager

## 1. Overview
This spec defines the **Wave Manager System** that orchestrates enemy spawning, wave progression, and win/loss conditions. It builds upon the *Combat Loop* (RFC 003), *Entity System* (RFC 004), and *Run Structure* (RFC 001) to create the pacing and structure of combat encounters.

The Wave Manager is responsible for:
- Spawning enemies according to wave configurations
- Tracking wave and floor progression
- Detecting win/loss conditions
- Managing transitions between waves and floors

## 2. Wave Structure

### 2.1 Run → Floor → Wave Hierarchy

From RFC 001:
- **Run**: A single playthrough attempt (Tower climb)
- **Floor**: A group of waves (Standard = 5 waves, Boss = 1 wave)
- **Wave**: A configured set of enemy spawns

```
RUN
├── Floor 1 (Standard)
│   ├── Wave 1
│   ├── Wave 2
│   ├── Wave 3
│   ├── Wave 4
│   └── Wave 5
├── Floor 2 (Standard)
│   └── ...
└── Floor 10 (Boss)
    └── Wave 1 (Boss + Adds)
```

### 2.2 Wave Phases

Each wave goes through distinct phases:

```typescript
type WavePhase = 
  | 'SPAWNING'    // Enemies are being spawned
  | 'ACTIVE'      // All enemies spawned, combat in progress
  | 'CLEARING'    // All enemies dead, brief delay before next wave
  | 'COMPLETED';  // Wave complete, ready for next wave or floor transition

interface WaveState {
  current: number;        // Current wave index (1-indexed)
  total: number;          // Total waves in current floor (usually 5)
  phase: WavePhase;       // Current phase (replaces old 'status')
  phaseTimer: number;     // Timer for phase transitions
  floor: number;          // Current floor number (1-indexed)
  spawnQueue: SpawnEvent[]; // Enemies yet to spawn
}
```

**Phase Transitions:**
1. `SPAWNING`: Spawn queue is being processed
   - → `ACTIVE` when spawn queue is empty
2. `ACTIVE`: Combat is ongoing
   - → `CLEARING` when all enemies are defeated
3. `CLEARING`: Brief delay (2 seconds) for rewards/UI
   - → `COMPLETED` after delay
4. `COMPLETED`: Wave finished
   - → Next wave's `SPAWNING` OR Floor transition

## 3. Wave Configuration System

### 3.1 Data Structure

**File:** `src/data/waves.ts`

```typescript
interface SpawnEvent {
  enemyDefId: string;      // Enemy type (e.g., 'SKELETON_GRUNT')
  position: number;        // Spawn position (default 100)
  delay: number;           // Seconds after wave start
  count?: number;          // Number of this enemy (default 1)
}

interface WaveConfig {
  waveId: string;          // Unique identifier
  floor: number;           // Which floor this applies to
  waveNumber: number;      // Wave number within floor (1-5)
  spawns: SpawnEvent[];    // Enemy spawn events
  difficulty: number;      // Scaling multiplier (future use)
  rewards?: WaveRewards;   // Gold/Essence for completion
}

interface WaveRewards {
  gold: number;
  essence?: number;
}

// Example Wave 1 Configuration
const WAVE_1_1: WaveConfig = {
  waveId: 'floor1_wave1',
  floor: 1,
  waveNumber: 1,
  spawns: [
    { enemyDefId: 'SKELETON_GRUNT', position: 100, delay: 0.0, count: 3 },
  ],
  difficulty: 1.0,
  rewards: { gold: 10 }
};

// Example Wave 5 (Mini-Boss)
const WAVE_1_5: WaveConfig = {
  waveId: 'floor1_wave5',
  floor: 1,
  waveNumber: 5,
  spawns: [
    { enemyDefId: 'BONE_SHIELD', position: 100, delay: 0.0 },
    { enemyDefId: 'SKELETON_GRUNT', position: 90, delay: 2.0, count: 2 },
    { enemyDefId: 'SKELETON_GRUNT', position: 95, delay: 4.0, count: 2 },
  ],
  difficulty: 1.2,
  rewards: { gold: 25, essence: 5 }
};
```

### 3.2 Wave Templates (Procedural Generation)

For scalability, waves can be generated procedurally using templates:

```typescript
interface WaveTemplate {
  templateId: string;
  enemyTypes: string[];    // Pool of enemy types
  spawnPattern: 'SWARM' | 'STAGGERED' | 'ELITE' | 'MIXED';
  budgetPoints: number;    // Enemy budget for this wave
}

// Enemy cost table (for budget calculation)
const ENEMY_COSTS: Record<string, number> = {
  'SKELETON_GRUNT': 1,   // Cheap swarm unit
  'BONE_SHIELD': 5,      // Expensive tank
  'GHOST': 3,            // Medium cost assassin
  'NECROMANCER': 4       // Medium-high support
};

function generateWave(template: WaveTemplate, floor: number): WaveConfig {
  // Procedurally generate spawns based on template + floor difficulty
  // This allows infinite floors without hardcoding each wave
}
```

### 3.3 Floor Archetypes (from RFC 001)

Standard Floor Wave Composition:
- **Wave 1-2**: Trash mobs (high count, low HP) - Tests AOE
- **Wave 3**: Elite/Tank introduction - Tests single target DPS
- **Wave 4**: Mixed composition - Tests adaptability
- **Wave 5**: Mini-Boss or Swarm - High intensity finale

Boss Floor (every 10th floor):
- **Wave 1**: Boss enemy + supporting units

## 4. Spawning Logic

### 4.1 Spawn Queue Processing

The Wave Manager maintains a spawn queue that is processed each tick:

```typescript
interface SpawnQueueEntry {
  enemyDefId: string;
  position: number;
  spawnTime: number;  // Absolute game time when this should spawn
  spawned: boolean;
}

function updateWaveSpawning(state: GameData, dt: number) {
  if (state.wave.phase !== 'SPAWNING') return;
  
  // Process spawn queue
  for (const entry of state.wave.spawnQueue) {
    if (!entry.spawned && state.time >= entry.spawnTime) {
      spawnEnemy(state, entry.enemyDefId, entry.position);
      entry.spawned = true;
    }
  }
  
  // Check if all spawned
  const allSpawned = state.wave.spawnQueue.every(e => e.spawned);
  if (allSpawned) {
    state.wave.phase = 'ACTIVE';
  }
}
```

### 4.2 Spawn Positioning

**Default Spawn Position:** `100` (far right of lane)

**Spawn Variance (Optional):**
- Add slight randomization to prevent stacking: `position = 100 + random(-2, 2)`
- For multi-enemy spawns, stagger positions: `[98, 100, 102]`
- This creates visual variety and prevents perfect overlaps

**Future: Multi-Lane Support:**
- Add `laneId` to `SpawnEvent`
- Enemies spawn in designated lanes

### 4.3 Spawn Timing

**Immediate Spawn:** `delay = 0.0` - Enemies appear instantly when wave starts

**Staggered Spawn:** `delay = 2.0, 4.0, 6.0` - Enemies trickle in over time

**Wave Spawn:** `delay = [all same]` - All enemies spawn simultaneously

**Design Consideration:**
- Staggered spawns prevent early burst DPS from trivializing waves
- Allow strategic planning (e.g., "Save Meteor for when the second group arrives")

## 5. Wave Progression \u0026 Timers

### 5.1 Wave Lifecycle

```typescript
function updateWaveManager(state: GameData, dt: number) {
  switch (state.wave.phase) {
    case 'SPAWNING':
      updateWaveSpawning(state, dt);
      break;
      
    case 'ACTIVE':
      // Check if all enemies defeated
      if (state.enemies.length === 0) {
        state.wave.phase = 'CLEARING';
        state.wave.phaseTimer = 2.0; // 2 second delay
      }
      break;
      
    case 'CLEARING':
      state.wave.phaseTimer -= dt;
      if (state.wave.phaseTimer <= 0) {
        handleWaveComplete(state);
        state.wave.phase = 'COMPLETED';
      }
      break;
      
    case 'COMPLETED':
      // Waiting for external trigger to start next wave
      // (Player clicks "Next Wave" or auto-continue after delay)
      break;
  }
}
```

### 5.2 Wave Completion \u0026 Rewards

```typescript
function handleWaveComplete(state: GameData) {
  const waveConfig = getCurrentWaveConfig(state);
  
  // Grant gold rewards (per wave)
  if (waveConfig.rewards) {
    state.gold += waveConfig.rewards.gold;
    // Note: Essence not granted here (comes from cards in future sessions)
  }
  
  // Log completion
  console.log(`Wave ${state.wave.current} complete!`);
  
  // Prepare for next wave (don't auto-start yet)
  if (state.wave.current < state.wave.total) {
    // More waves in this floor
    state.wave.current += 1;
    // Wait for player input or auto-continue timer
  } else {
    // Floor complete
    handleFloorComplete(state);
  }
}

function handleFloorComplete(state: GameData) {
  console.log(`Floor ${state.wave.floor} complete!`);
  
  // Note: Floor completion does NOT grant Essence
  // Essence will come from card-based generation in future sessions
  // Floor number serves as unlock/prestige gate
  
  // Transition to Break Room (future: UI state change)
  // For prototype: Auto-continue to next floor
  startNextFloor(state);
}

function startNextFloor(state: GameData) {
  state.wave.floor += 1;
  state.wave.current = 1;
  state.wave.total = isFloorBoss(state.wave.floor) ? 1 : 5;
  
  // Load first wave of new floor
  startWave(state, state.wave.floor, state.wave.current);
}

function isFloorBoss(floor: number): boolean {
  return floor % 10 === 0; // Every 10th floor
}
```

### 5.3 Auto-Continue Support

For idle gameplay, support automatic wave/floor progression:

```typescript
interface GameData {
  // ... existing fields
  autoContinue: boolean;       // Player toggle (default: true)
  autoContinueDelay: number;   // Seconds to wait (default: 3.0)
  autoContinueTimer: number;   // Current countdown
}

function updateAutoContinue(state: GameData, dt: number) {
  if (!state.autoContinue) return;
  if (state.wave.phase !== 'COMPLETED') return;
  
  state.autoContinueTimer -= dt;
  
  if (state.autoContinueTimer <= 0) {
    startNextWaveOrFloor(state);
    state.autoContinueTimer = state.autoContinueDelay; // Reset
  }
}
```

## 6. Win/Loss Conditions

### 6.1 Loss Condition (Game Over)

**Trigger:** Tower HP ≤ 0

```typescript
function checkLossCondition(state: GameData): boolean {
  if (state.tower.stats.hp <= 0) {
    state.tower.state = 'DEAD';
    state.isRunning = false;
    handleGameOver(state);
    return true;
  }
  return false;
}

function handleGameOver(state: GameData) {
  console.log(`Game Over! Reached Floor ${state.wave.floor}, Wave ${state.wave.current}`);
  
  // Show run summary
  // - Total waves cleared
  // - Gold earned (lost on death)
  // - Essence earned (kept)
  
  // Future: Save run stats to persistent storage
}
```

### 6.2 Wave Win Condition

**Trigger:** All enemies defeated AND spawn queue empty

Already handled in `updateWaveManager` → `ACTIVE` phase check

### 6.3 Floor Win Condition

**Trigger:** Final wave of floor completed

Handled in `handleWaveComplete` when `state.wave.current === state.wave.total`

### 6.4 Run Win Condition (Future)

For finite runs (e.g., "Reach Floor 50"):

```typescript
function checkRunWinCondition(state: GameData): boolean {
  const TARGET_FLOOR = 50;
  if (state.wave.floor > TARGET_FLOOR) {
    state.isRunning = false;
    handleRunVictory(state);
    return true;
  }
  return false;
}
```

For infinite runs: Victory is not applicable (pure survival/high score)

## 7. Integration with Combat System

### 7.1 CombatSystem Update Sequence

```typescript
// File: src/engine/CombatSystem.ts

export function processTick(state: GameData, dt: number) {
  if (!state.isRunning) return;
  
  // 1. Time & Resources (existing)
  updateMana(state, dt);
  updateDrawTimer(state, dt);
  
  // 2. Wave Management (NEW)
  updateWaveManager(state, dt);
  updateAutoContinue(state, dt);
  
  // 3. Status Effects (existing)
  updateStatusEffects(state, dt);
  
  // 4. Entity Updates (existing)
  updateEnemies(state, dt);
  updateSummons(state, dt);
  updateProjectiles(state, dt);
  
  // 5. Cleanup (existing)
  cleanupDeadEntities(state);
  
  // 6. Win/Loss Check (NEW)
  checkLossCondition(state);
  
  // 7. Update Time (existing)
  state.time += dt;
  state.tickCount += 1;
}
```

### 7.2 Game State Expansion

Updated `GameData` interface:

```typescript
interface GameData {
  // ... existing fields
  
  // Wave Manager State (expanded)
  wave: {
    current: number;
    total: number;
    phase: WavePhase;          // NEW: Replaces old 'status'
    phaseTimer: number;        // NEW: For phase transitions
    floor: number;             // NEW: Current floor
    spawnQueue: SpawnQueueEntry[]; // NEW: Spawn queue
  };
  
  // Auto-Continue (NEW)
  autoContinue: boolean;
  autoContinueDelay: number;
  autoContinueTimer: number;
  
  // Persistent Currency (FUTURE)
  // essence: number;  // Add when implementing meta-progression
}
```

## 8. Edge Cases \u0026 Considerations

### 8.1 Player Skips Wave While Enemies Alive

**Problem:** Player clicks "Next Wave" before current wave is cleared.

**Solution:** Disable "Next Wave" button unless `wave.phase === 'COMPLETED'`

### 8.2 Tower Dies During CLEARING Phase

**Problem:** DoT damage kills Tower during the 2-second victory delay.

**Solution:** Loss check runs every tick. Loss condition overrides wave completion.

```typescript
if (checkLossCondition(state)) {
  return; // Exit early, don't process wave completion
}
```

### 8.3 Spawn Queue Too Large (Memory)

**Problem:** Floor 100 with hundreds of staggered spawns.

**Solution:** 
- Use procedural generation (spawn on-demand, not pre-queue)
- OR limit max spawn queue size (e.g., 100 entries)

### 8.4 Wave Starts with No Enemies

**Problem:** Wave config has empty `spawns` array.

**Solution:** Auto-complete wave immediately:

```typescript
if (state.wave.spawnQueue.length === 0) {
  state.wave.phase = 'CLEARING';
  state.wave.phaseTimer = 0.1; // Skip to completion
}
```

### 8.5 Floor Transition Cleanup

**Problem:** Leftover summons, projectiles, or status effects between floors.

**Solution:** **Fresh Start** - Reset all combat state between floors.

```typescript
function startNextFloor(state: GameData) {
  // Clear combat state (fresh start each floor)
  state.summons = [];
  state.projectiles = [];
  state.enemies = [];
  
  // Tower HP persists (no auto-healing between floors)
  // Future: Unlock system could allow summon persistence or tower healing
  
  // ... rest of floor initialization
}
```

## 9. Future Extensibility

### 9.1 Special Wave Events

**Boss Waves:**
- Unique mechanics (phases, invulnerability stages)
- Boss-specific UI overlays (health bar)

**Event Waves:**
- "Horde Mode": Endless spawns for X seconds
- "Survival": No enemies, but tower takes DoT (race against time)

```typescript
interface WaveConfig {
  // ... existing fields
  eventType?: 'BOSS' | 'HORDE' | 'SURVIVAL' | 'ELITE';
  eventData?: Record<string, unknown>; // Event-specific params
}
```

### 9.2 Dynamic Difficulty Scaling

Scale enemy stats based on floor:

```typescript
function spawnEnemy(state: GameData, defId: string, position: number) {
  const enemy = createEnemy(defId, position);
  
  // Apply floor scaling
  const scaling = 1 + (state.wave.floor - 1) * 0.1; // +10% per floor
  enemy.stats.hp *= scaling;
  enemy.stats.maxHp *= scaling;
  enemy.stats.damage *= scaling;
  
  state.enemies.push(enemy);
}
```

### 9.3 Wave Modifiers (Affixes)

Add random modifiers to waves (like Diablo rifts):

```typescript
type WaveModifier = 
  | 'ENRAGED'    // Enemies have +50% damage
  | 'SHIELDED'   // Enemies have +50% HP
  | 'SWIFT'      // Enemies have +50% speed
  | 'VAMPIRIC';  // Enemies heal on hit

interface WaveConfig {
  // ... existing fields
  modifiers?: WaveModifier[];
}
```

### 9.4 Multi-Lane Spawning

Expand spawn system for multi-lane:

```typescript
interface SpawnEvent {
  // ... existing fields
  laneId?: number; // 0 = center, 1 = top, 2 = bottom
}
```

## 10. Implementation Checklist

### 10.1 Phase 1: Core Wave Manager
- [ ] Update `WaveState` interface in `src/types/game.ts`
- [ ] Create `src/engine/WaveManager.ts` with update functions
- [ ] Create `src/data/waves.ts` with wave configurations
- [ ] Integrate `updateWaveManager` into `CombatSystem.processTick`
- [ ] Implement spawn queue processing
- [ ] Implement win/loss condition checks

### 10.2 Phase 2: Wave Progression
- [ ] Implement phase transitions (`SPAWNING` → `ACTIVE` → `CLEARING` → `COMPLETED`)
- [ ] Implement `handleWaveComplete` and rewards
- [ ] Implement `handleFloorComplete` and floor transitions
- [ ] Add auto-continue support

### 10.3 Phase 3: Testing \u0026 Validation
- [ ] Write unit tests for wave manager
- [ ] Test wave transitions
- [ ] Test loss conditions
- [ ] Test spawn queue processing with various delays
- [ ] Test floor progression (1 → 2 → 3, Boss floor detection)

## 11. Design Decisions Summary

> [!NOTE]
> **Finalized Design Decisions:**

1. **Floor Transition Behavior:**
   - ✅ Fresh start each floor (reset summons/projectiles)
   - ✅ No automatic tower healing between floors
   - Future: Unlock system may allow summon persistence or healing upgrades

2. **Auto-Continue:**
   - ✅ Default delay: 3 seconds
   - ✅ Simple on/off toggle (no custom delay configuration)
   - Future: Overall game speed setting may be added

3. **Rewards:**
   - ✅ Gold granted per wave
   - ✅ Essence comes from cards (not floors)
   - ✅ Floor number serves as unlock/prestige gate

4. **Boss Floors:**
   - ✅ Boss appears at Floor 10, then every 10 floors
   - Future: Debug command to spawn boss floor for testing

5. **Essence Currency:**
   - ✅ Delayed to meta-progression session
   - ✅ Log essence events only (no storage yet)

6. **Wave Start:**
   - ✅ Auto-start waves immediately (no manual button)
   - ✅ Auto-continue toggle controls inter-wave delay
