---
description: Clean up build artifacts and dependencies
---

1. Remove Node Modules and Dist
// turbo
```bash
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path dist) { Remove-Item -Recurse -Force dist }
if (Test-Path .turbo) { Remove-Item -Recurse -Force .turbo }
```

2. Reinstall Dependencies
// turbo
```bash
npm install
```
