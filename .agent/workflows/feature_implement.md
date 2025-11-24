---
description: Turn a spec or task into working code
---

# Workflow: Implement Feature

Follow this workflow when you are ready to write code for a specific task or feature.

1.  **Preparation & Context**
    *   Read `task.md` (use absolute path from system instructions `<task_artifact>`) to identify the current objective.
    *   Read `.agent/project_context.md` and `.agent/agent_guide.md` to ensure alignment.
    *   Read `docs/coding_standards.md` to ensure code style compliance.
    *   Read any relevant design specs in `docs/specs/`.

2.  **Implementation Planning**
    *   **Create/Update Plan**: Open `implementation_plan.md` (use absolute path from system instructions `<implementation_plan_artifact>`).
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

5.  **Quality Gate** (Pre-Commit)
    *   **Before finalizing**, review your code for these red flags:
        *   **Hardcoded Values**: Are there magic numbers or strings that should be constants or data?
        *   **Monolithic Files**: Are any files >300 lines or doing too much?
        *   **Logic in UI**: Is business logic leaking into React components?
        *   **Tight Coupling**: Does changing one thing require changing many files?
    *   If any red flags are found, refactor immediately.

6.  **Documentation & Cleanup**
    *   **Update Artifacts**: Mark items as done in `task.md` (use absolute path from system instructions).
    *   **Walkthrough**: Update `walkthrough.md` (use absolute path from system instructions `<walkthrough_artifact>`) with proof of work (screenshots/logs).
    *   **Reflect**: Does the implementation match the plan? If not, explain why in the walkthrough.
