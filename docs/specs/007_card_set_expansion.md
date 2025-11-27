# RFC 007: Card Set Expansion and Effect System

## 1. Overview

This specification defines the implementation of the full 10-card starter deck and the card effect execution system needed to support it. It also covers the restoration of automated card playing via Basic AI (Tier 1).

**Scope**: Complete the card system foundation established in Component 2.1 by:
1. Implementing the missing 7 cards (replacing Arcane Shield with Meditate for essence generation)
2. Creating a flexible card effect system
3. Restoring automated card playing (Basic AI)
4. **Critical**: Adding essence generation mechanism via new "Meditate" spell

## 2. Current State Analysis

### What Exists
- ✅ Basic card structure (`Card`, `CardInstance` types)
- ✅ Deck cycle logic (draw, reshuffle, hand management)
- ✅ `performPlay()` function that handles mana costs and zone transitions
- ✅ 3 damage-only cards (Fireball, Zap, Meteor) in initial deck
- ✅ Combat systems (damage, projectiles, status effects, entities)

### What's Missing
- ❌ Card effect execution (TODO at `CombatSystem.ts:117`)
- ❌ 7 cards: Minor Heal, Frostbolt, Arcane Shield, Skeleton, Mana Potion, Rage, Study
- ❌ Basic AI to automatically play cards
- ❌ Support for card types beyond simple damage
- ❌ Essence generation mechanism

## 3. Card Effect System Design

### 3.1 Effect Types

We need to support the following effect categories:

| Effect Type | Examples | Target | Mechanism |
|:---|:---|:---|:---|
| **Direct Damage** | Fireball, Zap, Meteor | Enemy/Enemies | Use `DamageSystem` |
| **Healing** | Minor Heal | Tower | Modify `tower.stats.hp` |
| **Status Application** | Frostbolt | Enemy | Use `StatusEffectSystem` |
| **Buffs** | Arcane Shield, Rage | Tower/Summons | Add temporary stat modifiers |
| **Summoning** | Skeleton | Lane | Create entity via `EntityFactory` |
| **Resource Manipulation** | Mana Potion | Player | Modify `state.mana` |
| **Card Draw** | Zap, Study | Player | Call `performDraw()` |
| **Exhaust** | Mana Potion | Card | Move to void pile |
| **Essence Generation** | (TBD card) | Player | Increment essence counter |

### 3.2 Data-Driven Card Definitions

**Extend the `Card` type to support effects**:

```typescript
export type CardType = "SPELL" | "SUMMON" | "ENCHANT";

export type EffectType = 
  | "DAMAGE"
  | "HEAL"
  | "STATUS"
  | "BUFF"
  | "SUMMON"
  | "RESOURCE"
  | "DRAW"
  | "ESSENCE";

export type TargetType = "ENEMY" | "ALL_ENEMIES" | "TOWER" | "ALL_SUMMONS" | "SELF";

export interface CardEffect {
  type: EffectType;
  target: TargetType;
  
  // Damage effects
  damage?: number;
  damageType?: DamageType;
  
  // Heal effects
  heal?: number;
  
  // Status effects
  statusType?: StatusEffectType;
  statusDuration?: number;
  statusIntensity?: number;
  
  // Buff effects (temporary stat mods)
  statModifier?: {
    stat: keyof EntityStats;
    value: number;
    duration: number;
  };
  
  // Summon effects
  summonDefId?: string;
  
  // Resource effects
  manaGain?: number;
  essence?: number;
  
  // Draw effects
  drawCount?: number;
}

export interface Card {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  effects: CardEffect[];
  exhaust?: boolean; // If true, goes to void pile
}
```

### 3.3 Card Database

**Create `src/data/cardDefinitions.ts`** with all 10 starter cards:

