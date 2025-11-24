# RFC 005: Combat Logic

## 1. Overview
This spec details the core mechanics of combat interaction, specifically the **Damage Pipeline**, **Projectile System**, **Collision Logic**, and **Status Effects**. It builds upon the *Entity System* (RFC 004) and *Combat Loop* (RFC 003).

## 2. Damage Pipeline
The Damage Pipeline is a deterministic sequence of operations that transforms a raw "Damage Event" into final HP loss.

### 2.1 Damage Event Structure
```typescript
interface DamageEvent {
  sourceId: string;       // Entity dealing damage
  targetId: string;       // Entity taking damage
  amount: number;         // Raw damage value
  type: 'PHYSICAL' | 'MAGICAL' | 'TRUE';
  isCritical?: boolean;   // Default false
  tags?: string[];        // e.g., ['FIRE', 'PROJECTILE']
}
```

### 2.2 The Pipeline Steps
1.  **Base Calculation**: Start with `event.amount`.
2.  **Outgoing Modifiers** (Source):
    *   Apply source's damage multipliers (e.g., "Deal 50% more damage").
    *   *Formula*: `dmg = dmg * (1 + source.stats.damageAmp)`
3.  **Incoming Modifiers** (Target):
    *   Apply target's vulnerability (e.g., "Take 20% more damage").
    *   *Formula*: `dmg = dmg * (1 + target.stats.damageTakenAmp)`
4.  **Critical Hit** (Optional):
    *   If `isCritical`, multiply by Crit Multiplier (default 1.5x).
5.  **Mitigation** (Target):
    *   **True Damage**: Ignores mitigation.
    *   **Physical/Magical**: Reduced by Armor/Resist.
    *   *Formula*: `dmg = Math.max(1, dmg - target.stats.armor)`
    *   *Design Note*: We use **Flat Reduction** to make Armor effective against swarms of weak enemies, but less effective against heavy hitters.
6.  **Final Application**:
    *   Subtract `dmg` from `target.stats.hp`.
    *   Clamp HP to 0.

### 2.3 Events
*   `onBeforeDamage(event)`: Can modify the event (e.g., "Block next attack").
*   `onDamage(event, finalAmount)`: Triggered after HP is reduced (e.g., "Thorns: Deal damage back").

## 3. Projectile System
Projectiles are temporary Entities that carry a payload (Damage/Effect) from Source to Target.

### 3.1 Projectile Types & Logic
| Type | Movement | Targeting | Collision |
| :--- | :--- | :--- | :--- |
| **Homing** | Tracks Target | Locked `targetId` | Hit when `dist(proj, target) < 1.0` |
| **Linear** | Straight Line | Direction vector | Hit first enemy in path with `dist < hitRadius` |
| **AOE** | Stationary | Position | Hit all enemies with `dist < radius` |

### 3.2 Lifecycle
1.  **Spawn**: Created by Card or Attack. Added to `GameState.projectiles`.
2.  **Update**:
    *   Move based on Type (see RFC 004).
    *   Check Collision.
    *   Check Expiration (Time to Live or Out of Bounds).
3.  **Impact**:
    *   Trigger `onHit`.
    *   Apply Damage/Effects.
    *   Despawn (unless "Piercing").

### 3.3 Edge Cases
*   **Target Dies (Homing)**: Projectile continues to last known position. If it hits nothing, it fizzles.
*   **Out of Bounds**: Removed if `position < -10` or `position > 110`.

## 4. Collision & Range Checks
Since we use a 1D lane with "depth" (visual only), collision is primarily 1D distance checks.

### 4.1 Hitboxes
*   **Point**: Projectiles are treated as points.
*   **Radius**: Entities have a `hitRadius` (default 1.0).
*   **Check**: `Math.abs(entityA.pos - entityB.pos) < (radiusA + radiusB)`

### 4.2 Optimization
*   For < 100 entities, simple $O(N^2)$ or $O(N \times M)$ checks are fine.
*   **Future**: Sort entities by Position to allow early exit in loops.

## 5. Status Effects
Status Effects are temporary modifiers applied to Entities.

### 5.1 Data Structure
```typescript
interface StatusEffect {
  id: string;
  defId: 'SLOW' | 'STUN' | 'POISON' | 'BURN' | 'REGEN';
  duration: number;       // Seconds remaining
  intensity: number;      // Value (e.g., 0.5 for 50% slow)
  sourceId: string;
  tickTimer?: number;     // For DoTs
}
```

### 5.2 Supported Effects (Session 2.2.4)
| Effect | Logic | Stacking Behavior |
| :--- | :--- | :--- |
| **SLOW** | `speed = baseSpeed * (1 - intensity)` | **Max Intensity** (Strongest slow applies) |
| **STUN** | `canMove = false`, `canAttack = false` | **Duration Extend** (Add to time) |
| **POISON** | Deal `intensity` True Damage per sec | **Intensity Stack** (Add damage) |
| **BURN** | Deal `intensity` Magic Damage per sec | **Intensity Stack** |
| **REGEN** | Heal `intensity` HP per sec | **Intensity Stack** |

### 5.3 Application Logic
1.  **Apply**:
    *   Check if effect already exists on target.
    *   If yes, apply Stacking Rule (Extend Duration OR Increase Intensity).
    *   If no, add to `entity.statusEffects`.
2.  **Update (Tick)**:
    *   Decrement `duration`.
    *   If DoT, update `tickTimer`. If `tickTimer <= 0`, apply damage and reset.
    *   Remove if `duration <= 0`.
3.  **Recalculate Stats**:
    *   Stats like `speed` are recalculated every tick based on active effects.
    *   *Pattern*: `currentSpeed = baseSpeed * product(1 - slowAmount)`

## 6. Implementation Plan
1.  **Damage System**: Implement `DamageCalculator` class.
2.  **Projectile Manager**: Handle update/collision loop.
3.  **Status Manager**: Handle application, ticking, and removal.
4.  **Integration**: Hook into `CombatSystem.update()`.
