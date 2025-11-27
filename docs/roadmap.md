# Project Roadmap: Idle Card Battler

## Phase 1: Design & Architecture (Complete)
*   **Goal**: Define *what* we are building and *how* it works before writing code.
*   **Deliverables**:
    *   [x] High-Level Design Doc (`design_doc.md`)
    *   [x] Low-Level Specs (Battle Logic, Card Attributes, UI Flow)
    *   [x] Technical Architecture Plan (Data Structures, State Management)
    *   [x] [ADR 0001: Record Architecture Decisions](adr/0001-record-architecture-decisions.md)

## Phase 2: Prototyping (The "Greybox") (In Progress)
*   **Goal**: Prove the "Fun" of the Core Loop. Ugly graphics, real logic.
*   **Structure**: Phase > Component > Session.

### Component 2.1: The Idle Deck Cycle (Complete)
*   **Specs**:
    *   [002_idle_deck_cycle.md](specs/002_idle_deck_cycle.md)
    *   [cards_basic_set.md](specs/cards_basic_set.md)
*   **Session 2.1.1: Core Mechanics**
    *   [x] **Draw Logic**: Draw 1 card every X seconds (or on trigger).
    *   [x] **Mana System**: Regen over time, card costs.
    *   [x] **Reshuffle**: Discard pile -> Draw pile when empty.
    *   [x] **Hand Management**: Max hand size limits.
    *   [x] **Basic AI (Tier 1)**: Play playable cards on cooldown (Random or First Available).

### Component 2.2: The Combat Loop (In Progress)
*   **Specs**:
    *   [003_combat_loop.md](specs/003_combat_loop.md)
    *   [004_entity_system.md](specs/004_entity_system.md)
    *   [005_combat_logic.md](specs/005_combat_logic.md)
    *   [001_run_and_enemies.md](specs/001_run_and_enemies.md)
*   **ADRs**:
    *   [0002-separate-data-engine-state.md](adr/0002-separate-data-engine-state.md)
*   **Session 2.2.1: Core Engine**
    *   [x] Implement Game Loop Class (20 TPS)
    *   [x] Set up Zustand Store for Combat State
    *   [x] Implement Tick Accumulator Logic
*   **Session 2.2.2: Architectural Refactor**
    *   [x] Extract hardcoded data to `src/data/` (cards, enemies)
    *   [x] Create `src/engine/` layer (GameLoop, CombatSystem)
    *   [x] Consolidate stores into unified `src/state/store.ts` with Immer
    *   [x] Update all components and tests to use new structure
*   **Session 2.2.3: Entity System**
    *   [x] Create Base Entity Class/Interface
    *   [x] Implement Movement System (1D Lane Logic)
    *   [x] Implement Spatial Tracking
*   **Session 2.2.4: Combat Logic**
    *   [x] Implement Damage Pipeline (Mitigation, Application)
    *   [x] Implement Projectile System
    *   [x] Implement Collision/Range Checks
    *   [x] Implement Basic Status Effects (Slow, Stun, Poison, Burn, Regen)
*   **Session 2.2.5: Wave Manager**
    *   [x] Implement Spawning Logic
    *   [x] Implement Wave Timers
    *   [x] Implement Win/Loss Conditions
*   **Session 2.2.6: Basic UI (Greybox)**
    *   [x] Create Debug View Component
    *   [x] Create Lane Visualizer (DOM-based)
    *   [x] Create Combat Screen with Mana, Hand, Draw/Discard piles
*   **Session 2.2.7: Restore Component 2.1 Features**
    *   [ ] **Card Set Implementation**: Implement full 10-card starter deck from [cards_basic_set.md](specs/cards_basic_set.md)
        *   [ ] Critical Change: We need at least one card that can generate essence. 
        *   [ ] Update Card type to support healing, buffs, summons, status effects
        *   [ ] Implement remaining 7 cards (Minor Heal, Frostbolt, Arcane Shield, Skeleton, Mana Potion, Rage, Study)
        *   [ ] Add card effect execution logic (healing, buffs, debuffs, summons, card draw)
    *   [ ] **Card Playing Integration**: Restore automated card playing logic
        *   [ ] Ensure Basic AI triggers `playCard` action from store
        *   [ ] Add visual feedback for cards being played automatically
*   **Session 2.2.8: Code Quality & Refactoring**
    *   [ ] **Wave Manager Refactoring** (from 2025-11-25 Code Review):
        *   [ ] Refactor `EntityFactory.ts` to data-driven approach - create `src/data/enemies.ts` with stat definitions (currently uses hardcoded if-else chain)
        *   [ ] Extract magic numbers to constants in `WaveManager.ts` (`WAVE_CLEARING_DELAY`, `SPAWN_STAGGER_DELAY`)
        *   [ ] Add error handling to `getWaveConfig()` - validate wave/floor inputs and handle missing configs gracefully
        *   [ ] Consider using `crypto.randomUUID()` or `nanoid` for entity IDs (currently uses `Date.now() + Math.random()`)
    *   [ ] **EntitySystem Refactoring**:
        *   [ ] Extract shared `performAttack()` function to reduce duplication in EntitySystem
        *   [ ] Extract magic numbers to constants (`SPAWN_POSITION`, `LANE_MIN`, `LANE_MAX`, etc.)
        *   [ ] Address remaining TODOs in EntitySystem (stun duration, position clamping)
    *   [ ] Address any other TODOs in the codebase

### Component 2.3: Future Prototype Features
*   **Session 2.3.1: Advanced Mechanics**
    *   [ ] **Targeting System**: Advanced heuristics (e.g., Frontmost, Lowest HP).
    *   [ ] **Advanced Status Effects**: Complex effects (Shield, Regeneration, Invulnerable), stacking rules, combos, cleansing.
    *   [ ] **Card Effects Engine**: Support for complex card behaviors beyond simple damage.

## Phase 3: The Vertical Slice
*   **Goal**: One fully polished "Floor" of gameplay.
*   **Deliverables**:
    *   [ ] Real UI/UX implementation (Dark Fantasy theme).
    *   [ ] Card Art (Placeholders or GenAI).
    *   [ ] Save/Load System (Persistence).
    *   [ ] First playable build for User Testing.

## Phase 4: Content Production
*   **Goal**: Scale from 10 cards to 100.
*   **Deliverables**:
    *   [ ] Card Database expansion.
    *   [ ] Enemy variety.
    *   [ ] Talent Trees & Progression implementation.

## Phase 5: Polish & Release
*   **Goal**: Bug fixing, balancing, and shipping.
