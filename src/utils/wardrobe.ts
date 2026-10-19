import { FABRICS, labelFor } from '../data/options';
import type { Item, ItemDraft, Project, ProjectMatch, Requirement } from '../types';

export interface GarmentUse {
  requirement: Requirement;
  /** Clothing in the wardrobe that could have been used; the user picks one if there are several. */
  candidates: Item[];
}

/** The old clothes a finished project transformed: one entry per required material met by clothing. */
export function garmentsUsed(match: ProjectMatch): GarmentUse[] {
  const seen = new Set<string>();
  const uses: GarmentUse[] = [];
  for (const r of match.have) {
    if (r.requirement.kind !== 'material' || r.requirement.optional) continue;
    const candidates = r.matchedBy.filter((i) => i.category === 'clothing');
    // Skip requirements already covered by the same garments, e.g. "Old jeans" and "Denim" both met by one pair.
    if (!candidates.length || candidates.every((i) => seen.has(i.id))) continue;
    candidates.forEach((i) => seen.add(i.id));
    uses.push({ requirement: r.requirement, candidates });
  }
  return uses;
}

/** A scraps item for the fabric left over after cutting up a garment. */
export function leftoverScraps(item: Item, project: Project): ItemDraft {
  const fabric = labelFor(FABRICS, item.material);
  return {
    category: 'material',
    itemType: 'scraps',
    name: `${fabric || 'Fabric'} scraps from ${item.name}`,
    material: item.material,
    color: item.color,
    condition: 'scrap-only',
    quantity: 1,
    notes: `Left over from ${project.title}.`,
  };
}

/** Uses scraps and doesn't also need a whole garment. */
export function madeFromScraps(project: Project): boolean {
  return (
    project.usesScraps &&
    !project.requirements.some((r) => r.kind === 'material' && !r.optional && r.match.categories?.includes('clothing'))
  );
}

/** Projects to suggest for leftovers, best match first. */
export function scrapProjects(matches: ProjectMatch[], excludeId?: string, limit = 3): ProjectMatch[] {
  return matches.filter((m) => madeFromScraps(m.project) && m.project.id !== excludeId).slice(0, limit);
}
