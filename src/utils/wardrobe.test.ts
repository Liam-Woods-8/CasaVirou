import { describe, expect, it } from 'vitest';
import { getProject, PROJECTS } from '../data/projects';
import { DEMO_USER_ID, SEED_ITEMS } from '../data/seed';
import type { Item } from '../types';
import { matchAll, matchProject } from './matching';
import { garmentsUsed, leftoverScraps, madeFromScraps, scrapProjects } from './wardrobe';

const demoItems = SEED_ITEMS.filter((i) => i.ownerId === DEMO_USER_ID);
const jeans = demoItems.find((i) => i.itemType === 'jeans')!;

describe('garmentsUsed', () => {
  it('lists the garment a project transformed', () => {
    const uses = garmentsUsed(matchProject(getProject('cutoff-shorts')!, demoItems));
    expect(uses).toHaveLength(1);
    expect(uses[0].candidates.map((i) => i.id)).toEqual([jeans.id]);
  });

  it('asks about the same garment only once', () => {
    // Patchwork tote needs "Old jeans" and "Denim"; one pair of jeans covers both.
    const uses = garmentsUsed(matchProject(getProject('patchwork-tote')!, demoItems));
    const ids = uses.flatMap((u) => u.candidates.map((i) => i.id));
    expect(ids.filter((id) => id === jeans.id)).toHaveLength(1);
  });

  it('ignores tools, materials, and optional requirements', () => {
    const uses = garmentsUsed(matchProject(getProject('scrap-scrunchie')!, demoItems));
    expect(uses).toEqual([]);
  });

  it('offers every matching garment when there is more than one', () => {
    const second: Item = { ...jeans, id: 'jeans-2', name: 'Black Jeans' };
    const uses = garmentsUsed(matchProject(getProject('cutoff-shorts')!, [...demoItems, second]));
    expect(uses[0].candidates.map((i) => i.name)).toEqual(['Old Blue Jeans', 'Black Jeans']);
  });
});

describe('leftoverScraps', () => {
  it('turns a garment into a scraps item that scrap projects can match', () => {
    const draft = leftoverScraps(jeans, getProject('cutoff-shorts')!);
    expect(draft).toMatchObject({ category: 'material', itemType: 'scraps', material: 'denim', condition: 'scrap-only' });
    expect(draft.name).toBe('Denim scraps from Old Blue Jeans');
  });
});

describe('scrapProjects', () => {
  it('only suggests scrap-friendly projects, excluding the one just finished', () => {
    const ideas = scrapProjects(matchAll(PROJECTS, demoItems), 'denim-patches');
    expect(ideas.length).toBeGreaterThan(0);
    expect(ideas.length).toBeLessThanOrEqual(3);
    expect(ideas.every((m) => m.project.usesScraps && m.project.id !== 'denim-patches')).toBe(true);
  });

  it("doesn't suggest projects that need a whole garment", () => {
    expect(madeFromScraps(getProject('patchwork-tote')!)).toBe(false);
    expect(madeFromScraps(getProject('scrap-scrunchie')!)).toBe(true);
    const all = scrapProjects(matchAll(PROJECTS, demoItems), undefined, 99).map((m) => m.project.id);
    expect(all).not.toContain('patchwork-shorts');
  });
});
