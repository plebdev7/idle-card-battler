---
description: Self-correction and quality control for code changes
---

# Workflow: Review Code

Follow this workflow to critique and improve code before finalizing it.

1.  **Analyze Changes**
    *   Run `git diff` or view the modified files.
    *   Identify the scope of changes: Logic, UI, Configuration, or Refactoring.

2.  **Style & Consistency Check**
    *   **Guide Alignment**: Does the code follow `.agent/agent_guide.md`?
    *   **Standards Check**: Does the code adhere to `docs/coding_standards.md`?
    *   **Naming**: Are variable/function names descriptive and consistent?
    *   **Complexity**: Are functions too long? Is logic deeply nested?
    *   **Comments**: Are complex sections explained? Are there outdated comments?

3.  **Automated Quality**
---
description: Self-correction and quality control for code changes
---

# Workflow: Review Code

Follow this workflow to critique and improve code before finalizing it.

1.  **Analyze Changes**
    *   Run `git diff` or view the modified files.
    *   Identify the scope of changes: Logic, UI, Configuration, or Refactoring.

2.  **Style & Consistency Check**
    *   **Guide Alignment**: Does the code follow `.agent/agent_guide.md`?
    *   **Standards Check**: Does the code adhere to `docs/coding_standards.md`?
    *   **Naming**: Are variable/function names descriptive and consistent?
    *   **Complexity**: Are functions too long? Is logic deeply nested?
    *   **Comments**: Are complex sections explained? Are there outdated comments?

3.  **Automated Quality**
    *   Run the linter to fix standard issues.
        > Run `/lint_fix`

4.  **Safety & Robustness**
    *   **Error Handling**: Are errors caught and handled gracefully?
    *   **Edge Cases**: What happens with null/undefined inputs?
    *   **Security**: Are there any obvious vulnerabilities (e.g., injection, exposed secrets)?

5.  **Maintainability & Extensibility**
    *   **Hardcoded Data**: Are magic numbers/strings that should be data-driven?
    *   **Separation of Concerns**: Is state management separate from logic? Is logic separate from UI?
    *   **File Organization**: Are files in appropriate directories? Is the structure intuitive?
    *   **Extensibility**: Can we add new features without major refactoring?

6.  **Action Plan**:
    *   If issues are found, fix them immediately.
    *   If major refactoring is needed, update `task.md` (use absolute path from system instructions) and discuss with the user.
