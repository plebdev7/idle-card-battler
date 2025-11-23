# RFC 003: The Combat Loop

## 1. Overview
The Combat Loop is the deterministic, real-time engine that drives the gameplay. It handles the state of the Tower, Enemies, and Projectiles, advancing the simulation in discrete time steps ("Ticks").

## 2. The Game Loop (The "Heartbeat")

### 2.1 Time Step
*   **Logic Tick Rate**: 20 Ticks per Second (TPS).
    *   Every 50ms, the game state updates.
    *   This ensures consistent behavior across devices, independent of frame rate.
*   **Render Frame Rate**: Decoupled from logic (e.g., 60 FPS).
    *   Visuals interpolate between logic states for smoothness.

### 2.2 The Update Sequence (Per Tick)
1.  **Time & Resources**:
    *   Update Global Timer.
    *   Regenerate Mana (see [RFC 002](002_idle_deck_cycle.md)).
    *   Update Draw Timer (see [RFC 002](002_idle_deck_cycle.md)).
2.  **Wave Management**:
    *   Check Wave Timer.
    *   Spawn Enemies if scheduled.
3.  **AI & Input**:
    *   Wizard AI evaluates Hand (see [RFC 002](002_idle_deck_cycle.md)).
    *   Queue Card Actions if triggered.
4.  **Entity Updates**:
    *   **Enemies**: Move, Attack (if in range), Update Cooldowns.
    *   **Summons**: Move (if mobile), Attack, Update Cooldowns.
    *   **Projectiles**: Move, Check Collisions.
5.  **Resolution**:
    *   Apply Damage/Healing.
    *   Apply Status Effects (DoT ticks).
6.  **Cleanup**:
    *   Remove dead entities (HP <= 0).
    *   Trigger "On Death" effects.
7.  **Win/Loss Check**:
    *   Check Tower HP <= 0 (Loss).
    *   Check Wave Complete (Win/Next Wave).

## 3. Entities & Spatial Logic

### 3.1 The Lane (1D vs 2D)
*   **Decision**: **Single Lane (1D)** with "Depth".
*   **Representation**: A linear path from `Position 0` (The Tower) to `Position 100` (Spawn Point).
*   **Visuals**: Can look 2D (enemies slightly offset Y), but logic is 1D distance.

### 3.2 The Tower
*   **Position**: 0.
*   **Stats**: HP, Armor.
*   **Hitbox**: Enemies attack when `Position <= AttackRange`.

### 3.3 Enemies
*   **State**:
    *   `Position`: Float (0 to 100).
    *   `Speed`: Units per second (negative velocity, moving towards 0).
    *   `Range`: Distance from target to start attacking.
    *   `State`: WALKING, ATTACKING, STUNNED, DYING.
*   **Behavior**:
    *   Move towards 0.
    *   If `Target` (Tower or Summon) is in `Range`, Stop and Attack.

### 3.4 Projectiles (Spells)
*   **Types**:
    *   **Targeted**: Locks onto an EnemyID. Hits if Enemy exists.
    *   **Skillshot (Linear)**: Travels from 0 to 100. Hits first enemy in hitbox.
    *   **AOE (Area)**: Instant or delayed effect at a specific Position + Radius.

## 4. Combat Resolution

### 4.1 Damage Pipeline
When an entity takes damage:
1.  **Base Damage**: Raw value from source.
2.  **Multipliers**: Apply buffs/debuffs (e.g., "Double Damage", "Weak").
3.  **Mitigation**:
    *   **Armor**: Flat reduction or Percentage reduction (TBD).
    *   *Draft*: Armor acts as temporary HP that refreshes or is harder to heal? OR Flat reduction (Damage - Armor).
    *   *Decision*: **Flat Reduction** (Damage = Max(1, Incoming - Armor)). Makes fast/small attacks weak against tanks.
4.  **Final Application**: Subtract from HP.

### 4.2 Status Effects
*   **Duration**: Measured in Seconds (converted to Ticks).
*   **Tick Rate**: DoTs (Damage over Time) tick once per second (every 20 logic ticks).
*   **Stacking**:
    *   **Intensity Stacking**: Poison (1 stack = 1 dps, 10 stacks = 10 dps).
    *   **Duration Stacking**: Stun (Stunned for 2s + Stunned for 2s = Stunned for 4s).

## 5. Win/Loss States

### 5.1 Loss (Game Over)
*   **Condition**: Tower HP <= 0.
*   **Result**: Run Ends. Show Summary Screen.

### 5.2 Wave Clear
*   **Condition**:
    *   Wave Spawn Queue is Empty.
    *   All Enemies are Dead.
*   **Result**:
    *   Short delay (2s).
    *   Show "Wave Complete".
    *   Grant Rewards (Gold/Essence).
    *   Start Next Wave Timer OR Enter Break Room (if Floor Complete).

## 6. Data Structures (Draft)

```typescript
interface Entity {
  id: string;
  type: 'ENEMY' | 'SUMMON' | 'TOWER' | 'PROJECTILE';
  position: number; // 0 to 100
  stats: {
    hp: number;
    maxHp: number;
    speed: number;
    range: number;
    damage: number;
    attackSpeed: number; // Attacks per second
  };
  state: 'WALKING' | 'ATTACKING' | 'IDLE' | 'DEAD';
  targetId?: string; // Current focus
}

interface GameState {
  tick: number;
  time: number;
  tower: Entity;
  enemies: Entity[];
  projectiles: Entity[];
  wave: {
    current: number;
    total: number;
    status: 'ACTIVE' | 'WAITING' | 'COMPLETED';
  };
}
```
