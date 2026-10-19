import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { CATEGORY_LABELS, CONDITIONS, FABRICS, itemTypeLabel, labelFor } from '../data/options';
import { PROJECTS } from '../data/projects';
import { useMyItems } from '../store/selectors';
import { useStore } from '../store/useStore';
import { projectUsesItem } from '../utils/matching';
import { formatDate } from '../utils/format';
import { Page } from '../components/layout/Layouts';
import { Artwork } from '../components/ui/Artwork';
import { Button } from '../components/ui/Button';
import { EmptyState, Eyebrow } from '../components/ui/primitives';

export function MaterialDetail() {
  const { itemId } = useParams();
  const items = useMyItems();
  const deleteItem = useStore((s) => s.deleteItem);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const item = items.find((i) => i.id === itemId);

  const usedIn = useMemo(() => (item ? PROJECTS.filter((p) => projectUsesItem(p, item)) : []), [item]);

  if (!item) {
    return (
      <Page narrow>
        <EmptyState
          title="Item not found."
          body="It may have been deleted, or it belongs to another account."
          action={<Button to="/materials">Back to my materials</Button>}
        />
      </Page>
    );
  }

  const rows: [string, string | undefined][] =
    item.category === 'tool'
      ? [['Tool type', itemTypeLabel('tool', item.itemType)]]
      : [
          [item.category === 'clothing' ? 'Clothing type' : 'Material type', itemTypeLabel(item.category, item.itemType)],
          ['Material', labelFor(FABRICS, item.material)],
          ['Color', item.color],
          ['Size / measurements', item.size],
          ['Condition', labelFor(CONDITIONS, item.condition)],
          ['Quantity', item.quantity?.toString()],
        ];

  return (
    <Page>
      <Link to="/materials" className="eyebrow inline-flex items-center gap-2 text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> My materials
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-16">
        <Artwork
          photo={item.photo}
          art={item.category === 'tool' ? 'plain' : item.category === 'material' ? 'dots' : 'weave'}
          icon={item.category}
          alt={item.name}
          aspect="aspect-square"
          className="border border-ink"
        />

        <div className="flex flex-col">
          <Eyebrow>{CATEGORY_LABELS[item.category]}</Eyebrow>
          <h1 className="display mt-3 text-3xl sm:text-5xl">{item.name}</h1>

          <dl className="mt-8 divide-y divide-line border-y border-line">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="grid grid-cols-2 gap-4 py-3">
                  <dt className="eyebrow text-muted">{k}</dt>
                  <dd className="text-sm">{v}</dd>
                </div>
              ))}
            <div className="grid grid-cols-2 gap-4 py-3">
              <dt className="eyebrow text-muted">Added</dt>
              <dd className="text-sm">{formatDate(item.createdAt)}</dd>
            </div>
          </dl>

          {item.notes && <p className="mt-6 text-sm leading-relaxed text-muted">{item.notes}</p>}

          <p className="mt-6 text-sm">
            {usedIn.length > 0
              ? `Used in ${usedIn.length} project${usedIn.length === 1 ? '' : 's'}.`
              : 'No projects use this yet. Other items may still help you find some.'}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Button to={`/projects?item=${item.id}`} size="lg">
              Find projects with this <ArrowRight className="h-4 w-4" />
            </Button>
            {confirming ? (
              <div className="border border-red-800/40 p-4" role="alertdialog" aria-label="Confirm delete">
                <p className="text-sm">Delete “{item.name}” from your wardrobe? This can&rsquo;t be undone.</p>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="danger"
                    onClick={() => {
                      deleteItem(item.id);
                      navigate('/materials', { replace: true });
                    }}
                  >
                    Yes, delete
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirming(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button to={`/materials/${item.id}/edit`} variant="secondary">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="danger" onClick={() => setConfirming(true)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
