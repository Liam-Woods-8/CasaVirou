import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowRight, Check, Plus, Scissors, Shirt, Sparkles, X } from 'lucide-react';
import { CATEGORY_LABELS, CONDITIONS, FABRICS, itemTypeLabel, labelFor, typeOptionsFor } from '../data/options';
import { useMatches, useMyItems } from '../store/selectors';
import { useStore } from '../store/useStore';
import type { Item, ItemCategory, ItemDraft } from '../types';
import { matchesUsingItem } from '../utils/matching';
import { FocusBar } from '../components/layout/Layouts';
import { Artwork } from '../components/ui/Artwork';
import { Button } from '../components/ui/Button';
import { PhotoField, SelectField, TextArea, TextField } from '../components/ui/fields';
import { EmptyState, Eyebrow } from '../components/ui/primitives';

const CATEGORY_CHOICES: { value: ItemCategory; icon: typeof Shirt; hint: string }[] = [
  { value: 'clothing', icon: Shirt, hint: 'Jeans, tees, sweaters, shirts' },
  { value: 'material', icon: Sparkles, hint: 'Scraps, thread, zippers, snaps' },
  { value: 'tool', icon: Scissors, hint: 'Scissors, needles, machines' },
];

interface FormState {
  photo?: string;
  name: string;
  itemType: string;
  material: string;
  color: string;
  size: string;
  condition: string;
  quantity: string;
  notes: string;
}

function toFormState(item?: Item): FormState {
  return {
    photo: item?.photo,
    name: item?.name ?? '',
    itemType: item?.itemType ?? '',
    material: item?.material ?? '',
    color: item?.color ?? '',
    size: item?.size ?? '',
    condition: item?.condition ?? '',
    quantity: item?.quantity?.toString() ?? '1',
    notes: item?.notes ?? '',
  };
}

function toDraft(category: ItemCategory, f: FormState): ItemDraft {
  const opt = (v: string) => v.trim() || undefined;
  if (category === 'tool') {
    return { category, photo: f.photo, name: f.name.trim(), itemType: f.itemType, notes: opt(f.notes) };
  }
  return {
    category,
    photo: f.photo,
    name: f.name.trim(),
    itemType: f.itemType,
    material: opt(f.material),
    color: opt(f.color),
    size: opt(f.size),
    condition: opt(f.condition),
    quantity: Number(f.quantity),
    notes: opt(f.notes),
  };
}

/** e.g. "Denim · Worn"; falls back to the item type. */
function savedSubtitle(item: Item): string {
  const parts = [labelFor(FABRICS, item.material), labelFor(CONDITIONS, item.condition)].filter(Boolean);
  return parts.length ? parts.join(' · ') : itemTypeLabel(item.category, item.itemType);
}

