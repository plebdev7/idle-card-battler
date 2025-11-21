---
description: How to design a new feature or system
---

# Workflow: Design New Feature

Follow this workflow when the user asks to "design" or "spec out" a specific part of the game (e.g., "Design the Battle System", "Create the Card Attributes").

1.  **Context Review**:
    *   Read `design_doc.md` to understand the high-level goals.
    *   Read `.agent/project_context.md` to align with Design Pillars.

2.  **Requirement Gathering**:
    *   Ask the user clarifying questions if the scope is vague.
    *   *Example*: "For the Battle System, do we need to handle status effects yet?"

3.  **Drafting the Spec**:
    *   Create a new markdown file in `specs/` (e.g., `specs/battle_logic.md`).
    *   Include:
        *   **Overview**: What is this feature?
        *   **Data Structures**: JSON-like representation of the objects (Cards, Units).
        *   **Logic/Flow**: Pseudocode or step-by-step algorithms.
        *   **Edge Cases**: What happens if X and Y happen at the same time?

4.  **Review & Iterate**:
    *   Use `notify_user` to present the spec.
    *   Iterate based on feedback.

5.  **Finalize**:
    *   Link the new spec in `design_doc.md` (if applicable).
    *   Update `task.md` to mark the design task as complete and add Implementation tasks.
