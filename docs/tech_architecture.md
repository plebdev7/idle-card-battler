# Technical Architecture: Idle Card Battler

> **See Also**: [ADR 0002: Separate Data, Engine Logic, and State Management](adr/0002-separate-data-engine-state.md)

## 1. Technology Stack
*   **Framework**: React (via Vite) - Fast development, component-based UI.
*   **Language**: TypeScript - Strict typing for complex game state.
*   **State Management**: **Zustand** - Lightweight, supports transient updates (high frequency) without re-rendering everything.
*   **Styling**: CSS Modules or Vanilla CSS (per project constraints).
*   **Build Tool**: Vite.

## 2. Three-Layer Architecture

The codebase is organized into three distinct layers with clear separation of concerns:

### 2.1 Data Layer (`src/data/`)
**Purpose**: Static game content definitions (cards, enemies, etc.)

*   **Files**: 
    *   `cards.ts` - Card definitions and the initial deck
    *   `enemies.ts` - Enemy stats and factory functions
*   **Rules**: Pure data structures with no logic. Adding new content (cards, enemies) is a data-only change.

### 2.2 Engine Layer (`src/engine/`)
**Purpose**: Core game systems and logic (pure functions where possible)

*   **Files**:
    *   `GameLoop.ts` - Fixed timestep game loop hook (20 TPS)
    *   `CombatSystem.ts` - Game tick processing, card drawing, card playing
    *   `GameLoop.test.ts` - Unit tests for deterministic behavior
*   **Rules**: Minimal React dependencies (only hooks), highly testable pure functions.

### 2.3 State Layer (`src/state/`)
**Purpose**: Global state management with Zustand

*   **Files**:
    *   `store.ts` - Unified game store using Immer middleware
*   **Rules**: Actions delegate to engine functions. State updates use Immer for mutable-style syntax while maintaining immutability.
*   **Benefits**: Single source of truth, consolidating the previous separate `useGameStore` and `useCombatStore`.

## 3. Core Architecture Pattern
We will use a **Decoupled Game Loop** pattern.
*   **Game State**: Holds the "True" state of the game (Enemy HP, Card positions, Cooldowns).
*   **Game Loop**: A `requestAnimationFrame` loop that updates the Game State `delta` ms.
*   **UI Layer**: React components that *subscribe* to state changes.
    *   *Optimization*: We will use Zustand's `useStore` with selectors to ensure components only re-render when their specific data changes, not on every tick.

## 4. State Management (Zustand + Immer)
### 4.1 Store Structure
The unified game store (`src/state/store.ts`) is the single source of truth for the simulation. It holds:
*   **Resources**: Gold, Mana, Max Mana.
*   **Combat State**: Lists of Enemies, Deck, Hand, and Discard pile.
*   **Tower**: Health and status.
*   **Meta**: Game running state and the main tick function.

**Technology Choices**:
*   **Zustand**: Lightweight state management with selector-based subscriptions to minimize re-renders.
*   **Immer Middleware**: Enables mutable-style updates (`draft.mana += 1`) while safely maintaining immutability.
*   **Action Delegation**: Store actions call engine functions from `src/engine/CombatSystem.ts` to maintain separation of concerns.

### 4.2 The Tick System
The `tick` function (implemented in `src/engine/CombatSystem.ts`) is the heart of the engine.
1.  **Mana Regen**: `mana += regenRate * dt`
2.  **Cooldowns**: Reduce cooldowns of cards/enemies.
3.  **Enemy Logic**: Move enemies, attack Tower if in range.
4.  **Auto-Play Logic**: Check if Wizard can play a card (AI Tier check).

## 5. Data Structures
### 5.1 Card Entity
Cards are the primary actors. They have:
*   **Identity**: Unique ID and Template ID (e.g., "fireball").
*   **Stats**: Cost, Name.
*   **Type**: Spell, Summon, or Enchantment.
*   **Effects**: A list of actions the card performs when played.

### 5.2 Enemy Entity
Enemies are the primary antagonists. Definitions live in `src/data/enemies.ts`. They have:
*   **Stats**: HP, Max HP, Speed, Attack Damage.
*   **Position**: A linear value from 0 (Tower) to 100 (Spawn).
*   **Combat**: Attack Speed and Next Attack timestamp.

## 6. Persistence
*   **Storage**: `localStorage` (initially).
*   **Save Frequency**: Auto-save on Floor completion and Shop exit.
*   **Format**: JSON serialization of the `GameState` (excluding transient UI state).
