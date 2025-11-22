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
   - [ ] Update `.agent/task.md` (mark completed items)
   - [ ] Update `walkthrough.md` (document new features/changes)
   - [ ] Update `implementation_plan.md` (if plans changed)
   - [ ] Update `docs/` (if architecture or design changed)

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
