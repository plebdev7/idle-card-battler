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
    *   [001_run_and_enemies.md](specs/001_run_and_enemies.md)
*   **Session 2.2.1: Core Engine**
    *   [x] Implement Game Loop Class (20 TPS)
    *   [x] Set up Zustand Store for Combat State
    *   [x] Implement Tick Accumulator Logic
*   **Session 2.2.2: Entity System**
    *   [ ] Create Base Entity Class/Interface
    *   [ ] Implement Movement System (1D Lane Logic)
    *   [ ] Implement Spatial Tracking
*   **Session 2.2.3: Combat Logic**
    *   [ ] Implement Damage Pipeline (Mitigation, Application)
    *   [ ] Implement Projectile System
    *   [ ] Implement Collision/Range Checks
*   **Session 2.2.4: Wave Manager**
    *   [ ] Implement Spawning Logic
    *   [ ] Implement Wave Timers
    *   [ ] Implement Win/Loss Conditions
*   **Session 2.2.5: Basic UI (Greybox)**
    *   [ ] Create Debug View Component
    *   [ ] Create Lane Visualizer (DOM-based)

### Component 2.3: Future Prototype Features
*   **Session 2.3.1: Advanced Mechanics**
    *   [ ] **Targeting System**: Advanced heuristics (e.g., Frontmost, Lowest HP).
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
