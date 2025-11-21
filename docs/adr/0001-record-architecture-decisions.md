# 1. Record Architecture Decisions

Date: 2025-11-21

## Status

Accepted

## Context

We need to establish a technical foundation for the "Idle Card Battler" project. The game is a 2D, UI-heavy strategy game that runs in the browser.

## Decision

We will use the following stack:
*   **Framework**: React + TypeScript (via Vite).
*   **Testing**: Vitest (for unit/logic tests).
*   **Linting/Formatting**: Biome.

## Consequences

*   **Pros**: Fast development cycle, strong ecosystem, type safety, fast testing.
*   **Cons**: Not a full game engine (no physics, particle systems out of the box), but sufficient for a card game.
