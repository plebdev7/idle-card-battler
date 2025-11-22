---
description: Troubleshoot and fix a bug
---

# Workflow: Debug Issue

Follow this workflow when investigating a bug or unexpected behavior.

1.  **Reproduction**
    *   Can you reproduce it locally?
    *   Create a minimal reproduction case (e.g., a specific test case or a script).
    *   **Do not start fixing until you can reproduce the failure.**

2.  **Analysis**
    *   **Logs**: Read terminal output or browser console logs.
    *   **Trace**: Follow the execution flow in the code.
    *   **Hypothesis**: Formulate a theory on *why* it's failing.

3.  **Fix Implementation**
    *   Apply the fix based on your hypothesis.
    *   Run the reproduction case again.
    *   *If it still fails*: Revert and form a new hypothesis.
    *   *If it passes*: Proceed.

4.  **Verification**
    *   Run the full test suite to ensure no regressions.
        > Run `/verify`

5.  **Cleanup**
    *   Remove any temporary logging or debug code.
    *   Commit the fix with the reproduction test case (if appropriate) to prevent regression.
