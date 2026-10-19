---
name: ui-review
description: Reviews the current page of the CasaVirou app for visual hierarchy, typography, spacing, grid, responsiveness, accessibility, and fit with the minimal editorial fashion design, then fixes the important problems. Use when the user invokes /ui-review or asks for a UI or design review of a page.
disable-model-invocation: true
---

# UI Review

When invoked, review the current page for visual hierarchy, typography, spacing, grid consistency, responsiveness, excessive UI, generic SaaS styling, accessibility, and consistency with the project's minimal editorial fashion-oriented design. Identify problems first, then fix the important ones without redesigning working functionality.

## Checklist

```
UI Review Progress:
- [ ] 1. Identify the page and gather context
- [ ] 2. Review against each criterion
- [ ] 3. Report problems, ranked
- [ ] 4. Fix the important ones
- [ ] 5. Verify
```

## 1. Identify the page and gather context

- Use the open file, route, or browser tab as "the current page". If it's unclear, ask.
- Read the page component and the shared components it uses.
- Compare it against 1–2 sibling screens to judge consistency.
- If a dev server is running, view the page at ~375px and ~1280px widths and take screenshots.

## 2. Review criteria

| Criterion | Look for |
|---|---|
| Visual hierarchy | One clear focal point, primary action obvious, images leading |
| Typography | Strong, consistent heading scale; limited sizes and weights; readable line length |
| Spacing | Consistent spacing scale, generous whitespace, no cramped groups |
| Grid consistency | Aligned edges, consistent columns, gutters, and max widths |
| Responsiveness | No horizontal overflow, sensible stacking, images crop well, tap targets ≥44px |
| Excessive UI | Redundant buttons, badges, dividers, icons, or copy that could be removed |
| Generic SaaS styling | Gradients, stat-card grids, heavy shadows, pill clutter, bright brand colors |
| Accessibility | Contrast, alt text, semantic headings, labels, focus states, keyboard access |
| Design consistency | Mainly monochrome, editorial, fashion-oriented; color only for status accents |

## 3. Report problems first

List the problems before editing anything, ranked:

```markdown
### High
- [Criterion] Problem, with location (file / element). Proposed fix.

### Medium
- ...

### Low
- ...
```

## 4. Fix the important ones

- Fix the High items, and Medium items where the fix is small and safe.
- Only change styling, markup structure, and copy. Don't change behavior, routes, state, data, or matching logic.
- Reuse existing components and Tailwind patterns. Add no dependencies.
- Leave Low items in the report and don't fix them.

## 5. Verify

- Run `npx tsc --noEmit`, and fix any errors.
- If possible, recheck the page at mobile and desktop widths, and confirm nothing that worked before has broken.
- Summarize what was fixed and which items remain open.
