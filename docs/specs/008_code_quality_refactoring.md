# Spec 008: Code Quality & Refactoring (Session 2.2.8)

## Overview

Session 2.2.8 focuses on systematic code quality improvements across the combat engine. This session consolidates technical debt from rapid prototyping in Sessions 2.2.1-2.2.7 while maintaining the data-driven architecture established in Session 2.2.2.

**Previous Work (Completed in prior sessions)**:
- ✅ Entity stats extracted to `src/data/enemies.ts`
- ✅ ID generation upgraded to `crypto.randomUUID()` in `EntityFactory.ts` and `store.ts`

**This Spec**: Addresses remaining code quality issues identified via code review.

---

## Identified Issues

### 1. Magic Numbers in Wave Manager
**File**: `src/engine/WaveManager.ts`

**Issues**:
- Line 18: `state.wave.phaseTimer = 2.0;` — Wave clearing delay
- Line 122: `const staggerDelay = i * 0.5;` — Spawn stagger delay
- Line 106: `return floor % 10 === 0;` — Boss floor frequency

**Impact**: Configuration changes require code edits instead of data updates.

### 2. Magic Numbers in Entity System
**File**: `src/engine/EntitySystem.ts`

**Issues**:
- Line 90: `enemy.position = Math.max(0, enemy.position);` — Lane minimum bound
- Line 83, 153: `1 / Math.max(0.1, ...)` — Attack cooldown fallback
- No constants for lane boundaries (inferred as 0-100 from spawn positions)

**Impact**: Combat space boundaries scattered across code.

### 3. Magic Numbers in Projectile System
**File**: `src/engine/ProjectileSystem.ts`

**Issues**:
- Line 60: `const ENTITY_RADIUS = 1.0;` — Defined as local constant
- Line 138: Hardcoded bounds check `if (proj.position < -10 || proj.position > 110)`

**Impact**: Entity collision radius and projectile culling bounds not configurable.

### 4. Magic Numbers in Status Effect System
**File**: `src/engine/StatusEffectSystem.ts`

**Issues**:
- Line 40, 44: `effect.tickTimer = 1.0;` — DoT tick interval

**Impact**: Status effect tick rate is hardcoded.

### 5. Code Duplication: Attack Logic
**Files**: `src/engine/EntitySystem.ts`

**Duplication**:
- Lines 72-84 (Enemies) and Lines 141-154 (Summons) contain nearly identical attack execution logic
- Both:
  - Create `DamageEvent` objects
  - Call `processDamage()`
  - Calculate attack cooldown with division-by-zero protection

**TODOs**:
- Line 72: `// TODO: Extract common attack logic into shared performAttack() function`

**Impact**: Bug fixes or enhancements must be applied twice.

### 6. Incomplete Error Handling
**File**: `src/data/waves.ts`

**Issue**:
- Line 83: `// TODO: Add error handling - validate wave/floor inputs and handle missing configs gracefully`
- Current `getWaveConfig()` assumes valid Floor 1 data exists
- No validation for invalid wave/floor numbers
- Silent failures possible if wave index calculation breaks

**Impact**: Invalid inputs could cause runtime crashes.

### 7. Missing TODO Implementations
**File**: `src/engine/EntitySystem.ts`

**TODOs**:
- Line 47: `// TODO: Handle stun duration decrement`
  - **Status**: Actually handled by `StatusEffectSystem.ts` (line 32: `effect.duration -= dt`)
  - **Action**: Remove stale comment
- Line 161: `// TODO: Clamp position?`
  - **Context**: Summons moving right could exceed lane bounds
  - **Action**: Implement position clamping similar to enemies (line 90)

**File**: `src/engine/WaveManager.ts`
- Line 159: `// handleGameOver(state); // TODO: Implement game over`
  - **Status**: Loss detection implemented via `checkLossCondition()` 
  - **Action**: Remove stale comment

**File**: `src/state/store.ts`
- Line 15: `// TODO: Consider using crypto.randomUUID() for guaranteed uniqueness`
  - **Status**: **Completed** — already uses `crypto.randomUUID()`
  - **Action**: Remove stale comment

### 8. Legacy ID Generation Pattern
**File**: `src/engine/StatusEffectSystem.ts`

**Issue**:
- Line 191: Uses old pattern `Date.now() + Math.random()` for status effect IDs
- Inconsistent with `crypto.randomUUID()` used in `EntityFactory.ts` and `store.ts`

**Impact**: Inconsistent ID generation strategy across codebase.

---

## Proposed Changes

