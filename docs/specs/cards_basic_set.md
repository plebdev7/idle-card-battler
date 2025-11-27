# Phase 2: Basic Card Set Specification

To properly test the **Idle Deck Cycle** and **Combat Loop**, we need a small but diverse set of cards that exercise different mechanics (Damage, Healing, Buffs, Debuffs, Summons).

## 1. The Starter Deck (10 Cards)

This deck is designed to be the default loadout for the "Greybox" prototype.

| Card Name | Cost | Type | Effect | Purpose |
| :--- | :---: | :--- | :--- | :--- |
| **Fireball** | 3 | Spell | Deal **10 Damage** to a single target. | Basic Damage test. |
| **Zap** | 1 | Spell | Deal **3 Damage**. Cycle 1 (Draw a card). | Low cost + Cycle test. |
| **Minor Heal** | 2 | Spell | Restore **5 HP** to the Tower. | Healing logic test. |
| **Frostbolt** | 2 | Spell | Deal **5 Damage** and **Slow** enemy by 50% for 3s. | Status Effect test. |
| **Meditate** | 1 | Spell | Generate **2 Essence**. | Essence generation test. |
| **Skeleton** | 3 | Summon | Summon a 10 HP / 2 Atk Skeleton. | Summoning logic test. |
| **Mana Potion** | 0 | Spell | Gain **2 Mana**. Exhaust (Removed from deck until end of combat). | Mana manipulation + Exhaust test. |
| **Meteor** | 5 | Spell | Deal **20 Damage** to ALL enemies. | AOE Damage test. |
| **Rage** | 2 | Enchant | Grant all Summons **+2 Attack** for 5s. | Buff logic test. |
| **Study** | 1 | Spell | Draw 2 cards. | Pure Draw logic test. |

## 2. Mechanics to Implement

To support these cards, the `Card` interface and `Combat Engine` need to support:

*   **Targeting**: Single Target (Frontmost) vs AOE vs Self (Tower).
*   **Status Effects**: Slow, Stun, Burn (Damage over time).
*   **Summons**: A separate "Lane" or "Slot" system for friendly units.
*   **Keywords**:
    *   **Cycle/Draw**: Triggering a draw from a card effect.
    *   **Exhaust**: Removing a card from the cycle for the duration of the battle.
