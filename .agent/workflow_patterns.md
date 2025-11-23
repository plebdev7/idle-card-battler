# Workflow Patterns – Quick Reference

> **Power user checklist** for standard development workflow sequences

---

## 📋 Standard Patterns

### 🆕 Pattern 1: New Feature (Full Cycle)
**When**: New component, system, or major feature

```
/feature_design → /feature_implement → /test_write → 
/code_lint → /project_verify → /code_review → /project_finalize
```

- [ ] Design architecture & API (`/feature_design`)
- [ ] Implement working code (`/feature_implement`)
- [ ] Write comprehensive tests (`/test_write`)
- [ ] Auto-fix style issues (`/code_lint`)
- [ ] Verify all quality gates (`/project_verify`)
- [ ] Self-review for standards (`/code_review`)
- [ ] Clean, verify, commit (`/project_finalize`)

---

### 🐛 Pattern 2: Bug Fix

**When**: Fixing specific bugs or issues

```
/debug_issue → /test_write → /code_lint → /project_verify → /project_finalize
```

- [ ] Debug and fix issue (`/debug_issue`)
- [ ] Add regression tests (`/test_write`)
- [ ] Auto-fix style (`/code_lint`)
- [ ] Verify no breakage (`/project_verify`)
- [ ] Clean and commit (`/project_finalize`)

---

### 🔧 Pattern 3: Refactoring

**When**: Structural changes without new features

```
/feature_design → /feature_implement → /test_coverage → 
/code_review → /project_verify → /project_finalize
```

- [ ] Design refactoring approach + ADR (`/feature_design`)
- [ ] Implement structural changes (`/feature_implement`)
- [ ] Verify test coverage adequate (`/test_coverage`)
- [ ] Review maintainability (`/code_review`)
- [ ] Verify quality gates (`/project_verify`)
- [ ] Clean and commit (`/project_finalize`)

---

### ✅ Pattern 4: Quick Quality Check

**When**: Health check or pre-session verification

```
/code_lint → /project_verify → /code_review
```

- [ ] Fix formatting (`/code_lint`)
- [ ] Ensure build + tests pass (`/project_verify`)
- [ ] Review recent changes (`/code_review`)

---

### 🧪 Pattern 5: Test Improvement

**When**: Improving coverage for existing code

```
/test_coverage → /test_write → /code_lint → /project_verify
```

- [ ] Identify coverage gaps (`/test_coverage`)
- [ ] Write missing tests (`/test_write`)
- [ ] Clean up test code (`/code_lint`)
- [ ] Verify all tests pass (`/project_verify`)

---

## 🔑 Workflow Reference

| Workflow | Purpose |
|----------|---------|
| `/feature_design` | Create specs, ADRs, plans |
| `/feature_implement` | Turn specs into code |
| `/debug_issue` | Troubleshoot and fix bugs |
| `/test_write` | Add comprehensive tests |
| `/test_coverage` | Analyze coverage gaps |
| `/code_lint` | Auto-fix formatting/linting |
| `/code_review` | Self-review for quality |
| `/project_verify` | Run all quality gates |
| `/project_clean` | Clean artifacts/deps |
| `/project_finalize` | Clean, verify, commit |

---

## ⚡ Common Sequences

**Session Start:**
```bash
/project_verify
```

**Before Commit:**
```bash
/code_lint → /project_verify → /code_review → /project_finalize
```

**Session End:**
```bash
/project_finalize
```

---

## 💡 Adaptation Guidelines

| Factor | Adaptation |
|--------|------------|
| **Small scope** | Skip `/feature_design` |
| **High risk** | Add extra review steps |
| **Pre-existing issues** | Start with `/debug_issue` |

**Key principle**: Maintain quality standards while being pragmatic.
