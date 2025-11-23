# Idle Card Battler - High Level Design Document

## 1. Core Concept [DECIDED]
**Pitch**: You are a Wizard defending your Tower against endless waves of darkness. You build a deck of spells and summon minions to fight for you. The game plays itself, but your deck-building strategy determines how far you climb before you are overwhelmed. Death is inevitable, but your knowledge (and card collection) grows with every failure.

**Theme**: **Dark Fantasy / Wizard Tower Defense**.
*   **Visuals**: Grim, magical, arcane circles, hordes of undead/demons.
*   **Perspective**: **Single Point Defense**. The Tower is on the left (or center), enemies swarm from the right (or all sides).

## 2. Core Loop (Roguelite + Collection) [DECIDED]
1.  **The Collection (Persistent)**:
    *   You have a "Grimoire" (Binder) of hundreds of cards.
    *   Cards are permanently collected and leveled up using resources from runs.
    *   **Goal**: Expand the Grimoire and find rare "Chase Cards" (Legendary Spells, Unique Summons).
2.  **The Run (Roguelite)**:
    *   **Setup**: Construct a "Starter Deck" (e.g., 10 cards) from your Grimoire.
    *   **Climb**: Enter the Tower. Fight through **Discrete Floors** (5 Waves per Floor).
    *   **Break Room**: Between floors, visit the Shop/Rest site. Buy **Temporary Artifacts** or **Card Mods** (e.g., "+2 Dmg this run").
    *   **No Deckbuilding**: You cannot add/remove cards from your deck during a run. Your loadout is fixed.
    *   **Death**: When the Tower falls, the run ends. You lose all temporary buffs/progress.
    *   **Reward**: You keep Gold/Essence earned. Gold is converted or lost; Essence is kept.

## 3. Gameplay Mechanics: The Idle Card System [DRAFT]

### 3.1 The "Idle" Deck Cycle [SPEC](specs/002_idle_deck_cycle.md)
### 3.2 The Combat Loop [SPEC](specs/003_combat_loop.md)
To make card games work in an idle format, we need to automate the "Decision Making" while keeping the "Randomness" fun.

*   **The Deck**: A small, consistent deck (e.g., 8-15 cards).
*   **The Hand**: Maximum hand size (e.g., 5 cards).
*   **Draw Logic**:
    *   Draw 1 card every `X` seconds (Draw Speed).
    *   *OR* Draw 1 card whenever a card is played.
*   **Mana System**:
    *   Mana regenerates over time (Mana per second).
    *   Cards have Mana Costs.
    *   **Shuffle**: When the Draw Pile is empty, the Discard Pile is shuffled into the Draw Pile.

### 3.2 Idle Support (Full Automation) [DRAFT]
*   **Auto-Continue**: Players can toggle an option to automatically proceed through Break Rooms.
*   **Logic**: The game will automatically buy the best affordable upgrade (based on simple heuristics) or save gold, then continue to the next floor after a short delay.

### 3.2 AI Logic & Progression (The "Wizard's Wisdom") [DECIDED]
The Wizard's ability to play cards intelligently is not static; it is a progression system itself. As you level up your Wizard, you unlock more control over the auto-battler.

*   **Tier 1: Novice (Random)**
    *   The Wizard plays any playable card as soon as Mana is available.
    *   *Strategy*: Relies on raw stats and simple, universally good cards.
*   **Tier 2: Apprentice (Basic Priority)**
    *   Unlocks "Role Priority".
    *   *Example*: "Prioritize Healing" vs "Prioritize Damage".
*   **Tier 3: Adept (Conditions)**
    *   Unlocks simple conditional triggers.
    *   *Example*: "Only cast 'Fireball' if 3+ Enemies exist."
    *   *Example*: "Only cast 'Heal' if HP < 50%."
*   **Tier 4: Master (Gambits)**
    *   Full programmable logic (simplified FF12 Gambits).
    *   *Example*: "If Enemy = Boss AND Mana > 5 -> Cast 'Death Ray'."

### 3.3 Managing Randomness (Strategy vs Luck) [DRAFT]
Since the player isn't manually choosing cards, "Bad Draw RNG" can feel frustrating. We mitigate this with **Deck Building Mechanics**:

1.  **Cycling / Cantrips**: Low-cost cards that "Draw a Card". Essential for digging through the deck to find your win conditions.
2.  **Retain**: Some cards (or Artifacts) allow a card to "Stick" in the hand until a specific condition is met (e.g., "Hold 'Meteor' until 5+ enemies are present").
3.  **Tutors**: Cards that search for other cards (e.g., "Summon Imp: Draw a Fire Spell").
4.  **The "Panic Button"**: A player-activated "Ultimate" (long cooldown) that reshuffles the hand or clears the screen. Gives the player *some* agency during the idle phase.

## 4. Card Design Space [SPEC](specs/cards_basic_set.md)
The system is built to support hundreds of cards across different "Schools of Magic".

### 4.1 Schools of Magic (Archetypes)
*   **Pyromancy (AOE / Burn)**: High damage, hits multiple enemies. Good against swarms.
*   **Necromancy (Summon / Sacrifice)**: Summon skeletons. Sacrifice them to heal or buff the Tower.
*   **Abjuration (Defense / Control)**: Walls, Slows, Stuns. Buys time for mana regen.
*   **Divination (Deck Manipulation)**: Draw cards, reduce costs, foresee attacks.

### 4.2 Card Types
*   **Spells**: Instant effects (Fireball, Heal).
*   **Summons**: Units that stand in front of the tower and fight. They have HP and Attack.
*   **Enchantments**: Permanent (or long duration) buffs to the Tower or Summons.

### 4.3 Chase Cards & Rarity
*   **Common**: Basic damage/utility.
*   **Rare**: Specialized effects (e.g., "Apply Burn to all enemies").
*   **Legendary**: Unique, build-defining effects.
    *   *Example*: "Phoenix Feather" - If you die, revive with 50% HP and deal massive damage. (One use per run).
    *   *Example*: "Time Stop" - Freeze all enemies for 5 seconds.

## 5. Progression Systems [DRAFT]

### 5.1 The Grimoire (Collection)
*   **Card Packs**: Spend Essence to buy "Standard Packs" containing random cards.
*   **Level Up**: Duplicate cards (Shards) increase card stats (Damage, Heal amount).
*   **Mastery**: Using a card often unlocks "Mastery" which might add a small secondary effect (e.g., "Fireball now also applies minor Burn").

### 5.2 The Wizard (Hero)
*   **Talents**: Passive tree. (+Mana Regen, +Tower HP, +Draw Speed).
*   **Robes/Staves**: Equipment that buffs specific Schools of Magic.

## 6. Enemy Design [SPEC](specs/001_run_and_enemies.md)
Enemies demand specific answers from the player's deck.

### 6.1 Archetypes
*   **Swarm**: Low HP, High Speed, Group spawns. (Counter: AOE).
*   **Tank**: High HP, High Armor. (Counter: True Damage / Single Target).
*   **Ranged**: Attacks Tower from range. (Counter: Snipe / Fast Summons).
*   **Assassin**: Ignores Summons, targets Tower. (Counter: Taunt / CC).

## 7. Next Steps
1.  **Prototyping**: Build the "Greybox" battle simulator.
2.  **Tech Stack**: Define State Management (Zustand) and Game Loop.
