---
name: verify-feature
description: Verifies a newly implemented feature in the CasaVirou app by tracing its full user flow, running tests and checks, inspecting routes, state transitions, and persistence, and fixing clear bugs before the feature is declared finished. Use after a feature has been implemented, before reporting it complete, or when the user invokes /verify-feature.
---

# Verify Feature

After a feature has been implemented, trace its complete user flow, run relevant tests and checks, inspect the implementation for broken routes or state transitions, verify persistence where required, and report anything incomplete. Fix clear implementation bugs before declaring the feature finished.

## Checklist

```
Verify Feature Progress:
- [ ] 1. Define the flow
- [ ] 2. Run tests and checks
- [ ] 3. Inspect routes and state transitions
- [ ] 4. Verify persistence
- [ ] 5. Trace the flow in the browser
- [ ] 6. Fix clear bugs, then re-verify
- [ ] 7. Report
```

## 1. Define the flow

Write out the feature's complete user flow: entry point, each step, and end state. Place it in the core loop (Materials → Discovery → Project → Tutorial → Complete → Share → Explore) and include the step before it and the step after it.

## 2. Run tests and checks

- `npx tsc --noEmit` (or `npm run build`)
- Lint and tests, if the project has them configured (check the `package.json` scripts)

Every run must pass. Fix any failures that come from the feature.

## 3. Inspect routes and state transitions

- **Routes:** every link, `navigate()` call, and redirect points to a route that exists, and route params (`:id`) are read and validated. Unknown IDs show a not-found state instead of crashing. Task Focus Mode routes hide the header and footer.
- **State transitions:** every status change is reachable and reversible where it should be (for example Saved → In Progress → Completed). Check that there are no dead ends, double submissions, or stale UI after an update.
- **Edge cases:** empty data, missing materials, the first-time user, and refreshing the page mid-flow.
- **Matching:** results stay deterministic, and missing requirements are validated before match scores are calculated.

## 4. Verify persistence

Where required, confirm that state survives a page reload: localStorage keys are written, read back correctly, and handle missing or malformed data without errors. Check this in the browser (reload, then confirm) or through the store code.

## 5. Trace the flow in the browser

If a dev server is available, walk through the flow at desktop and mobile widths. Watch for console errors, broken navigation, and incorrect back-button behavior.

## 6. Fix clear bugs

- Fix clear implementation bugs, meaning cases where the code doesn't do what the feature is meant to do.
- Don't redesign the feature, expand its scope, or refactor unrelated code.
- After fixing, re-run steps 2–5 for the affected parts.

## 7. Report

```markdown
## Verification: [feature]
**Status:** Finished | Incomplete

**Flow traced:** [entry] → ... → [end state]
**Checks:** type check ✓, lint ✓/n/a, tests ✓/n/a
**Fixed:** [bug and fix, one per line]
**Incomplete / open:** [anything missing, unverified, or needing a decision]
```

Only declare the feature finished when the checks pass and nothing that blocks it remains open.