export function MaterialForm() {
  const { itemId } = useParams();
  const items = useMyItems();
  const addItem = useStore((s) => s.addItem);
  const updateItem = useStore((s) => s.updateItem);
  const navigate = useNavigate();

  const existing = itemId ? items.find((i) => i.id === itemId) : undefined;
  const isEdit = Boolean(itemId);

  const [category, setCategory] = useState<ItemCategory | null>(existing?.category ?? null);
  const [form, setForm] = useState<FormState>(() => toFormState(existing));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saved, setSaved] = useState<Item | null>(null);
  const [wasEmpty, setWasEmpty] = useState(false);
  const matches = useMatches();

  const closeTo = isEdit ? `/materials/${itemId}` : '/materials';

  const bar = (
    <FocusBar
      left={<p className="eyebrow">{isEdit ? 'Edit item' : 'Add to wardrobe'}</p>}
      right={
        <Link to={closeTo} className="eyebrow inline-flex items-center gap-1.5 hover:underline hover:underline-offset-4">
          <X className="h-4 w-4" /> {saved ? 'Close' : 'Cancel'}
        </Link>
      }
    />
  );

  if (isEdit && !existing && !saved) {
    return (
      <>
        {bar}
        <div className="mx-auto max-w-2xl px-4 pt-12">
          <EmptyState title="Item not found." action={<Button to="/materials">Back to my materials</Button>} />
        </div>
      </>
    );
  }

  if (saved) {
    const found = matchesUsingItem(matches, saved);
    const ready = found.filter((m) => m.state === 'MAKE_NOW').length;
    const addAnother = () => {
      setSaved(null);
      setWasEmpty(false);
      setCategory(null);
      setForm(toFormState());
      setErrors({});
    };
    return (
      <>
        {bar}
        <div role="status" className="mx-auto flex max-w-md flex-col px-4 pb-16 pt-12 sm:pt-16">
          <p className="eyebrow inline-flex items-center gap-2 text-emerald-800">
            <Check className="h-4 w-4" /> Saved
          </p>
          <h1 className="display mt-3 text-3xl sm:text-4xl">Added to your materials.</h1>

          <div className="mt-8 flex items-center gap-4 border-y border-line py-4">
            <Artwork photo={saved.photo} icon={saved.category} alt="" aspect="aspect-square" className="w-16 shrink-0" />
            <div className="min-w-0">
              <p className="truncate font-mono text-sm font-semibold uppercase">{saved.name}</p>
              <p className="eyebrow mt-1 text-muted">{savedSubtitle(saved)}</p>
            </div>
          </div>

          {found.length > 0 ? (
            <p className="mt-8 text-base">
              We found <span className="font-semibold">{found.length}</span>
              {` ${found.length === 1 ? 'project' : 'projects'} you could make with this item.`}
              {ready > 0 && <span className="block text-sm text-emerald-800">{ready} you can make right now.</span>}
            </p>
          ) : (
            <p className="mt-8 text-sm text-muted">
              No projects use this item on its own yet. It can still count toward future projects.
            </p>
          )}

          {wasEmpty ? (
            <>
              <div className="mt-8 flex flex-col gap-3">
                <Button size="lg" onClick={addAnother}>
                  <Plus className="h-4 w-4" /> Add another
                </Button>
                <Button to="/projects" variant="secondary" size="lg">
                  See what I can make <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-6 text-xs text-muted">
                Tip: basics like scissors, thread, a needle, and fabric scraps unlock most beginner projects.
              </p>
            </>
          ) : (
            <div className="mt-8 flex flex-col gap-3">
              <Button to={found.length ? `/projects?item=${saved.id}` : '/projects'} size="lg">
                See projects <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="lg" onClick={addAnother}>
                <Plus className="h-4 w-4" /> Add another
              </Button>
              <Button to="/materials" variant="ghost">
                View my materials
              </Button>
            </div>
          )}
        </div>
      </>
    );
  }

  if (!category) {
    return (
      <>
        {bar}
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-12 sm:pt-16">
          <h1 className="display text-3xl sm:text-5xl">What are you adding?</h1>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {CATEGORY_CHOICES.map(({ value, icon: Icon, hint }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className="group flex items-center gap-4 border border-ink p-5 text-left transition-all hover:bg-ink hover:text-paper sm:flex-col sm:items-start sm:gap-10 sm:p-6"
              >
                <Icon className="h-7 w-7" strokeWidth={1.25} />
                <span>
                  <span className="block font-mono text-lg font-semibold uppercase tracking-wider">
                    {CATEGORY_LABELS[value]}
                  </span>
                  <span className="mt-1 block text-sm text-muted group-hover:text-paper/70">{hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const isTool = category === 'tool';
  const typeLabel = category === 'clothing' ? 'Clothing type' : category === 'material' ? 'Material type' : 'Tool type';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Give it a name.';
    if (!form.itemType) next.itemType = 'Choose a type. It\u2019s used to match projects.';
    if (!isTool) {
      const q = Number(form.quantity);
      if (!Number.isInteger(q) || q < 1) next.quantity = 'Enter a whole number of 1 or more.';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const draft = toDraft(category, form);
    if (isEdit && existing) {
      updateItem(existing.id, draft);
      navigate(`/materials/${existing.id}`, { replace: true });
    } else {
      setWasEmpty(items.length === 0);
      setSaved(addItem(draft));
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      {bar}
      <form onSubmit={submit} noValidate className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-5">
          <div>
            <Eyebrow>Adding</Eyebrow>
            <h1 className="display mt-2 text-3xl sm:text-4xl">{CATEGORY_LABELS[category]}</h1>
          </div>
          {!isEdit && (
            <button
              type="button"
              onClick={() => setCategory(null)}
              className="eyebrow text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Change type
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-10">
          <PhotoField label="Photo" optional value={form.photo} onChange={(v) => set('photo', v)} aspect="aspect-square" />

          <div className="flex flex-col gap-5">
            <TextField
              label={isTool ? 'Tool name' : 'Name'}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder={isTool ? 'e.g. Fabric scissors' : category === 'clothing' ? 'e.g. Old blue jeans' : 'e.g. Denim scraps'}
              error={errors.name}
            />
            <SelectField
              label={typeLabel}
              value={form.itemType}
              onChange={(v) => set('itemType', v)}
              options={typeOptionsFor(category)}
              error={errors.itemType}
            />
            {!isTool && (
              <>
                <SelectField label="Material" optional value={form.material} onChange={(v) => set('material', v)} options={FABRICS} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField label="Color" optional value={form.color} onChange={(e) => set('color', e.target.value)} />
                  <TextField
                    label="Size / measurements"
                    optional
                    value={form.size}
                    onChange={(e) => set('size', e.target.value)}
                    placeholder={category === 'clothing' ? 'e.g. M, W32' : 'e.g. 40 × 50 cm'}
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectField label="Condition" optional value={form.condition} onChange={(v) => set('condition', v)} options={CONDITIONS} />
                  <TextField
                    label="Quantity"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => set('quantity', e.target.value)}
                    error={errors.quantity}
                  />
                </div>
              </>
            )}
            <TextArea label="Notes" optional value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
          <Button to={closeTo} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" size="lg">
            {isEdit ? 'Save changes' : 'Save item'}
          </Button>
        </div>
      </form>
    </>
  );
}
