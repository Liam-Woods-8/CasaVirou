import type { Item, MatchState, Project, ProjectMatch, Requirement, RequirementResult } from '../types';

export function itemSatisfies(item: Item, requirement: Requirement): boolean {
  const { categories, itemTypes, materials } = requirement.match;
  if (categories && !categories.includes(item.category)) return false;
  if (itemTypes && !itemTypes.includes(item.itemType)) return false;
  if (materials && !(item.material && materials.includes(item.material))) return false;
  return true;
}

function ratio(results: RequirementResult[], kind: Requirement['kind']): { have: number; total: number } {
  const required = results.filter((r) => r.requirement.kind === kind && !r.requirement.optional);
  return { have: required.filter((r) => r.matchedBy.length > 0).length, total: required.length };
}

export function classify(percent: number): MatchState {
  if (percent >= 100) return 'MAKE_NOW';
  if (percent >= 70) return 'ALMOST_READY';
  if (percent >= 40) return 'POSSIBLE';
  return 'LOW';
}

/**
 * Deterministic, rules-based match of a user's inventory against a project.
 * Missing requirements are resolved first; the score is derived from them.
 *
 * Match % = (materialScore * 0.6 + toolScore * 0.4) * 100
 * A kind with no non-optional requirements scores 1.
 */
export function matchProject(project: Project, items: Item[]): ProjectMatch {
  const results: RequirementResult[] = project.requirements.map((requirement) => ({
    requirement,
    matchedBy: items.filter((item) => itemSatisfies(item, requirement)),
  }));

  const have = results.filter((r) => r.matchedBy.length > 0);
  const missing = results.filter((r) => r.matchedBy.length === 0);

  const materials = ratio(results, 'material');
  const tools = ratio(results, 'tool');
  const materialScore = materials.total === 0 ? 1 : materials.have / materials.total;
  const toolScore = tools.total === 0 ? 1 : tools.have / tools.total;
  const raw = (materialScore * 0.6 + toolScore * 0.4) * 100;

  return {
    project,
    have,
    missing,
    haveCount: materials.have + tools.have,
    requiredCount: materials.total + tools.total,
    percent: Math.round(raw),
    // Classify the unrounded score so 99.5% never reads as "make now".
    state: classify(raw),
  };
}

/** Matches sorted best-first; ties broken by difficulty, then title. */
export function matchAll(projects: Project[], items: Item[]): ProjectMatch[] {
  return projects
    .map((p) => matchProject(p, items))
    .sort(
      (a, b) =>
        b.percent - a.percent ||
        a.project.difficulty - b.project.difficulty ||
        a.project.title.localeCompare(b.project.title),
    );
}

export function requiredMissing(match: ProjectMatch): RequirementResult[] {
  return match.missing.filter((r) => !r.requirement.optional);
}

export function projectUsesItem(project: Project, item: Item): boolean {
  return project.requirements.some((r) => itemSatisfies(item, r));
}

/** Matches for projects that item can contribute to. */
export function matchesUsingItem(matches: ProjectMatch[], item: Item): ProjectMatch[] {
  return matches.filter((m) => projectUsesItem(m.project, item));
}

/** A match's requirement results split into required and optional, each by satisfied or not. */
export function splitRequirements(match: ProjectMatch) {
  const required = (r: RequirementResult) => !r.requirement.optional;
  const optional = (r: RequirementResult) => !!r.requirement.optional;
  return {
    have: match.have.filter(required),
    missing: match.missing.filter(required),
    optionalHave: match.have.filter(optional),
    optionalMissing: match.missing.filter(optional),
  };
}

export const MATCH_STATES: MatchState[] = ['MAKE_NOW', 'ALMOST_READY', 'POSSIBLE', 'LOW'];

export const MATCH_STATE_LABELS: Record<MatchState, string> = {
  MAKE_NOW: 'You can make now',
  ALMOST_READY: 'Almost ready',
  POSSIBLE: 'Possible',
  LOW: 'Low match',
};
