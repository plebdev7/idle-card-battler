# Agent Operational Guide

> **Rule #1**: Do NOT pollute the repository with agent artifacts.

## 1. Artifact Management
*   **Brain Storage**: You must strictly use your internal "brain" directory for the following files.
    *   **How to find the path**: Look at your system instructions (the `<task_artifact>`, `<implementation_plan_artifact>`, and `<walkthrough_artifact>` tags). Use the absolute paths defined there.
    *   **Files**:
        *   `task.md`
        *   `implementation_plan.md`
        *   `walkthrough.md`
*   **Repository Policy**: NEVER create these files in the root of the repository or in `.agent/`. If you see them there, delete them (after backing up content if needed).

## 2. Documentation Structure
We separate "Product Knowledge" from "Operational Knowledge".

### `docs/` (Product Source of Truth)
*   **Purpose**: Describes *what* we are building. This is the "Product" knowledge base.
*   **Key Files**:
    *   `design_doc.md`: The game design, mechanics, and theme.
    *   `tech_architecture.md`: System design and stack decisions.
    *   `coding_standards.md`: Coding style, file structure, and best practices.
    *   `specs/`: Detailed Game Design Specifications.
    *   `adr/`: Technical Architecture Decision Records.
*   **Action**: Update these when you change features, complete milestones, or agree on new standards.

### `.agent/` (Operational Source of Truth)
*   **Purpose**: Describes *how* the agent works. This is the "Process" knowledge base.
*   **Key Files**:
    *   `project_context.md`: The central hub for the agent's understanding of the current state.
    *   `workflows/`: Reusable procedures for common tasks.

## 3. Workflows
*   Check `.agent/workflows/` for standardized procedures (e.g., deployment, verification).
*   If a user asks for a common task, check if a workflow exists first.
