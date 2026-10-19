---
name: simplify-code
description: Reviews recently changed code in the CasaVirou app for duplication, unnecessary abstractions, oversized components, dead code, inconsistent naming, unnecessary dependencies, and overengineering, then simplifies it while preserving behavior. Use when the user invokes /simplify-code or asks to simplify, clean up, or reduce complexity in recent changes.
disable-model-invocation: true
---

# Simplify Code

Review recently changed code for duplication, unnecessary abstractions, oversized components, dead code, inconsistent naming, unnecessary dependencies, and overengineering. Simplify only where doing so preserves behavior. Do not rewrite functioning architecture just for stylistic reasons.

## Checklist

```
Simplify Code Progress:
- [ ] 1. Find the recently changed code
- [ ] 2. Review against each criterion
- [ ] 3. Report findings
- [ ] 4. Simplify
- [ ] 5. Verify behavior is unchanged
```

## 1. Find the recently changed code

- If this is a git repo, run `git status` and `git diff` (plus `git diff --staged`, or `git diff main...HEAD` for a branch).
- Otherwise, use the files changed earlier in this conversation or the files the user names.
- Keep the review to those files. Only read other files to understand context or to find existing helpers.

## 2. Review criteria

| Criterion | Look for |
|---|---|
| Duplication | Repeated JSX, class strings, or logic that an existing component or helper already covers |
| Unnecessary abstractions | Wrappers, hooks, factories, or generics with a single caller and no clear benefit |
| Oversized components | Components that mix several concerns or run to roughly 200+ lines; extract only coherent pieces |
| Dead code | Unused imports, variables, props, types, exports, commented-out blocks, unreachable branches |
| Inconsistent naming | Names that differ from existing conventions for the same concept (for example `material` vs `item`) |
| Unnecessary dependencies | New packages that a few lines of code or an existing utility could replace |
| Overengineering | Config options, flexibility, or state added for hypothetical future needs |

## 3. Report findings

List the findings before editing. Give each one a file, a short description, the proposed simplification, and a risk level (safe or needs care).

## 4. Simplify

- Only make changes that preserve behavior: same rendered output, routes, state, persisted data shape, and matching results.
- Prefer deleting and reusing code over adding new abstractions.
- Rename only to match an existing convention, and update every reference.
- Remove a dependency only when nothing else uses it, and update `package.json` and the lockfile.
- Leave working architecture alone even if you'd structure it differently. Note it in the report instead.
- Skip anything whose behavior you can't confidently preserve, and list it as a suggestion.

## 5. Verify

- Run `npx tsc --noEmit` (or `npm run build`), plus lint and tests if the project has them. All of them must pass.
- Spot-check the affected screens or flows in the browser if a dev server is available.
- Summarize what was simplified, the net lines removed, and the suggestions you left untouched.
