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

5.  **Action Plan**
    *   If issues are found, fix them immediately.
    *   If major refactoring is needed, update `task.md` and discuss with the user.
