# RFC 001: Run Structure & Enemy Design

## 1. Run Structure: The Tower Floors
We propose adopting the **Discrete Floors** model (recommended in the high-level doc) over an infinite continuous stream. This provides better pacing, distinct goals, and strategic breaks.

### 1.1 The Floor Loop
A single "Run" consists of climbing multiple **Floors** of the Wizard's Tower.
*   **Standard Floor**: Consists of **5 Waves** of enemies.
*   **Boss Floor**: Every 10th Floor is a Boss Floor (1 Wave with a Boss + adds).
*   **The Break Room**: Between every Floor, the game pauses. The player enters a "Break Room" (UI Screen).

### 1.2 The Break Room Activities
This is the only time the player can perform "Slow" actions.
**Idle Support**: The player can toggle "Auto-Continue" to automatically pick the best affordable option (or save gold) and proceed after a short delay, enabling fully idle runs.

1.  **Shop**: Spend Gold to buy **Temporary Artifacts** or **Card Mods** (e.g., "This run: Fireball deals +50% Dmg").
    *   *Note*: You do NOT add/remove cards from your deck during a run. Your deck is your persistent loadout.
2.  **Rest**: Heal the Tower.
3.  **Blessing**: Choose 1 temporary buff from a selection (Reward for clearing the floor).

### 1.3 Wave Logic
Within a Standard Floor (5 Waves):
*   **Wave 1-2**: Weak "Trash" mobs. High count, low HP. (Test of AOE).
*   **Wave 3**: "Elite" or "Tank" introduction. (Test of Single Target DPS).
*   **Wave 4**: Mixed composition.
*   **Wave 5**: "Mini-Boss" or "Swarm". High intensity.

## 2. Enemy Design: The Legions of Darkness
Enemies should not just be stats; they should demand specific answers from the player's deck.

### 2.1 Enemy Archetypes
| Archetype | Behavior | Counter-Strategy |
| :--- | :--- | :--- |
| **Swarm** | Low HP, High Speed, Spawns in groups of 3-5. | **AOE** (Fireball, Chain Lightning) |
| **Tank** | High HP, Slow Speed, High Armor (reduces physical dmg). | **True Damage** or **High Single Target** |
| **Ranged** | Low HP, Attacks Tower from a distance (doesn't need to reach it). | **Snipe Spells** or **Fast Summons** |
| **Support** | Heals or Buffs other enemies. Low combat stats. | **Priority Targeting** (AI Logic) |
| **Assassin** | High Speed, Ignores Summons (targets Tower directly). | **Taunt** or **Stun/Freeze** |

### 2.2 Biome 1: The Crypt (Undead Theme)
*   **Skeleton Grunt (Swarm)**: Basic melee unit.
*   **Bone Shield (Tank)**: Has a shield that blocks the first 3 hits completely.
*   **Necromancer (Support)**: Raises a Skeleton Grunt every 5 seconds if not killed.
*   **Ghost (Assassin)**: Phases through units, must be hit by Magic damage (Physical immune).

## 3. Economy Draft
### 3.1 Gold (Run Currency)
*   **Earned**: Killing enemies, clearing floors, selling artifacts.
*   **Spent**: Shop items (Temp Mods/Artifacts), Tower Repairs.
*   **Lost**: On death (0% retained).

### 3.2 Essence (Meta Currency)
*   **Earned**:
    *   Boss Kills (Large amount).
    *   "Recycling" cards in the Grimoire (Small amount).
    *   Achievements/Quests.
*   **Spent**:
    *   **Card Packs**: Buy standard packs containing random cards. (Future: Special packs for different Essence types).
    *   Upgrading Wizard Talents (Passive Tree).
    *   Upgrading Card Base Stats (Permanent).
