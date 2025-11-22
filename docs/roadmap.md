# Project Roadmap: Idle Card Battler

## Phase 1: Design & Architecture (Complete)
*   **Goal**: Define *what* we are building and *how* it works before writing code.
*   **Deliverables**:
    *   [x] High-Level Design Doc (`design_doc.md`)
    *   [x] Low-Level Specs (Battle Logic, Card Attributes, UI Flow)
    *   [x] Technical Architecture Plan (Data Structures, State Management)

## Phase 2: Prototyping (The "Greybox") (In Progress)
*   **Goal**: Prove the "Fun" of the Core Loop. Ugly graphics, real logic.
*   **Deliverables**:
    *   [x] Basic UI Skeleton (`GameDebugView`).
    *   [x] **The Idle Deck Cycle**:
        *   [x] **Draw Logic**: Draw 1 card every X seconds (or on trigger).
        *   [x] **Mana System**: Regen over time, card costs.
        *   [x] **Reshuffle**: Discard pile -> Draw pile when empty.
        *   [x] **Hand Management**: Max hand size limits.
    *   [ ] **Combat Loop**:
        *   [ ] **Enemy Spawning**: Waves/Timer based spawning.
        *   [ ] **Enemy Movement**: Progression from Spawn -> Tower.
        *   [ ] **Damage**: Card effects -> Enemy HP; Enemy Attack -> Tower HP.
        *   [ ] **Win/Loss**: Run ends when Tower HP = 0.
    *   [ ] **Basic AI (The "Wizard")**:
        *   [ ] **Tier 1 Logic**: Play playable cards on cooldown (Random or First Available).
        *   [ ] **Targeting**: Simple heuristic (e.g., Frontmost enemy).

## Phase 3: The Vertical Slice
*   **Goal**: One fully polished "Floor" of gameplay.
*   **Deliverables**:
    *   Real UI/UX implementation (Dark Fantasy theme).
    *   Card Art (Placeholders or GenAI).
    *   Save/Load System (Persistence).
    *   First playable build for User Testing.

## Phase 4: Content Production
*   **Goal**: Scale from 10 cards to 100.
*   **Deliverables**:
    *   Card Database expansion.
    *   Enemy variety.
    *   Talent Trees & Progression implementation.

## Phase 5: Polish & Release
*   **Goal**: Bug fixing, balancing, and shipping.
