---
description: Turn a spec or task into working code
---

# Workflow: Implement Feature

Follow this workflow when you are ready to write code for a specific task or feature.

1.  **Preparation & Context**
    *   Read `task.md` to identify the current objective.
    *   Read `.agent/project_context.md` and `.agent/agent_guide.md` to ensure alignment.
    *   Read any relevant design specs in `docs/specs/`.

2.  **Implementation Planning**
    *   **Create/Update Plan**: Open `implementation_plan.md`.
    *   **Define Changes**: List files to modify, new files to create, and dependencies to add.
    *   **Risk Assessment**: Identify potential breaking changes or side effects.
    *   **User Review**: Use `notify_user` to get approval on the plan *before* writing code.

3.  **Execution (Iterative)**
    *   **Test First (Recommended)**: Write a failing test for the new functionality (if applicable).
    *   **Implement**: Write the code to satisfy the requirements.
    *   **Refactor**: Clean up the code while keeping tests green.

4.  **Verification**
    *   **Automated Checks**: Run the verify workflow.
        > Run `/verify`
    *   **Manual Verification**: Verify the feature in the browser or via command line.

5.  **Documentation & Cleanup**
    *   **Update Artifacts**: Mark items as done in `task.md`.
    *   **Walkthrough**: Update `walkthrough.md` with proof of work (screenshots/logs).
    *   **Reflect**: Does the implementation match the plan? If not, explain why in the walkthrough.
