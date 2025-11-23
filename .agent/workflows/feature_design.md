---
description: How to design a new feature or system
---

# Workflow: Design New Feature

Follow this workflow when the user asks to "design" or "spec out" a specific part of the game (e.g., "Design the Battle System", "Create the Card Attributes").

1.  **Context Review**:
    *   Read `design_doc.md` to understand the high-level goals.
    *   Read `.agent/project_context.md` to align with Design Pillars.
    *   Read `.agent/agent_guide.md` for operational rules.

2.  **Task Initialization**:
    *   **Update `task.md`**: Break down the design process into steps (e.g., "Research", "Draft Spec", "Review"). **IMPORTANT**: Use the absolute path for `task.md` found in your system instructions (under `<task_artifact>`).
    *   **Create `implementation_plan.md`**: Briefly outline the scope of the design work. **IMPORTANT**: Use the absolute path for `implementation_plan.md` found in your system instructions (under `<implementation_plan_artifact>`).
        *   *Goal*: Define what questions this spec needs to answer.
        *   *Proposed Changes*: List the new spec file to be created (e.g., `docs/specs/002_...md`).

3.  **Requirement Gathering**:
    *   Ask the user clarifying questions if the scope is vague.
    *   *Example*: "For the Battle System, do we need to handle status effects yet?"

4.  **Drafting the Spec**:
    *   Create a new markdown file in `docs/specs/` (e.g., `docs/specs/002_battle_logic.md`).
    *   Include:
        *   **Overview**: What is this feature?
        *   **Data Structures**: JSON-like representation of the objects (Cards, Units).
        *   **Logic/Flow**: Pseudocode or step-by-step algorithms.
        *   **Edge Cases**: What happens if X and Y happen at the same time?

5.  **Extensibility Check**:
    *   **CRITICAL**: Before finalizing, review your spec for extensibility:
        *   Are values hardcoded or data-driven? (Bad: "Cost is always 3", Good: "Each card has a cost property").
        *   Can we add new variants without changing core logic? (e.g., Can we add new card types easily?).
        *   Are we planning for future needs without over-engineering?
    *   If you find hardcoded values or tight coupling, revise the spec.

6.  **Review & Iterate**:
    *   Use `notify_user` to present the spec.
    *   Iterate based on feedback.

7.  **Finalize**:
    *   Link the new spec in `design_doc.md` (if applicable).
    *   Update `task.md` to mark the design task as complete and add Implementation tasks.
