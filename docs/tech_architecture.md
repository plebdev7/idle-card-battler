# Technical Architecture: Idle Card Battler

## 1. Technology Stack
*   **Framework**: React (via Vite) - Fast development, component-based UI.
*   **Language**: TypeScript - Strict typing for complex game state.
*   **State Management**: **Zustand** - Lightweight, supports transient updates (high frequency) without re-rendering everything.
*   **Styling**: CSS Modules or Vanilla CSS (per project constraints).
*   **Build Tool**: Vite.

## 2. Core Architecture Pattern
We will use a **Decoupled Game Loop** pattern.
*   **Game State**: Holds the "True" state of the game (Enemy HP, Card positions, Cooldowns).
*   **Game Loop**: A `requestAnimationFrame` loop that updates the Game State `delta` ms.
*   **UI Layer**: React components that *subscribe* to state changes.
    *   *Optimization*: We will use Zustand's `useStore` with selectors to ensure components only re-render when their specific data changes, not on every tick.

## 3. State Management (Zustand)
### 3.1 Store Structure
The Game State is the single source of truth for the simulation. It holds:
*   **Resources**: Gold, Mana, Max Mana.
*   **Combat State**: Lists of Enemies, Deck, Hand, and Discard pile.
*   **Tower**: Health and status.
*   **Meta**: Game running state and the main tick function.

### 3.2 The Tick System
The `tick` function is the heart of the engine.
1.  **Mana Regen**: `mana += regenRate * dt`
2.  **Cooldowns**: Reduce cooldowns of cards/enemies.
3.  **Enemy Logic**: Move enemies, attack Tower if in range.
4.  **Auto-Play Logic**: Check if Wizard can play a card (AI Tier check).

## 4. Data Structures
### 4.1 Card Entity
Cards are the primary actors. They have:
*   **Identity**: Unique ID and Template ID (e.g., "fireball").
*   **Stats**: Cost, Name.
*   **Type**: Spell, Summon, or Enchantment.
*   **Effects**: A list of actions the card performs when played.

### 4.2 Enemy Entity
Enemies are the primary antagonists. They have:
*   **Stats**: HP, Max HP, Speed, Attack Damage.
*   **Position**: A linear value from 0 (Tower) to 100 (Spawn).
*   **Combat**: Attack Speed and Next Attack timestamp.

## 5. Persistence
*   **Storage**: `localStorage` (initially).
*   **Save Frequency**: Auto-save on Floor completion and Shop exit.
*   **Format**: JSON serialization of the `GameState` (excluding transient UI state).
