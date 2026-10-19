import { SPECIAL_TOOL_TYPES } from '../data/options';
import type { Item, MatchState, Project, ProjectCategory, ProjectMatch } from '../types';
import { MATCH_STATES, projectUsesItem } from './matching';

/**
 * Discovery filtering and sorting. Operates on ProjectMatch results from the
 * matching engine and never recomputes scores.
 */

export type SortKey = 'match' | 'difficulty' | 'time';
export type DifficultyBand = '' | 'beginner' | 'intermediate' | 'advanced';
export type TimeBand = '' | 'under-1h' | '1-2h' | '2-3h' | '3-4h' | '4h-plus';

/**
 * Time filter bands. Upper bounds are inclusive so a 3 hr project reads as
 * "2–3 hours", not "3–4 hours".
 */
export const TIME_BANDS: { value: Exclude<TimeBand, ''>; label: string; min: number; max: number }[] = [
  { value: 'under-1h', label: 'Under 1 hour', min: 0, max: 59 },
  { value: '1-2h', label: '1–2 hours', min: 60, max: 120 },
  { value: '2-3h', label: '2–3 hours', min: 121, max: 180 },
  { value: '3-4h', label: '3–4 hours', min: 181, max: 240 },
  { value: '4h-plus', label: '4+ hours', min: 241, max: Infinity },
];

export interface DiscoveryFilters {
  groups: MatchState[];
  /** A fabric value from FABRICS, or 'scraps' for scrap-friendly projects. */
  material: string;
  categories: ProjectCategory[];
  difficulty: DifficultyBand;
  time: TimeBand;
  noSpecialTools: boolean;
}

export const EMPTY_FILTERS: DiscoveryFilters = {
  groups: [],
  material: '',
  categories: [],
  difficulty: '',
  time: '',
  noSpecialTools: false,
};

export const SCRAPS_MATERIAL = 'scraps';

/** Fabric implied by a garment requirement, e.g. old jeans are denim. */
const GARMENT_FABRIC: Record<string, string> = {
  jeans: 'denim',
  sweater: 'wool',
  't-shirt': 'jersey',
  hoodie: 'fleece',
};

export function projectFabrics(project: Project): Set<string> {
  const fabrics = new Set<string>();
  for (const r of project.requirements) {
    if (r.kind !== 'material') continue;
    r.match.materials?.forEach((m) => fabrics.add(m));
    if (r.match.categories?.includes('clothing')) {
      r.match.itemTypes?.forEach((t) => GARMENT_FABRIC[t] && fabrics.add(GARMENT_FABRIC[t]));
    }
  }
  return fabrics;
}

/** Required (non-optional) tools beyond basic hand tools. */
export function specialTools(project: Project) {
  return project.requirements.filter(
    (r) => r.kind === 'tool' && !r.optional && r.match.itemTypes?.some((t) => SPECIAL_TOOL_TYPES.includes(t)),
  );
}

export function needsSpecialTools(project: Project): boolean {
  return specialTools(project).length > 0;
}

function inDifficulty(level: number, band: DifficultyBand): boolean {
  if (band === 'beginner') return level <= 2;
  if (band === 'intermediate') return level === 3;
  if (band === 'advanced') return level >= 4;
  return true;
}

function inTime(minutes: number, band: TimeBand): boolean {
  const range = TIME_BANDS.find((b) => b.value === band);
  return !range || (minutes >= range.min && minutes <= range.max);
}

export interface DiscoveryContext {
  query?: string;
  /** Only show projects this item can contribute to (the ?item= param). */
  item?: Item;
}

function passesContext(project: Project, { query, item }: DiscoveryContext): boolean {
  if (item && !projectUsesItem(project, item)) return false;
  const q = query?.trim().toLowerCase();
  if (q) {
    const haystack = [project.title, project.description, ...project.requirements.map((r) => r.label)]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function passesFilters(match: ProjectMatch, f: DiscoveryFilters, ignoreGroups = false): boolean {
  const { project } = match;
  if (!ignoreGroups && f.groups.length && !f.groups.includes(match.state)) return false;
  if (f.material === SCRAPS_MATERIAL && !project.usesScraps) return false;
  if (f.material && f.material !== SCRAPS_MATERIAL && !projectFabrics(project).has(f.material)) return false;
  if (f.categories.length && !f.categories.includes(project.category)) return false;
  if (!inDifficulty(project.difficulty, f.difficulty)) return false;
  if (!inTime(project.minutes, f.time)) return false;
  if (f.noSpecialTools && needsSpecialTools(project)) return false;
  return true;
}

export function filterMatches(matches: ProjectMatch[], filters: DiscoveryFilters, context: DiscoveryContext = {}) {
  return matches.filter((m) => passesContext(m.project, context) && passesFilters(m, filters));
}

/** Per-group counts under every active filter except the group filter itself. */
export function groupCounts(
  matches: ProjectMatch[],
  filters: DiscoveryFilters,
  context: DiscoveryContext = {},
): Record<MatchState, number> {
  const counts = Object.fromEntries(MATCH_STATES.map((s) => [s, 0])) as Record<MatchState, number>;
  for (const m of matches) {
    if (passesContext(m.project, context) && passesFilters(m, filters, true)) counts[m.state]++;
  }
  return counts;
}

export function sortMatches(matches: ProjectMatch[], sort: SortKey): ProjectMatch[] {
  const byMatch = (a: ProjectMatch, b: ProjectMatch) =>
    b.percent - a.percent || a.project.title.localeCompare(b.project.title);
  const compare = {
    match: (a: ProjectMatch, b: ProjectMatch) =>
      b.percent - a.percent ||
      a.project.difficulty - b.project.difficulty ||
      a.project.title.localeCompare(b.project.title),
    difficulty: (a: ProjectMatch, b: ProjectMatch) => a.project.difficulty - b.project.difficulty || byMatch(a, b),
    time: (a: ProjectMatch, b: ProjectMatch) => a.project.minutes - b.project.minutes || byMatch(a, b),
  }[sort];
  return [...matches].sort(compare);
}

export function activeFilterCount(f: DiscoveryFilters): number {
  return (
    f.groups.length +
    f.categories.length +
    (f.material ? 1 : 0) +
    (f.difficulty ? 1 : 0) +
    (f.time ? 1 : 0) +
    (f.noSpecialTools ? 1 : 0)
  );
}
