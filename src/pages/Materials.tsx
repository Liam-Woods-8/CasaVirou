import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { CATEGORY_LABELS, FABRICS, itemTypeLabel, labelFor } from '../data/options';
import { useMyItems } from '../store/selectors';
import type { ItemCategory } from '../types';
import { EmptyWardrobe } from '../components/EmptyWardrobe';
import { ItemCard } from '../components/ItemCard';
import { CardGrid } from '../components/ProjectCard';
import { Page } from '../components/layout/Layouts';
import { Button } from '../components/ui/Button';
import { Chip, EmptyState, PageHeader } from '../components/ui/primitives';

const FILTERS: (ItemCategory | 'all')[] = ['all', 'clothing', 'material', 'tool'];

export function Materials() {
  const items = useMyItems();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ItemCategory | 'all'>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length, clothing: 0, material: 0, tool: 0 };
    items.forEach((i) => c[i.category]++);
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (category !== 'all' && i.category !== category) return false;
      if (!q) return true;
      const haystack = [i.name, itemTypeLabel(i.category, i.itemType), labelFor(FABRICS, i.material), i.color, i.notes]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query, category]);

  const addButton = (
    <Button to="/materials/new">
      <Plus className="h-4 w-4" /> Add item
    </Button>
  );

  return (
    <Page>
      <PageHeader eyebrow="Digital wardrobe" title="My Materials" actions={items.length > 0 ? addButton : undefined} />

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyWardrobe />
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((f) => (
                <Chip key={f} active={category === f} onClick={() => setCategory(f)}>
                  {f === 'all' ? 'All' : CATEGORY_LABELS[f]} ({counts[f]})
                </Chip>
              ))}
            </div>
            <label className="relative block lg:w-72">
              <span className="sr-only">Search materials</span>
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your wardrobe"
                className="h-11 w-full border border-line bg-paper pl-9 pr-3 text-base transition-colors hover:border-ink/50 focus:border-ink focus:outline-none sm:text-sm"
              />
            </label>
          </div>

          <div className="mt-8">
            {visible.length === 0 ? (
              <EmptyState
                title="Nothing matches that search."
                body="Try a different word or clear the category filter."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery('');
                      setCategory('all');
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <CardGrid dense>
                {visible.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </CardGrid>
            )}
          </div>
        </>
      )}
    </Page>
  );
}
