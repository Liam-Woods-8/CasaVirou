import { useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { FABRICS, labelFor, PROJECT_CATEGORY_LABELS, type Option } from '../data/options';
import { PROJECTS } from '../data/projects';
import { useMatches, useMyItems } from '../store/selectors';
import type { MatchState, ProjectCategory, ProjectMatch } from '../types';
import {
  activeFilterCount,
  EMPTY_FILTERS,
  filterMatches,
  groupCounts,
  projectFabrics,
  SCRAPS_MATERIAL,
  sortMatches,
  type DifficultyBand,
  type DiscoveryFilters,
  type SortKey,
  TIME_BANDS,
} from '../utils/discovery';
import { MATCH_STATE_LABELS, MATCH_STATES } from '../utils/matching';
import { EmptyWardrobe } from '../components/EmptyWardrobe';
import { CardGrid, ProjectCard } from '../components/ProjectCard';
import { Button } from '../components/ui/Button';
import { SelectField } from '../components/ui/fields';
import { Chip, EmptyState, Notice, PageHeader, SectionHeading } from '../components/ui/primitives';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'match', label: 'Best match' },
  { value: 'difficulty', label: 'Easiest first' },
  { value: 'time', label: 'Shortest first' },
];

const GROUP_RANGE: Record<MatchState, string> = {
  MAKE_NOW: '100%',
  ALMOST_READY: '70–99%',
  POSSIBLE: '40–69%',
  LOW: 'Under 40%',
};

const GROUP_COUNT_TONE: Partial<Record<MatchState, string>> = {
  MAKE_NOW: 'text-emerald-800',
  ALMOST_READY: 'text-amber-800',
};

