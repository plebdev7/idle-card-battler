# Project Coding Standards

## 1. Philosophy
We prioritize **readability**, **type safety**, and **maintainability** over cleverness. Code should be self-documenting where possible, but complex logic deserves explanation.

## 2. File Structure
*   **`src/components/`**: Reusable UI components (buttons, cards, layout).
*   **`src/features/`**: Feature-specific logic and components (e.g., `features/combat/`, `features/deck/`).
*   **`src/lib/`**: Utilities, helpers, and shared constants.
*   **`src/store/`**: Global state definitions (Zustand stores).

## 3. Coding Conventions
### React Components
*   Use **Functional Components** with Hooks.
*   Name components in PascalCase (e.g., `CardView.tsx`).
*   Props interfaces should be named `[ComponentName]Props`.

### TypeScript
*   **Strict Mode**: Always on.
*   **No `any`**: Use `unknown` if strictly necessary, but prefer defined types.
*   **Interfaces vs Types**: Prefer `interface` for object definitions (better error messages), `type` for unions/primitives.

### Styling
*   **Vanilla CSS**: Use standard CSS files or CSS Modules.
*   **Variables**: Use CSS variables for theme colors and spacing.

### State Management (Zustand)
*   Keep stores small and focused.
*   Use selectors to prevent unnecessary re-renders.
*   Place actions inside the store definition.
