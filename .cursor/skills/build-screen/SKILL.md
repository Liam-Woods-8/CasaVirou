---
name: build-screen
description: Workflow for implementing a new application screen in the CasaVirou upcycling app. Use whenever implementing a new application screen, page, route, or view.
---

# Build Screen

Use it whenever implementing a new application screen.

## Checklist

```
Build Screen Progress:
- [ ] 1. Inspect before coding
- [ ] 2. Plan reuse
- [ ] 3. Implement desktop and mobile together
- [ ] 4. Add loading, empty, and error states
- [ ] 5. Run checks
- [ ] 6. Inspect for visual and functional issues
```

## 1. Inspect before coding

Before coding, inspect existing components, layout patterns, typography, spacing, routes, and data structures.

- **Components:** search for existing buttons, cards, headers, image blocks, tabs, and form fields.
- **Layout:** find the page shell, max widths, grid and column patterns, and breakpoints already in use.
- **Typography and spacing:** note the heading scale, font weights, and spacing values used on existing screens, and match them.
- **Routes:** find where routes are defined, and check whether the screen falls under Task Focus Mode (no header or footer).
- **Data:** find the relevant types and stores (Zustand/Context) and the data they already expose.

Confirm the screen fits the Gen 1 scope and navigation in `product-context.mdc`. If it doesn't, flag it before building.

## 2. Plan reuse

Reuse existing components where possible. Only create a new component if nothing existing fits. When you do, build it to the same conventions so it can be reused later. Extend an existing type or store before adding a parallel one.

Do not create unnecessary dependencies.

## 3. Implement desktop and mobile together

Implement desktop and mobile behavior together, not desktop first with mobile patched on later.

- Build mobile-first with Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).
- Decide how navigation, image layouts, and multi-column sections collapse on small screens.
- Keep tap targets at least 44px, and make sure nothing overflows horizontally.

## 4. States

Include loading, empty, and error states where relevant.

- **Loading:** a skeleton or placeholder that matches the final layout.
- **Empty:** an editorial message and a clear next action (for example, "Add your first material").
- **Error:** a plain-language message, with a retry option where it makes sense.

Keep these states within the monochrome editorial style, not generic SaaS illustrations.

## 5. Run checks

After implementation, run relevant checks:

- `npx tsc --noEmit` (or `npm run build`), and fix every error.
- Lint and tests, if the project has them configured.

## 6. Inspect

Inspect for obvious visual or functional issues. If a dev server is available, open the screen in the browser at mobile (~375px) and desktop (~1280px) widths and check:

- Layout, alignment, text overflow, and image cropping.
- Links, buttons, and route transitions.
- The loading, empty, and error states, where they can be triggered.
- No console errors.

Fix the issues you find, then summarize what was built, what was reused, and anything left unresolved.