```typescript
export const CARD_DEFINITIONS: Record<string, Card> = {
  "spell_fireball": {
    id: "spell_fireball",
    name: "Fireball",
    cost: 3,
    type: "SPELL",
    effects: [
      { type: "DAMAGE", target: "ENEMY", damage: 10, damageType: "MAGICAL" }
    ]
  },
  "spell_zap": {
    id: "spell_zap",
    name: "Zap",
    cost: 1,
    type: "SPELL",
    effects: [
      { type: "DAMAGE", target: "ENEMY", damage: 3, damageType: "MAGICAL" },
      { type: "DRAW", target: "SELF", drawCount: 1 }
    ]
  },
  "spell_meteor": {
    id: "spell_meteor",
    name: "Meteor",
    cost: 5,
    type: "SPELL",
    effects: [
      { type: "DAMAGE", target: "ALL_ENEMIES", damage: 20, damageType: "MAGICAL" }
    ]
  },
  "spell_minor_heal": {
    id: "spell_minor_heal",
    name: "Minor Heal",
    cost: 2,
    type: "SPELL",
    effects: [
      { type: "HEAL", target: "TOWER", heal: 5 }
    ]
  },
  "spell_frostbolt": {
    id: "spell_frostbolt",
    name: "Frostbolt",
    cost: 2,
    type: "SPELL",
    effects: [
      { type: "DAMAGE", target: "ENEMY", damage: 5, damageType: "MAGICAL" },
      { type: "STATUS", target: "ENEMY", statusType: "SLOW", statusDuration: 3, statusIntensity: 0.5 }
    ]
  },
  "spell_meditate": {
    id: "spell_meditate",
    name: "Meditate",
    cost: 1,
    type: "SPELL",
    effects: [
      { type: "ESSENCE", target: "SELF", essence: 2 }
    ]
  },
  "summon_skeleton": {
    id: "summon_skeleton",
    name: "Skeleton",
    cost: 3,
    type: "SUMMON",
    effects: [
      { type: "SUMMON", target: "SELF", summonDefId: "skeleton" }
    ]
  },
  "spell_mana_potion": {
    id: "spell_mana_potion",
    name: "Mana Potion",
    cost: 0,
    type: "SPELL",
    effects: [
      { type: "RESOURCE", target: "SELF", manaGain: 2 }
    ],
    exhaust: true
  },
  "enchant_rage": {
    id: "enchant_rage",
    name: "Rage",
    cost: 2,
    type: "ENCHANT",
    effects: [
      { type: "BUFF", target: "ALL_SUMMONS", statModifier: { stat: "damage", value: 2, duration: 5 } }
    ]
  },
  "spell_study": {
    id: "spell_study",
    name: "Study",
    cost: 1,
    type: "SPELL",
    effects: [
      { type: "DRAW", target: "SELF", drawCount: 2 }
    ]
  }
};

// Starter deck composition
export const STARTER_DECK_IDS = [
  "spell_fireball", "spell_fireball", "spell_fireball", "spell_fireball",
  "spell_zap", "spell_zap", "spell_zap", "spell_zap",
  "spell_meteor", "spell_meteor"
];
```

### 3.4 Card Effect Executor

**Create `src/engine/CardEffectSystem.ts`**:

```typescript
import type { GameData } from "../types/game";
import type { CardEffect } from "../types/game";
import { applyDamage } from "./DamageSystem";

/**
 * Executes a single card effect on the game state.
 * Mutates state via immer.
 */
export function executeEffect(state: GameData, effect: CardEffect, sourceCardId: string): void {
  switch (effect.type) {
    case "DAMAGE":
      executeDamageEffect(state, effect);
      break;
    case "HEAL":
      executeHealEffect(state, effect);
      break;
    case "STATUS":
      executeStatusEffect(state, effect);
      break;
    case "BUFF":
      executeBuffEffect(state, effect);
      break;
    case "SUMMON":
      executeSummonEffect(state, effect);
      break;
    case "RESOURCE":
      executeResourceEffect(state, effect);
      break;
    case "DRAW":
      executeDrawEffect(state, effect);
      break;
    case "ESSENCE":
      executeEssenceEffect(state, effect);
      break;
  }
}

// Individual effect executors...
function executeDamageEffect(state: GameData, effect: CardEffect): void {
  // Get targets based on target type
  const targets = getTargets(state, effect.target);
  
  for (const target of targets) {
    applyDamage(state, {
      sourceId: "tower", // Cards come from tower
      targetId: target.id,
      amount: effect.damage ?? 0,
      type: effect.damageType ?? "MAGICAL"
    });
  }
}

function executeHealEffect(state: GameData, effect: CardEffect): void {
  if (effect.target === "TOWER") {
    state.tower.stats.hp = Math.min(
      state.tower.stats.maxHp,
      state.tower.stats.hp + (effect.heal ?? 0)
    );
  }
}

// ... more effect executors
```

