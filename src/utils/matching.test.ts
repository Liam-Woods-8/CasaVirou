import { describe, expect, it } from 'vitest';
import { getProject, PROJECTS } from '../data/projects';
import { DEMO_USER_ID, SEED_ITEMS } from '../data/seed';
import type { Item } from '../types';
import { classify, matchAll, matchProject, projectUsesItem } from './matching';

const demoItems = SEED_ITEMS.filter((i) => i.ownerId === DEMO_USER_ID);
const tote = getProject('patchwork-tote')!;

const jeans: Item = {
  id: 'x',
  ownerId: 'u',
  category: 'clothing',
  name: 'Old Jeans',
  itemType: 'jeans',
  material: 'denim',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('classify', () => {
  it('uses the documented thresholds', () => {
    expect(classify(100)).toBe('MAKE_NOW');
    expect(classify(99)).toBe('ALMOST_READY');
    expect(classify(70)).toBe('ALMOST_READY');
    expect(classify(69)).toBe('POSSIBLE');
    expect(classify(40)).toBe('POSSIBLE');
    expect(classify(39)).toBe('LOW');
  });
});

describe('matchProject', () => {
  it('reports everything missing for an empty wardrobe', () => {
    const m = matchProject(tote, []);
    expect(m.percent).toBe(0);
    expect(m.have).toHaveLength(0);
    expect(m.missing).toHaveLength(tote.requirements.length);
    expect(m.state).toBe('LOW');
  });

  it('weights materials 60% and tools 40%', () => {
    // Tote: 3 materials, 3 tools. Jeans alone = 1/3 materials, 0 tools.
    const m = matchProject(tote, [jeans]);
    expect(m.percent).toBe(20);
    expect(m.haveCount).toBe(1);
    expect(m.requiredCount).toBe(6);
    expect(m.have.map((r) => r.requirement.id)).toEqual(['old-jeans']);
  });

  it('does not count optional requirements toward the score', () => {
    const tee = getProject('reworked-tshirt')!;
    const items = demoItems.filter((i) => ['t-shirt', 'scissors'].includes(i.itemType));
    const m = matchProject(tee, items);
    expect(m.percent).toBe(100);
    expect(m.missing.map((r) => r.requirement.id)).toEqual(['fabric-chalk']);
  });

  it('only says "make now" when nothing required is missing', () => {
    for (const m of matchAll(PROJECTS, demoItems)) {
      const requiredMissing = m.missing.filter((r) => !r.requirement.optional).length;
      expect(m.state === 'MAKE_NOW').toBe(requiredMissing === 0);
    }
  });

  it('is deterministic', () => {
    expect(matchAll(PROJECTS, demoItems)).toEqual(matchAll(PROJECTS, demoItems));
  });
});

describe('demo wardrobe', () => {
  const byState = (state: string) =>
    matchAll(PROJECTS, demoItems)
      .filter((m) => m.state === state)
      .map((m) => m.project.id);

  it('has projects in each discovery group', () => {
    expect(byState('MAKE_NOW')).toEqual(expect.arrayContaining(['patchwork-tote', 'reworked-tshirt', 'patchwork-shorts']));
    expect(byState('ALMOST_READY')).toEqual(expect.arrayContaining(['denim-wallet', 'denim-patches']));
    expect(byState('POSSIBLE').length).toBeGreaterThan(0);
  });
});

describe('projectUsesItem', () => {
  it('links old jeans to the patchwork tote', () => {
    expect(projectUsesItem(tote, jeans)).toBe(true);
    expect(projectUsesItem(getProject('sweater-mittens')!, jeans)).toBe(false);
  });
});
