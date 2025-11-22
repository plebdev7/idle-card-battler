# RFC 002: The Idle Deck Cycle

## 1. Overview
The "Idle Deck Cycle" is the heartbeat of the game. Unlike traditional card games where the player manually advances the turn, this system runs continuously in real-time. The "Player" (Wizard) is an AI agent acting on behalf of the user, constrained by the resources (Mana, Cards) and logic (AI Priority) the user has set up.

## 2. Core Resources

### 2.1 Mana (The Fuel)
*   **Mana Pool**: The player has a `Current Mana` and `Max Mana` value.
*   **Regeneration**: Mana regenerates at a fixed rate of `X Mana / Second`.
    *   *Base Rate*: 1.0 Mana/sec (Subject to balance).
*   **Cap**: Mana cannot exceed `Max Mana`.
*   **Visuals**: A fluid bar or orb that fills continuously.

### 2.2 The Zones
1.  **Draw Pile**: Face-down pile of cards waiting to be drawn.
2.  **Hand**: Cards currently available to be played.
    *   *Visibility*: Face-up.
    *   *Limit*: Max Hand Size (Default: 5).
3.  **Play Zone**: Where cards briefly appear when triggered (for animations/resolution) before moving to Discard.
4.  **Discard Pile**: Face-up pile of played cards.
5.  **Void (Exhaust)**: Cards removed from the cycle for the duration of the combat (e.g., "One-time use" consumables).

## 3. The Cycle Logic

### 3.1 Drawing Cards
The Draw System is **Timer-Based**, not Turn-Based.

*   **Draw Timer**: A progress bar that fills over `Draw Speed` seconds.
*   **Trigger**: When the timer fills:
    1.  **Check Hand Space**:
        *   If `Hand Size < Max Hand Size`: Draw top card from Draw Pile. Reset Timer.
        *   If `Hand Size >= Max Hand Size`: **Overdraw State**.
            *   *Design Decision*: The Draw Timer **Pauses** at 100%. It does not reset until a card is played and space opens up. This prevents "burning" key cards due to bad AI, but penalizes the player with lost time (DPS loss).
    2.  **Empty Draw Pile**:
        *   If Draw Pile is empty when a draw is attempted: Trigger **Reshuffle**.

### 3.2 Reshuffle
*   **Action**: Move all cards from `Discard Pile` -> `Draw Pile`.
*   **Shuffle**: Randomize the order of the `Draw Pile`.
*   **Resume**: Complete the draw action that triggered the reshuffle.
*   **Edge Case**: If `Draw Pile` AND `Discard Pile` are both empty (all cards in hand or Void), no draw occurs. Timer stays at 100%.

### 3.3 Playing Cards (The AI Step)
This happens on every "Tick" (e.g., 10-60 times per second).

1.  **Scan Hand**: The AI looks at all cards in the Hand.
2.  **Filter**: Identify cards that are "Playable".
    *   *Condition 1*: `Current Mana >= Card Cost`.
    *   *Condition 2*: `cooldown` is ready (if applicable).
    *   *Condition 3*: Valid Targets exist (e.g., cannot cast "Heal Tower" if Tower is full, unless specified otherwise).
3.  **Select**: Choose **ONE** card to play based on **AI Logic Tier** (see Design Doc).
    *   *Tier 1 (Novice)*: Random playable card.
4.  **Execute**:
    *   Deduct Mana.
    *   Move Card: Hand -> Play Zone -> Resolution -> Discard Pile (or Void).
    *   Reset Draw Timer (if it was paused due to full hand).

## 4. Data Structures (Draft)

```typescript
interface CardInstance {
  id: string;           // Unique instance ID (e.g., "fireball_001")
  defId: string;        // Definition ID (e.g., "spell_fireball")
  zone: 'DRAW' | 'HAND' | 'PLAY' | 'DISCARD' | 'VOID';
  currentCost: number;  // Dynamic cost (can be modified by buffs)
}

interface CombatState {
  mana: {
    current: number;
    max: number;
    regenRate: number; // per second
  };
  draw: {
    timer: number;     // Current progress (0.0 to 1.0)
    speed: number;     // Seconds to fill bar
  };
  zones: {
    draw: CardInstance[];
    hand: CardInstance[];
    discard: CardInstance[];
    void: CardInstance[];
  };
}
```

## 5. Edge Cases & Rules

*   **Simultaneous Draw & Play**: If a card is played at the exact same tick the Draw Timer fills, the Play resolves first (clearing space), then the Draw happens.
*   **Mana Overflow**: If Mana is full, regen pauses. This is a "waste" similar to Overdraw, encouraging players to have enough low-cost cards to dump mana.
*   **0-Cost Cards**: Can be played instantly. Dangerous if they flood the hand, as they might be played too quickly by a dumb AI, wasting their potential effects if not gated by conditions.