### 3.5 Integration with `performPlay()`

**Modify `src/engine/CombatSystem.ts`**:

```typescript
export function performPlay(state: GameData, cardId: string) {
  const cardIndex = state.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return;

  const cardInstance = state.hand[cardIndex];
  
  // Look up card definition
  const cardDef = CARD_DEFINITIONS[cardInstance.defId];
  if (!cardDef) {
    console.error(`Unknown card definition: ${cardInstance.defId}`);
    return;
  }

  if (state.mana < cardInstance.currentCost) return;

  // Pay Cost
  state.mana -= cardInstance.currentCost;

  // Execute Effects
  for (const effect of cardDef.effects) {
    executeEffect(state, effect, cardInstance.id);
  }

  // Move to Discard or Void
  state.hand.splice(cardIndex, 1);
  if (cardDef.exhaust) {
    cardInstance.zone = "VOID";
    state.voidPile.push(cardInstance);
  } else {
    cardInstance.zone = "DISCARD";
    state.discardPile.push(cardInstance);
  }
}
```

## 4. Basic AI (Tier 1) System

### 4.1 AI Design

**From `design_doc.md` Section 3.2**:
- **Tier 1: Novice (Random)** - The Wizard plays any playable card as soon as Mana is available.

### 4.2 AI Implementation

**Create `src/engine/AISystem.ts`**:

```typescript
import type { GameData, CardInstance } from "../types/game";
import { performPlay } from "./CombatSystem";
import { CARD_DEFINITIONS } from "../data/cardDefinitions";

/**
 * Basic AI decision logic (Tier 1: Random playable card)
 * Called every tick when the game is running.
 */
export function updateAI(state: GameData, dt: number): void {
  // Find all playable cards in hand
  const playableCards = state.hand.filter(card => isCardPlayable(state, card));
  
  if (playableCards.length === 0) return;
  
  // Tier 1: Random selection
  const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)];
  performPlay(state, randomCard.id);
}

/**
 * Helper to determine if a card can be played.
 */
function isCardPlayable(state: GameData, card: CardInstance): boolean {
  // Check mana
  if (state.mana < card.currentCost) return false;
  
  // Check target validity
  const cardDef = CARD_DEFINITIONS[card.defId];
  if (!cardDef) return false;
  
  // Check if card has valid targets (e.g., can't heal if tower is at max HP)
  for (const effect of cardDef.effects) {
    if (!hasValidTargets(state, effect)) {
      return false;
    }
  }
  
  return true;
}

function hasValidTargets(state: GameData, effect: CardEffect): boolean {
  // For Phase 2, we'll be permissive - most cards can always be played
  // Future: Add logic for "can't heal at full HP" etc.
  
  if (effect.target === "ENEMY" || effect.target === "ALL_ENEMIES") {
    return state.enemies.length > 0;
  }
  
  return true;
}
```

### 4.3 Integration with Game Loop

**Modify `src/engine/CombatSystem.ts`**:

```typescript
export function processTick(state: GameData, dt: number) {
  if (!state.isRunning) return;

  // 1. Mana Regen
  // ... existing code ...
  
  // 2. Wave Management
  // ... existing code ...
  
  // 3. AI Card Playing (NEW)
  updateAI(state, dt);
  
  // 4. Draw Timer
  // ... existing code ...
  
  // ... rest of tick processing ...
}
```

## 5. Essence System

### 5.1 State Extension

**Extend `GameData` in `src/types/game.ts`**:

```typescript
export interface GameData {
  // ... existing fields ...
  
  // NEW: Persistent currency
  essence: number;
}
```

### 5.2 Essence Generation

Essence is generated when specific card effects are executed. The `Zap` card is designated as the primary essence generator in the starter deck.

**Implementation**: Already covered in `executeEssenceEffect()` in CardEffectSystem.

## 6. Edge Cases & Validation

### 6.1 Card Targeting

- **No valid targets**: Card should not be playable (AI won't select it)
- **Target dies mid-resolution**: Damage effect skips dead targets
- **Heal at full HP**: For Phase 2, allow it (no restriction)

### 6.2 Deck Exhaustion

- **All cards in hand or void**: Draw timer stays at 100%, no cards drawn
- **AI has no playable cards**: AI does nothing, waits for mana regen or draw

### 6.3 Mana Edge Cases

- **Mana Potion at max mana**: Mana caps at `maxMana` (overflow discarded)
- **Negative mana**: Should never happen (playability check prevents it)

### 6.4 Effect Ordering

- Effects execute in array order
- Example: Zap deals damage, then draws a card, then grants essence

## 7. Testing Strategy

### 7.1 Unit Tests Required

**File: `src/engine/CardEffectSystem.test.ts`**
- Test each effect type individually
- Test targeting logic
- Test edge cases (empty enemy list, max HP healing, etc.)

**File: `src/engine/AISystem.test.ts`**
- Test card playability checks
- Test random selection (verify it picks from playable cards only)
- Test AI does nothing when no cards are playable

**Extend: `src/engine/CombatSystem.test.ts`**
- Test `performPlay()` with new card effects
- Test exhaust mechanic
- Test essence increment

**Extend: `src/state/store.test.ts`**
- Test essence counter initialization

### 7.2 Integration Tests

Run full combat scenarios:
- AI plays cards automatically during combat
- Essence accumulates over multiple card plays
- Full deck cycle with all 10 card types

### 7.3 Manual Verification

1. Start game in browser
2. Observe AI automatically playing cards
3. Verify visual feedback for card effects (damage numbers, healing, summons appearing)
4. Check essence counter increments when Zap is played

## 8. Implementation Order

1. **Data Structures**: Extend types (`Card`, `CardEffect`, `GameData`)
2. **Card Database**: Create `cardDefinitions.ts` with all 10 cards
3. **Effect System**: Implement `CardEffectSystem.ts`
4. **Update `performPlay()`**: Replace TODO with effect execution
5. **AI System**: Implement `AISystem.ts`
6. **Integration**: Wire AI into game loop
7. **Tests**: Write comprehensive unit tests
8. **Manual Verification**: Test in browser

## 9. Future Extensibility

This design supports future expansion:

✅ **New Cards**: Just add to `CARD_DEFINITIONS`
✅ **New Effect Types**: Add to `EffectType` enum and implement executor
✅ **Advanced AI (Tier 2+)**: Replace random selection with priority logic
✅ **Effect Modifiers**: Add fields like `damageMultiplier` to effects
✅ **Combo Systems**: Effects can check game state for conditional bonuses

## 10. Design Decisions Summary

| Question | Decision | Rationale |
|:---|:---|:---|
| **How to structure effects?** | Array of `CardEffect` objects | Allows multi-effect cards (e.g., Zap) and easy extension |
| **Data-driven or hardcoded?** | Data-driven via `CARD_DEFINITIONS` | Easy to add new cards, supports future editor/modding |
| **AI Tier for Phase 2?** | Tier 1 (Random) only | Simple to implement, validates core loop |
| **Which card generates essence?** | Meditate (new 1-cost spell) | Pure essence generation, 2 essence per cast |
| **Heal at full HP allowed?** | Yes (for now) | Simplifies AI logic, can restrict in Tier 2+ |
| **Block/Shield system?** | Defer to Phase 3+ | Arcane Shield replaced with Meditate for Phase 2 |
| **Summon implementation?** | Use existing `EntityFactory` | Leverage tested entity system |
| **Legacy damage field?** | Removed completely | No backwards compatibility needed |
