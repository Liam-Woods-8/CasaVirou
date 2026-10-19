import { Link } from 'react-router';
import { CATEGORY_LABELS, FABRICS, itemTypeLabel, labelFor } from '../data/options';
import type { Item } from '../types';
import { Artwork } from './ui/Artwork';

export function itemSubtitle(item: Item): string {
  const type = itemTypeLabel(item.category, item.itemType);
  if (item.category === 'tool') return type;
  return [type, labelFor(FABRICS, item.material)].filter(Boolean).join(' · ');
}

export function ItemCard({ item }: { item: Item }) {
  const art = item.category === 'tool' ? 'plain' : item.category === 'material' ? 'dots' : 'weave';
  return (
    <Link to={`/materials/${item.id}`} className="group flex flex-col">
      <div className="overflow-hidden border border-line transition-colors group-hover:border-ink">
        <Artwork
          photo={item.photo}
          art={art}
          icon={item.category}
          alt={item.name}
          aspect="aspect-square"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-1 pt-3">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wide group-hover:underline group-hover:underline-offset-4">
          {item.name}
        </h3>
        <p className="eyebrow text-muted">{CATEGORY_LABELS[item.category]}</p>
        <p className="text-sm">{itemSubtitle(item)}</p>
        {item.category !== 'tool' && item.quantity !== undefined && (
          <p className="text-xs text-muted">Quantity: {item.quantity}</p>
        )}
      </div>
    </Link>
  );
}