### Change Set 1: Extract Constants to Configuration File

**New File**: `src/config/gameConfig.ts`

```typescript
/**
 * Core game configuration.
 * Centralized config object for engine tuning and future runtime configuration.
 */

export const gameConfig = {
  combat: {
    // Lane boundaries (1D combat space)
    laneMin: 0,
    laneMax: 100,
    laneSpawnPosition: 100, // Enemy spawn point (right side)
    towerPosition: 0,       // Tower position (left side)

    // Collision detection
    entityRadius: 1.0,      // Hitbox radius for entities

    // Attack system
    minAttackSpeed: 0.1,    // Prevent division by zero (results in 10s cooldown)
  },

  projectiles: {
    // Projectile culling bounds (prevents infinite projectiles)
    cullMin: -10,
    cullMax: 110,
  },

  statusEffects: {
    // DoT (Damage/Heal over Time) tick rate
    tickInterval: 1.0,      // Seconds between ticks
  },

  waves: {
    // Wave progression timing
    clearingDelay: 2.0,     // Delay before marking wave complete (seconds)
    spawnStagger: 0.5,      // Delay between spawning units in same group (seconds)
    
    // Floor structure
    bossFloorFrequency: 10, // Boss appears every N floors
  },
} as const;

// Type for the config (useful for future runtime config)
export type GameConfig = typeof gameConfig;
```

**Rationale**:
- **Structured organization**: Grouped by system (combat, projectiles, statusEffects, waves)
- **Future-proof**: Easy to extend with runtime configuration or mod support
- **Type-safe**: `as const` provides readonly config with literal types
- **Self-documenting**: Config structure mirrors game architecture
- **Follows data-driven architecture** principle from Session 2.2.2

---

### Change Set 2: Refactor WaveManager Magic Numbers

**File**: `src/engine/WaveManager.ts`

**Changes**:
1. Import config: `import { gameConfig } from '../config/gameConfig';`
2. Replace magic numbers:
   - Line 18: `state.wave.phaseTimer = 2.0;` → `gameConfig.waves.clearingDelay`
   - Line 122: `const staggerDelay = i * 0.5;` → `gameConfig.waves.spawnStagger`
   - Line 106: `return floor % 10 === 0;` → `floor % gameConfig.waves.bossFloorFrequency === 0`
3. Remove stale TODO comment at line 159

---

### Change Set 3: Refactor EntitySystem

**File**: `src/engine/EntitySystem.ts`

**Changes**:

1. **Import config**: `import { gameConfig } from '../config/gameConfig';`

2. **Extract `performAttack()` function** (Addresses TODO at line 72):
   ```typescript
   function performAttack(attacker: Entity, target: Entity) {
     const damageEvent: DamageEvent = {
       sourceId: attacker.id,
       targetId: target.id,
       amount: attacker.stats.damage,
       type: "PHYSICAL",
     };
     processDamage(damageEvent, attacker, target);
     attacker.attackCooldown = 1 / Math.max(gameConfig.combat.minAttackSpeed, attacker.stats.attackSpeed);
   }
   ```

3. **Replace duplicated attack logic**:
   - Line 72-84 (Enemies): Replace with `performAttack(enemy, target);`
   - Line 141-154 (Summons): Replace with `performAttack(summon, target);`

4. **Add position clamping for summons** (Line 161):
   ```typescript
   summon.position += summon.stats.speed * dt;
   summon.position = Math.min(gameConfig.combat.laneMax, summon.position);
   ```

5. **Remove stale TODO comment** at line 47 (stun duration already handled)

6. **Replace magic numbers**:
   - Line 90: `Math.max(0, enemy.position)` → `Math.max(gameConfig.combat.laneMin, enemy.position)`

---

### Change Set 4: Refactor ProjectileSystem

**File**: `src/engine/ProjectileSystem.ts`

**Changes**:
1. Import config: `import { gameConfig } from '../config/gameConfig';`
2. Remove local `ENTITY_RADIUS` constant (line 60)
3. Replace with config references:
   - Line 60: Use `gameConfig.combat.entityRadius` directly
   - Line 138: Replace bounds check:
   ```typescript
   if (proj.position < gameConfig.projectiles.cullMin || proj.position > gameConfig.projectiles.cullMax)
   ```

---

### Change Set 5: Refactor StatusEffectSystem

**File**: `src/engine/StatusEffectSystem.ts`

