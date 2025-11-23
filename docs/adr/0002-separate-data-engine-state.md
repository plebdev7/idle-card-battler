# 2. Separate Data, Engine Logic, and State Management

Date: 2025-11-22

## Status

Accepted

## Context

The initial implementation had several architectural issues that threatened maintainability and extensibility:

1. **Monolithic Store**: The game store mixed state definitions, game logic, and actions in a single file, making it difficult to test and reason about.
2. **Hardcoded Data**: Card definitions and enemy stats were embedded directly in components and stores, making it hard to add new content.
3. **Scattered Logic**: Game loop and combat logic were split across multiple locations (`src/gameLoop.ts`, `src/features/combat/`, `src/store.ts`), creating tight coupling and unclear ownership.
4. **Multiple Stores**: Separate `useGameStore` and `useCombatStore` created synchronization challenges and unclear data flow.

As the game grows to include more cards, enemies, mechanics, and systems, these issues would compound and slow development.

## Decision

We will restructure the codebase into three clear layers with distinct responsibilities:

### 1. Data Layer (`src/data/`)
- **Purpose**: Static game content definitions (cards, enemies, etc.)
- **Files**: 
  - `cards.ts` - Card definitions (`INITIAL_DECK`)
  - `enemies.ts` - Enemy stats and factory functions (`createEnemy`)
- **Rules**: No logic, pure data structures

### 2. Engine Layer (`src/engine/`)
- **Purpose**: Core game systems and logic (pure functions where possible)
- **Files**:
  - `GameLoop.ts` - Fixed timestep game loop hook
  - `CombatSystem.ts` - Game tick processing, card drawing, card playing
  - `GameLoop.test.ts` - Unit tests for deterministic behavior
- **Rules**: No direct React dependencies (except hooks), testable pure functions

### 3. State Layer (`src/state/`)
- **Purpose**: Global state management with Zustand
- **Files**:
  - `store.ts` - Unified game store using `immer` middleware
- **Rules**: Actions delegate to engine functions, state updates via immer

### Technology Choices
- **Zustand + Immer**: Enables mutable-style updates safely (improves readability)
- **Single Store**: Consolidates `useGameStore` and `useCombatStore` into one source of truth
- **JSDoc**: All exported functions documented for better DX

## Consequences

### Positive
- **Maintainability**: Clear separation makes it easy to locate and modify code
- **Extensibility**: Adding new cards/enemies is now a data-only change
- **Testability**: Pure functions in engine layer are trivial to unit test
- **Readability**: Immer allows natural mutation syntax without sacrificing immutability
- **Performance**: Single store reduces re-render complexity and subscription overhead
- **Onboarding**: New developers can understand the system quickly via JSDoc and clear structure

### Negative
- **Initial Overhead**: More files and directories to navigate (mitigated by clear naming)
- **Learning Curve**: Developers must understand immer's draft concept
- **Indirection**: Actions in store delegate to engine functions (one extra hop)

### Migration Impact
- **Deleted**: 
  - `src/gameLoop.ts`, `src/gameLoop.test.ts`
  - `src/store.ts`
  - `src/features/combat/hooks/useGameLoop.ts`
  - `src/features/combat/state/combatStore.ts`
- **Net Change**: -612 lines deleted, +141 lines added (overall simplification)

## Notes

- All linting passes (`npx biome check .`)
- Comprehensive test coverage maintained (142 lines of game loop tests)
- Future work: Migrate card effects from TODO to data-driven system
- Future improvement: Replace `Math.random()` IDs with `crypto.randomUUID()`
