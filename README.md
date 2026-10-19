# CasaVirou

A responsive clothing-upcycling web app that helps people answer one question: **"What can I make with what I already have?"**

Users log the clothing, materials, and tools they own, discover projects matched to that inventory by a deterministic rules-based engine, follow step-by-step tutorials, and share finished work so others can make their own.

**Core loop:** Add materials → Discover project → View requirements → Start → Tutorial → Complete → Share → Explore → Make this → Repeat

## Run it

Requires Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run typecheck` | TypeScript only |
| `npm test` | Matching engine tests (Vitest) |

### Demo accounts

| Username | Password | Wardrobe |
|---|---|---|
| `demo` | `stitch123` | 8 items; shows every discovery group, plus saved, in-progress, and completed projects |
| `alex` | `stitch123` | 2 items; good for testing MAKE THIS as "another user" |

You can also create a new account, which starts with an empty wardrobe.

**Reset all data:** everything is stored in the browser under the localStorage key `stitch-v1`. Clear it from DevTools (Application → Local Storage) or run `localStorage.removeItem('stitch-v1')` in the console, then reload.

## Tech stack

- React 19 + TypeScript, built with Vite
- Tailwind CSS 4 for styling, with Lucide icons
- React Router for routing
- Zustand with localStorage persistence (no backend)
- Vitest for tests

Authentication is a local prototype: accounts live in localStorage with SHA-256-hashed passwords. It's fine for a demo, but it isn't real security, and a production version would need a server.

Uploaded photos are resized in the browser to about 900px JPEG before saving, so they fit within localStorage limits. If storage fills up, the app shows a warning banner.

## Project structure

```
src/
  types.ts              Data model (User, Item, Project, Requirement, UserProject, ExplorePost)
  data/
    options.ts          Item types, fabrics, conditions (drive both forms and matching)
    projects.ts         19 project templates: requirements + tutorial steps
    seed.ts             Demo users, wardrobe, user projects, Explore posts
  store/
    useStore.ts         Zustand store + all actions (auth, wardrobe, project lifecycle, sharing)
    selectors.ts        Hooks for derived data (current user, my items, matches)
  utils/
    matching.ts         Deterministic matching engine (+ matching.test.ts)
    discovery.ts        Discover filters and sorting over match results (+ discovery.test.ts)
    image.ts            Client-side photo compression
  components/           Layouts, cards, requirement lists, UI primitives
  pages/                One file per screen (or closely related screens)
public/                 Static assets
.cursor/                AI agent configuration
  rules/                product-context.mdc: product scope, matching engine, design system, conventions
  skills/               build-screen, ui-review, responsive-check, verify-feature, simplify-code
  agents/               verifier, ui-reviewer, debugger
```

## Matching

Each project lists requirements (materials and tools). An inventory item satisfies a requirement when its category, type, and fabric match the requirement's rules. For example, "Denim (jeans or scraps)" matches any item made of denim. Missing requirements are worked out first, then:

```
Material score = matched required materials / total required materials
Tool score     = matched required tools / total required tools
Match %        = (Material score × 0.60 + Tool score × 0.40) × 100
```

| Group | Match % |
|---|---|
| You Can Make Now | 100 |
| Almost Ready | 70–99 (always lists what's missing) |
| Possible | 40–69 |
| Low Match | under 40 |

Optional requirements are shown but never lower the score, and a missing item never blocks starting a project. The UI always shows the actual items ("You have 4/6 required items", "Missing: Thread") rather than just a percentage. Project details also show which wardrobe item satisfies each requirement.

### Discover

`/projects` groups results by the four match groups (the group strip doubles as a filter) and can sort by best match, easiest first, or shortest first. Filters combine with AND:

- **Material:** a fabric used by the project (garments imply their fabric, e.g. jeans → denim) or "Fabric scraps"
- **Project type:** Repair, Alteration, Reconstruction, Accessory (`Project.category`)
- **Difficulty** and **Time** bands
- **No special tools:** hides projects that require a sewing machine or iron (optional tools don't count)

Filtering and sorting live in `src/utils/discovery.ts` and only read `ProjectMatch` results; percentages are never recalculated in components.

## Routes

| Route | Screen |
|---|---|
| `/` | Landing (signed out) or Home dashboard |
| `/signup`, `/signin`, `/welcome` | Account |
| `/materials`, `/materials/:id` | Digital wardrobe, item details |
| `/materials/new`, `/materials/:id/edit` | Add / edit item (focus mode) |
| `/projects` | Discover (`?item=<id>` filters by a wardrobe item) |
| `/projects/mine/saved` · `in-progress` · `completed` | My Projects |
| `/projects/:id` | Project details |
| `/projects/:id/tutorial` · `complete` · `share` | Tutorial flow (focus mode) |
| `/explore`, `/explore/:postId` | Explore feed, post with MAKE THIS |
| `/profile`, `/profile/edit` | Profile |

Focus-mode routes hide the header, footer, and navigation.

## Images

Projects can have a `cover` and each tutorial step an `image`. Both are optional: anything without one shows its textile-pattern placeholder, which is also used if a file fails to load. User photos (wardrobe items, finished projects) always take priority over curated images.

Put files in `public/images/projects/<project-id>/` and reference them with `projectImage` from `src/data/images.ts`:

```ts
// single file
cover: projectImage('cutoff-shorts', 'cover.jpg', 'Frayed denim cut-offs laid flat on linen'),

// responsive: export cover-400.webp, cover-800.webp, cover-1200.webp
cover: projectImage('cutoff-shorts', 'cover', 'Frayed denim cut-offs laid flat on linen', { widths: IMAGE_WIDTHS }),

// on a step; add a credit for anything you didn't shoot yourself
image: projectImage('cutoff-shorts', 'step-01.jpg', 'Chalk line marked across a jean leg', { credit: 'Jane Doe / Unsplash' }),
```

`npm test` fails if a referenced file is missing or its alt text is empty. Write alt text that describes the garment and what's happening, not "project image".

**Art direction:** covers 4:5 portrait, steps 4:3 landscape; neutral backdrop (white, grey, or undyed linen); soft natural light; garment centred with space around it; no props or text. Tutorial step photos should be real photos of the step being done. Don't use stock or AI images for steps.

## Adding a project

Add an entry to `PROJECTS` in `src/data/projects.ts`, reusing the requirement helpers at the top of the file. Set `category` (the kind of work: repair, alteration, reconstruction, accessory) and `output` (what it makes: garment, bag, accessory; this drives icons and Explore's filters). Each tutorial step lists the requirement IDs it uses, so the tutorial can show which items are relevant to that step. `npm test` checks that every step references a real requirement ID.
