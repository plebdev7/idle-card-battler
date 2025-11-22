# Agent Operational Guide

> **Rule #1**: Do NOT pollute the repository with agent artifacts.

## 1. Artifact Management
*   **Brain Storage**: You must strictly use your internal "brain" directory for the following files:
    *   `task.md`
    *   `implementation_plan.md`
    *   `walkthrough.md`
*   **Repository Policy**: NEVER create these files in the root of the repository or in `.agent/`. If you see them there, delete them (after backing up content if needed).

## 2. Documentation Structure
We separate "Product Knowledge" from "Operational Knowledge".

### `docs/` (Product Source of Truth)
*   **Purpose**: Describes *what* we are building.
*   **Key Files**:
    *   `design_doc.md`: The game design, mechanics, and theme.
    *   `tech_architecture.md`: System design and stack decisions.
    *   `roadmap.md`: High-level phases and progress.
    *   `specs/`: Detailed Game Design Specifications (e.g., `001_run_and_enemies.md`).
    *   `adr/`: Technical Architecture Decision Records.
*   **Action**: Update these when you change features or complete milestones.

### `.agent/` (Operational Source of Truth)
*   **Purpose**: Describes *how* we work.
*   **Key Files**:
    *   `project_context.md`: The central hub. Read this first.
    *   `conventions.md`: Coding standards and tech stack rules.
    *   `workflows/`: Reusable procedures for common tasks.

## 3. Workflows
*   Check `.agent/workflows/` for standardized procedures (e.g., deployment, verification).
*   If a user asks for a common task, check if a workflow exists first.
