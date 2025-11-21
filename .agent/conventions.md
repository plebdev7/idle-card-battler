# Project Conventions

## Tech Stack
*   **Framework**: React + TypeScript (Vite)
*   **State Management**: Zustand (Planned)
*   **Styling**: Vanilla CSS (Modules or Global)
*   **Testing**: Vitest

## Agent Workflow
1.  **Start**: Read `.agent/task.md` to find the next item.
2.  **Plan**: Create/Update `implementation_plan.md` for complex features.
3.  **Execute**: Write code.
4.  **Verify**:
    *   Run `npm test` for logic.
    *   Run `npm run lint` for style.
    *   Use **Browser Subagent** to verify UI.
5.  **End**: Update `.agent/task.md` with progress.

## Coding Standards
*   **Functional Components**: Use React functional components with hooks.
*   **Strict Types**: Avoid `any`. Define interfaces for all props and state.
*   **File Structure**:
    *   `src/components/`: Reusable UI components.
    *   `src/features/`: Feature-specific logic and components.
    *   `src/lib/`: Utilities and helpers.
