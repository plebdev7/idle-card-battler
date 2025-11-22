---
description: Finalize a unit of work (clean, verify, commit)
---

1. Verify Codebase
   Run the verification workflow to ensure everything is in order.
   > Run `/verify`

2. Clean Up
   Check for any temporary files that shouldn't be committed.
   - [ ] Remove temporary test files
   - [ ] Remove unused artifacts
   - [ ] Check `.gitignore` for any new patterns needed

3. Documentation Review
   Ensure all documentation is up to date.
   - [ ] **Product Docs**: Update `docs/` (Design, Roadmap) if features changed.
   - [ ] **Agent Docs**: Update `.agent/` (Conventions, Workflows) if processes changed.
   - [ ] **Brain Sync**: Update `task.md` and `walkthrough.md` (use absolute paths from system instructions).

4. Artifact Cleanup (CRITICAL)
   - [ ] **Check Repo**: Ensure `task.md`, `implementation_plan.md`, and `walkthrough.md` are NOT in the repo root or `.agent/`.
   - [ ] **Delete**: If found in the repo, DELETE them (they belong in brain only).

4. Version Control
   Stage and commit your changes.
   
   Review status:
   ```bash
   git status
   ```
   
   Stage files:
   ```bash
   git add .
   ```
   
   Commit (replace message):
   ```bash
   git commit -m "feat: [description of changes]"
   ```
   
   Push:
   ```bash
   git push
   ```
