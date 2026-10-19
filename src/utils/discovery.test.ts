import { describe, expect, it } from 'vitest';
import { getProject, PROJECTS } from '../data/projects';
import { DEMO_USER_ID, SEED_ITEMS } from '../data/seed';
import type { Item } from '../types';
import {
  activeFilterCount,
  EMPTY_FILTERS,
  filterMatches,
  groupCounts,
  needsSpecialTools,
  projectFabrics,
  sortMatches,
  TIME_BANDS,
} from './discovery';
import { formatTime } from './format';
import { matchAll, matchesUsingItem, splitRequirements } from './matching';

const demoItems = SEED_ITEMS.filter((i) => i.ownerId === DEMO_USER_ID);
const matches = matchAll(PROJECTS, demoItems);

describe('project library', () => {
  it('has 15–20 projects with unique ids', () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(15);
    expect(PROJECTS.length).toBeLessThanOrEqual(20);
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(PROJECTS.length);
  });

  it('only references real requirement ids from tutorial steps', () => {
    for (const p of PROJECTS) {
      const ids = new Set(p.requirements.map((r) => r.id));
      expect(ids.size, `${p.id} has duplicate requirement ids`).toBe(p.requirements.length);
      for (const step of p.steps) {
        for (const use of step.uses) expect(ids.has(use), `${p.id} step "${step.title}" uses "${use}"`).toBe(true);
      }
    }
  });

  it('gives every project at least one required material and tool', () => {
    for (const p of PROJECTS) {
      const required = p.requirements.filter((r) => !r.optional);
      expect(required.some((r) => r.kind === 'material'), p.id).toBe(true);
      expect(required.some((r) => r.kind === 'tool'), p.id).toBe(true);
      expect(p.steps.length, p.id).toBeGreaterThan(0);
    }
  });

  it('covers every project type', () => {
    const categories = new Set(PROJECTS.map((p) => p.category));
    expect([...categories].sort()).toEqual(['accessory', 'alteration', 'reconstruction', 'repair']);
  });
});

describe('filterMatches', () => {
  it('returns everything with no filters', () => {
    expect(filterMatches(matches, EMPTY_FILTERS)).toHaveLength(PROJECTS.length);
  });

  it('filters by match group', () => {
    const result = filterMatches(matches, { ...EMPTY_FILTERS, groups: ['MAKE_NOW'] });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((m) => m.state === 'MAKE_NOW')).toBe(true);
  });

  it('filters by fabric, including fabric implied by garments', () => {
    const denim = filterMatches(matches, { ...EMPTY_FILTERS, material: 'denim' }).map((m) => m.project.id);
    expect(denim).toContain('cutoff-shorts');
    expect(denim).not.toContain('scrap-scrunchie');
    expect(projectFabrics(getProject('sweater-mittens')!).has('wool')).toBe(true);
  });

  it('filters by scraps', () => {
    const result = filterMatches(matches, { ...EMPTY_FILTERS, material: 'scraps' });
    expect(result.every((m) => m.project.usesScraps)).toBe(true);
  });

  it('excludes projects that need a sewing machine or iron', () => {
    const result = filterMatches(matches, { ...EMPTY_FILTERS, noSpecialTools: true });
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((m) => m.project.id === 'jean-leg-tote')).toBe(false);
    // Optional iron doesn't count as a requirement.
    expect(needsSpecialTools(getProject('knee-patch-repair')!)).toBe(false);
  });

  it('combines filters with AND', () => {
    const result = filterMatches(matches, { ...EMPTY_FILTERS, categories: ['repair'], difficulty: 'beginner', time: 'under-1h' });
    expect(result.map((m) => m.project.id).sort()).toEqual(['denim-patches', 'knee-patch-repair']);
  });

  it('puts every project in exactly one time band, with inclusive upper bounds', () => {
    const bandOf = (id: string) =>
      TIME_BANDS.filter((b) => filterMatches(matches, { ...EMPTY_FILTERS, time: b.value }).some((m) => m.project.id === id)).map(
        (b) => b.value,
      );
    for (const p of PROJECTS) expect(bandOf(p.id), p.id).toHaveLength(1);
    expect(bandOf('cutoff-shorts')).toEqual(['under-1h']);
    expect(bandOf('patchwork-shorts')).toEqual(['2-3h']); // exactly 3 hr
    expect(bandOf('shoulder-bag')).toEqual(['4h-plus']);
  });

  it('respects the ?item context and search', () => {
    const jeans = demoItems.find((i) => i.itemType === 'jeans')!;
    const withItem = filterMatches(matches, EMPTY_FILTERS, { item: jeans });
    expect(withItem).toEqual(matchesUsingItem(matches, jeans));
    expect(filterMatches(matches, EMPTY_FILTERS, { query: 'hoodie' }).map((m) => m.project.id)).toEqual(['cropped-zip-hoodie']);
  });
});

describe('groupCounts', () => {
  it('ignores the group filter itself but applies the others', () => {
    const filters = { ...EMPTY_FILTERS, groups: ['LOW' as const], categories: ['repair' as const] };
    const counts = groupCounts(matches, filters);
    const repair = matches.filter((m) => m.project.category === 'repair');
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(repair.length);
  });
});

describe('sortMatches', () => {
  it('sorts by difficulty and time ascending', () => {
    const byDifficulty = sortMatches(matches, 'difficulty').map((m) => m.project.difficulty);
    expect(byDifficulty).toEqual([...byDifficulty].sort((a, b) => a - b));
    const byTime = sortMatches(matches, 'time').map((m) => m.project.minutes);
    expect(byTime).toEqual([...byTime].sort((a, b) => a - b));
  });

  it('defaults to best match first without mutating input', () => {
    const copy = [...matches];
    const sorted = sortMatches(matches, 'match').map((m) => m.percent);
    expect(sorted).toEqual([...sorted].sort((a, b) => b - a));
    expect(matches).toEqual(copy);
  });
});

describe('formatTime', () => {
  it('shows exact hours and minutes', () => {
    expect(formatTime(35)).toBe('35 min');
    expect(formatTime(75)).toBe('1 hr 15 min');
    expect(formatTime(180)).toBe('3 hr');
    expect(formatTime(270)).toBe('4 hr 30 min');
  });
});

describe('activeFilterCount', () => {
  it('counts each active filter value', () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0);
    expect(activeFilterCount({ ...EMPTY_FILTERS, groups: ['MAKE_NOW', 'LOW'], material: 'denim', noSpecialTools: true })).toBe(4);
  });
});

describe('splitRequirements', () => {
  it('separates required from optional results', () => {
    const shorts = matches.find((m) => m.project.id === 'cutoff-shorts')!;
    const split = splitRequirements(shorts);
    expect(split.missing).toHaveLength(0);
    expect(split.have.every((r) => !r.requirement.optional)).toBe(true);
    expect(split.optionalMissing.map((r) => r.requirement.id).sort()).toEqual(['fabric-chalk', 'measuring-tape']);
  });

  it('reports which item satisfies each requirement', () => {
    const shorts = matches.find((m) => m.project.id === 'cutoff-shorts')!;
    const jeansReq = splitRequirements(shorts).have.find((r) => r.requirement.id === 'old-jeans')!;
    expect(jeansReq.matchedBy.map((i: Item) => i.name)).toEqual(['Old Blue Jeans']);
  });
});
