---
description: Systematically add tests to a component
---

# Workflow: Write Tests

Follow this workflow to ensure robust test coverage for a component.

1.  **Analyze Component**
    *   Read the source code of the component.
    *   Identify public methods and props.
    *   List potential states (loading, error, success, empty).

2.  **Identify Scenarios**
    *   **Happy Path**: Does it work when inputs are correct?
    *   **Edge Cases**: Null inputs, boundary values, network failures.
    *   **User Interactions**: Clicks, form submissions (for UI).

3.  **Scaffold Test File**
    *   Create `[filename].test.ts` or `[filename].test.tsx` next to the source file.
    *   Import necessary testing utilities (e.g., `vitest`, `testing-library`).

4.  **Implement Tests**
    *   Write one test at a time.
    *   Run tests to verify failure (red) then success (green).
    *   > Run `/test_coverage` to check progress.

5.  **Refactor**
    *   Clean up test code (DRY).
    *   Ensure test descriptions are readable sentences.