const DIFFICULTY_OPTIONS: { value: Exclude<DifficultyBand, ''>; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const TIME_OPTIONS = TIME_BANDS;

const CATEGORIES = Object.keys(PROJECT_CATEGORY_LABELS) as ProjectCategory[];

/** Only offer materials the library actually uses. */
const MATERIAL_OPTIONS: Option[] = (() => {
  const used = new Set(PROJECTS.flatMap((p) => [...projectFabrics(p)]));
  return [{ value: SCRAPS_MATERIAL, label: 'Fabric scraps' }, ...FABRICS.filter((f) => used.has(f.value))];
})();

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

interface ResultsProps {
  index?: string;
  title: string;
  matches: ProjectMatch[];
  showMatch?: boolean;
}

function Results({ index, title, matches, showMatch = true }: ResultsProps) {
  return (
    <section className="mt-12">
      <SectionHeading index={index} title={title} note={plural(matches.length, 'project')} />
      <CardGrid>
        {matches.map((m) => (
          <ProjectCard key={m.project.id} match={m} showMatch={showMatch} />
        ))}
      </CardGrid>
    </section>
  );
}

function FilterGroup({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="eyebrow mb-2 text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </fieldset>
  );
}

export function Discover() {
  const matches = useMatches();
  const items = useMyItems();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('match');
  const [filters, setFilters] = useState<DiscoveryFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const itemId = params.get('item');
  const focusItem = itemId ? items.find((i) => i.id === itemId) : undefined;
  const context = useMemo(() => ({ query, item: focusItem }), [query, focusItem]);

  const filtered = useMemo(() => filterMatches(matches, filters, context), [matches, filters, context]);
  const counts = useMemo(() => groupCounts(matches, filters, context), [matches, filters, context]);
  const sorted = useMemo(() => sortMatches(filtered, sort), [filtered, sort]);

  const update = (patch: Partial<DiscoveryFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const filterCount = activeFilterCount(filters);
  const clearAll = () => {
    setQuery('');
    setFilters(EMPTY_FILTERS);
    if (itemId) setParams({});
  };

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="What can you make?" subtitle="Projects are matched to the things you already own." />
        <div className="mt-8">
          <EmptyWardrobe />
        </div>
        <Results title="Projects in the library" matches={sortMatches(matches, 'difficulty')} showMatch={false} />
      </>
    );
  }

  const activeChips: { key: string; label: string; remove: () => void }[] = [
    ...filters.groups.map((g) => ({
      key: `g-${g}`,
      label: MATCH_STATE_LABELS[g],
      remove: () => update({ groups: filters.groups.filter((x) => x !== g) }),
    })),
    ...(filters.material
      ? [{ key: 'material', label: labelFor(MATERIAL_OPTIONS, filters.material), remove: () => update({ material: '' }) }]
      : []),
    ...filters.categories.map((c) => ({
      key: `c-${c}`,
      label: PROJECT_CATEGORY_LABELS[c],
      remove: () => update({ categories: filters.categories.filter((x) => x !== c) }),
    })),
    ...(filters.difficulty
      ? [{ key: 'difficulty', label: labelFor(DIFFICULTY_OPTIONS, filters.difficulty), remove: () => update({ difficulty: '' }) }]
      : []),
    ...(filters.time ? [{ key: 'time', label: labelFor(TIME_OPTIONS, filters.time), remove: () => update({ time: '' }) }] : []),
    ...(filters.noSpecialTools
      ? [{ key: 'tools', label: 'No special tools', remove: () => update({ noSpecialTools: false }) }]
      : []),
  ];

  const narrowed = !!focusItem || filterCount > 0 || !!query.trim();
  const byGroup = (state: MatchState) => sorted.filter((m) => m.state === state);
  // "Make now" stays visible when empty (unless groups are filtered) so the page always answers the question.
  const groupsShown = MATCH_STATES.filter((s) =>
    filters.groups.length ? filters.groups.includes(s) && byGroup(s).length > 0 : byGroup(s).length > 0 || s === 'MAKE_NOW',
  );

  return (
    <>
      <PageHeader
        title="What can you make?"
        subtitle={`Projects matched to the ${plural(items.length, 'item')} in your wardrobe. Start with what you can make right now.`}
      />

      <div role="group" aria-label="Match groups" className="mt-6 grid grid-cols-2 border-l border-t border-ink sm:grid-cols-4">
        {MATCH_STATES.map((state) => {
          const active = filters.groups.includes(state);
          return (
            <button
              key={state}
              type="button"
              aria-pressed={active}
              onClick={() => update({ groups: toggle(filters.groups, state) })}
              className={`flex flex-col items-start gap-1 border-b border-r border-ink px-4 py-3 text-left transition-colors sm:py-4 ${
                active ? 'bg-ink text-paper' : 'hover:bg-ink/[0.04]'
              }`}
            >
              <span className={`font-mono text-2xl font-semibold sm:text-3xl ${active ? '' : (GROUP_COUNT_TONE[state] ?? '')}`}>
                {counts[state]}
              </span>
              <span className="eyebrow">{MATCH_STATE_LABELS[state]}</span>
              <span className={`eyebrow ${active ? 'text-paper/70' : 'text-muted'}`}>{GROUP_RANGE[state]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <label className="relative block basis-full sm:flex-1 sm:basis-auto">
          <span className="sr-only">Search projects</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects or materials"
            className="h-11 w-full border border-line bg-paper pl-9 pr-3 text-base transition-colors hover:border-ink/50 focus:border-ink focus:outline-none sm:text-sm"
          />
        </label>
        <label className="relative flex-1 sm:flex-none">
          <span className="sr-only">Sort projects</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="eyebrow h-11 w-full appearance-none border border-line bg-paper pl-3 pr-9 transition-colors hover:border-ink/50 focus:border-ink focus:outline-none sm:w-44"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        </label>
        <Button
          variant={filtersOpen ? 'primary' : 'secondary'}
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-controls="discover-filters"
          className="flex-1 sm:flex-none"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {filterCount > 0 && <span>({filterCount})</span>}
        </Button>
      </div>

      {filtersOpen && (
        <div id="discover-filters" className="mt-2 grid gap-6 border border-line bg-paper-deep/50 p-4 sm:p-5 md:grid-cols-2 lg:grid-cols-3">
          <SelectField
            label="Material"
            value={filters.material}
            onChange={(material) => update({ material })}
            options={MATERIAL_OPTIONS}
            placeholder="Any material"
          />
          <FilterGroup label="Project type">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={filters.categories.includes(c)} onClick={() => update({ categories: toggle(filters.categories, c) })}>
                {PROJECT_CATEGORY_LABELS[c]}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Difficulty">
            {DIFFICULTY_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                active={filters.difficulty === o.value}
                onClick={() => update({ difficulty: filters.difficulty === o.value ? '' : o.value })}
              >
                {o.label}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Time">
            {TIME_OPTIONS.map((o) => (
              <Chip key={o.value} active={filters.time === o.value} onClick={() => update({ time: filters.time === o.value ? '' : o.value })}>
                {o.label}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Tools" hint="Hand tools only. No sewing machine or iron needed.">
            <Chip active={filters.noSpecialTools} onClick={() => update({ noSpecialTools: !filters.noSpecialTools })}>
              No special tools
            </Chip>
          </FilterGroup>
        </div>
      )}

      {narrowed && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {focusItem && (
            <span className="eyebrow inline-flex h-9 items-center gap-2 border border-ink bg-ink pl-3 pr-1 text-paper">
              Using: {focusItem.name}
              <button
                type="button"
                onClick={() => setParams({})}
                aria-label={`Stop filtering by ${focusItem.name}`}
                className="flex h-7 w-7 items-center justify-center hover:bg-paper hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          {activeChips.map((chip) => (
            <span key={chip.key} className="eyebrow inline-flex h-9 items-center gap-2 border border-line pl-3 pr-1">
              {chip.label}
              <button
                type="button"
                onClick={chip.remove}
                aria-label={`Remove filter: ${chip.label}`}
                className="flex h-7 w-7 items-center justify-center hover:bg-ink hover:text-paper"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <span className="eyebrow ml-1 text-muted">{plural(filtered.length, 'result')}</span>
          <button type="button" onClick={clearAll} className="eyebrow ml-2 underline underline-offset-4 hover:text-muted">
            Clear all
          </button>
        </div>
      )}

      {itemId && !focusItem && (
        <div className="mt-6">
          <Notice>That item is no longer in your wardrobe, so all projects are shown.</Notice>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No projects match."
            body={
              focusItem
                ? `No projects use “${focusItem.name}” with these filters. Try removing one.`
                : 'Nothing fits every filter you picked. Remove one or clear them all to see more.'
            }
            action={
              <Button variant="secondary" onClick={clearAll}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : sort === 'match' ? (
        groupsShown.map((state, i) => {
          const group = byGroup(state);
          const index = String(i + 1).padStart(2, '0');
          if (group.length === 0) {
            return (
              <section key={state} className="mt-12">
                <SectionHeading index={index} title={MATCH_STATE_LABELS[state]} note="0 projects" />
                <div className="border border-dashed border-ink/30 px-5 py-6">
                  <p className="font-mono text-sm font-semibold uppercase">No exact matches yet.</p>
                  <p className="mt-1 text-sm text-muted">
                    {byGroup('ALMOST_READY').length > 0
                      ? 'The projects below are close. You only need a few more items.'
                      : 'Below are the projects closest to what you have.'}
                  </p>
                </div>
              </section>
            );
          }
          return <Results key={state} index={index} title={MATCH_STATE_LABELS[state]} matches={group} />;
        })
      ) : (
        <Results title={labelFor(SORT_OPTIONS, sort)} matches={sorted} />
      )}
    </>
  );
}