**Changes**:
1. Import config: `import { gameConfig } from '../config/gameConfig';`
2. Replace tick timer initialization (lines 40, 44):
   ```typescript
   if (!effect.tickTimer) effect.tickTimer = gameConfig.statusEffects.tickInterval;
   // ...
   effect.tickTimer = gameConfig.statusEffects.tickInterval;
   ```
3. Replace legacy ID generation (line 191):
   ```typescript
   id: crypto.randomUUID(),
   ```

---

### Change Set 6: Add Error Handling to Wave Config

**File**: `src/data/waves.ts`

**Changes**:
```typescript
export function getWaveConfig(floor: number, wave: number): WaveConfig {
  // Validate inputs
  if (floor < 1) {
    console.warn(`Invalid floor number: ${floor}. Defaulting to floor 1.`);
    floor = 1;
  }
  if (wave < 1 || wave > 5) {
    console.warn(`Invalid wave number: ${wave}. Clamping to 1-5.`);
    wave = Math.max(1, Math.min(5, wave));
  }

  // For prototype, loop Floor 1 waves for all floors
  const waveIndex = (wave - 1) % 5;
  const config = FLOOR_1_WAVES[waveIndex];
  
  if (!config) {
    throw new Error(`Critical: No wave config found for floor ${floor}, wave ${wave}`);
  }
  
  return config;
}
```

**Rationale**:
- Defensive programming prevents silent failures
- Console warnings aid debugging during development
- Throws error if data corruption detected (missing config)

---

### Change Set 7: Remove Stale TODO Comments

**Files**:
- `src/engine/EntitySystem.ts` (line 47)
- `src/engine/WaveManager.ts` (line 159)
- `src/state/store.ts` (line 15)

**Action**: Delete obsolete comments referencing completed work.

---

## Extensibility Check

### ✅ Data-Driven Architecture Maintained
- All magic numbers moved to `gameConfig.ts` for easy tuning
- No new hardcoded values introduced
- Wave configuration error handling prevents silent failures

### ✅ No Hardcoded Values
- Constants are exported and imported, not duplicated
- Single source of truth for each configuration value

### ✅ Maintainability Improvements
- **DRY Principle**: Attack logic centralized in `performAttack()`
- **Readability**: Named constants replace mysterious numbers
- **Consistency**: All IDs use `crypto.randomUUID()`

### ✅ Extensibility Improvements
- **Structured configuration**: Config organized by system (combat, projectiles, statusEffects, waves) makes it easy to find and modify related settings
- **Type-safe with `as const`**: Provides readonly config with literal types for autocomplete and compile-time safety
- **Ready for runtime config**: Structure supports loading from JSON or user settings in the future

### ⚠️ Future Enhancements (Out of Scope)
- Replace `as const` with mutable object if runtime tuning needed
- Boss floor frequency could move to wave data when procedural generation is added
- Add config validation schema (Zod, etc.) if user-facing config editor is built

---

## Out of Scope

The following are explicitly **not** addressed in this session:
- **Performance optimization**: No profiling or optimization work
- **New features**: No gameplay changes or additions
- **Test coverage expansion**: Existing tests will validate refactoring; no new test requirements
- **Architecture changes**: No structural changes to engine/data separation

---

## Testing Strategy

### Automated Regression Tests
All existing tests must pass without modification:
- ✅ 19 test files, 209 tests currently passing
- Changes are refactoring only; behavior should remain identical
- Any test failures indicate regression bugs

### Manual Verification (Optional)
If desired, verify in running game:
1. Start combat run (Floor 1, Wave 1)
2. Observe enemies spawning at position 100
3. Observe attack animations and damage numbers
4. Verify status effects (Slow, Poison, etc.) tick correctly
5. Complete wave to verify 2-second clearing delay

### Edge Case Validation
Test error handling in `getWaveConfig()`:
1. Call `getWaveConfig(0, 1)` → Should warn and default to floor 1
2. Call `getWaveConfig(1, 0)` → Should warn and clamp to wave 1
3. Call `getWaveConfig(1, 10)` → Should warn and clamp to wave 5

---

## Verification Steps

**Command**: `npm test`

**Expected Result**: All 209 tests pass (no regressions)

**Additional Checks**:
- No TypeScript errors: `npm run build`
- Linter passes: `npx biome check .`

---

## References

- **Session 2.2.2**: Architectural Refactor (data-driven approach)
- **Roadmap**: `docs/roadmap.md` (Session 2.2.8 checklist)
- **Coding Standards**: `docs/coding_standards.md` (if exists)
- **Prior Code Review**: 2025-11-25 (identified EntityFactory and WaveManager issues)
