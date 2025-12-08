---
description: Verify the project health (build, test, lint)
---

1. Install dependencies
// turbo
```bash
npm install
```

2. Run Linting
Run the linting workflow to check for issues.
> Run `/code_lint`
// turbo
```bash
npx biome check .
```

3. Run Tests
// turbo
```bash
npx vitest run
```

4. Build Project
// turbo
```bash
npm run build
```
