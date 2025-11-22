# Project Conventions

## Tech Stack
*   **Framework**: React + TypeScript (Vite)
*   **State Management**: Zustand (Planned)
*   **Styling**: Vanilla CSS (Modules or Global)
*   **Testing**: Vitest

## Agent Workflow
> **Moved**: See [agent_guide.md](file:///c:/devel/checkout/idle-card-battler-1/.agent/agent_guide.md) for operational workflows and artifact policies.

## Coding Standards
*   **Functional Components**: Use React functional components with hooks.
*   **Strict Types**: Avoid `any`. Define interfaces for all props and state.
*   **File Structure**:
    *   `src/components/`: Reusable UI components.
    *   `src/features/`: Feature-specific logic and components.
    *   `src/lib/`: Utilities and helpers.
