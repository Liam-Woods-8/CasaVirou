import { Plus } from 'lucide-react';
import { Button } from './ui/Button';

/** First-run prompt shown wherever an empty wardrobe would otherwise leave a dead end. */
export function EmptyWardrobe() {
  return (
    <section className="border border-ink px-6 py-10 sm:px-10 sm:py-14">
      <h2 className="display text-2xl sm:text-4xl">Let&rsquo;s see what you can make.</h2>
      <p className="mt-3 max-w-md text-sm text-muted sm:text-base">
        Add a few things you already own. Old clothing, fabric scraps, sewing supplies, and tools all work.
      </p>
      <Button to="/materials/new" size="lg" className="mt-7">
        <Plus className="h-4 w-4" /> Add first material
      </Button>
    </section>
  );
}
