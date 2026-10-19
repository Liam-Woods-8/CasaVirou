---
name: responsive-check
description: Tests a selected feature of the CasaVirou app across desktop, tablet, and mobile layouts and fixes responsive problems while preserving the intended desktop design. Use when the user invokes /responsive-check or asks to check a feature's responsiveness or its mobile or tablet layout.
disable-model-invocation: true
---

# Responsive Check

Test the selected feature across desktop, tablet, and mobile layouts. Check overflow, navigation, grids, typography, forms, images, buttons, spacing, and touch targets. Fix responsive problems without changing the intended desktop design unnecessarily.

## Checklist

```
Responsive Check Progress:
- [ ] 1. Identify the feature and its files
- [ ] 2. Test at each viewport
- [ ] 3. Report problems per viewport
- [ ] 4. Fix
- [ ] 5. Re-test
```

## 1. Identify the feature

- Use the feature the user named, or the open file or route. If it's unclear, ask.
- Read the components involved and note the Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`) they already use.

## 2. Test at each viewport

| Layout | Width × height |
|---|---|
| Mobile | 375 × 812 (also spot-check 320) |
| Tablet | 768 × 1024 |
| Desktop | 1280 × 800 (also spot-check 1440) |

If a dev server is running, use the browser to resize the viewport (`Emulation.setDeviceMetricsOverride`) and take a screenshot at each width. Clear the override when you're done. Without a browser, review the classes at each breakpoint manually.

At each layout, check:

- **Overflow:** no horizontal scroll, long words and URLs wrap, and nothing is clipped.
- **Navigation:** primary nav is reachable, menus open and close, and the header and footer are hidden on Task Focus Mode routes.
- **Grids:** column counts step down sensibly, and there are no orphaned single items or uneven gaps.
- **Typography:** headings scale down without awkward breaks, and body text stays readable (≥16px on mobile).
- **Forms:** inputs are full width on mobile, labels are visible, and the keyboard doesn't hide the actions.
- **Images:** correct aspect ratios, focal points preserved when cropped, and no stretching.
- **Buttons:** labels fit on one line, and primary actions stay visible.
- **Spacing:** padding shrinks proportionally, with no cramped or oversized gaps.
- **Touch targets:** at least 44 × 44px, with enough space between adjacent targets.

To catch overflow quickly, run this in the browser console:

```js
[...document.querySelectorAll('*')].filter(el => el.scrollWidth > document.documentElement.clientWidth)
```

## 3. Report

List the problems before editing, grouped by layout (Mobile, Tablet, Desktop). Give each one a location and a proposed fix.

## 4. Fix

- Work mobile-first: fix the base classes, then adjust at larger breakpoints.
- Keep the desktop result the same unless desktop itself has a problem. Put mobile and tablet fixes in the base or `sm:`/`md:` classes, not in shared `lg:`/`xl:` classes.
- Use Tailwind utilities only. Don't add dependencies or change behavior.

## 5. Re-test

- Re-check every layout after fixing, including desktop, to confirm nothing regressed.
- Run `npx tsc --noEmit`, and fix any errors.
- Summarize what was fixed at each layout and anything that remains.
