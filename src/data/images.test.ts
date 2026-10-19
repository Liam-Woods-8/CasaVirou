import { describe, expect, it } from 'vitest';
import type { ImageRef } from '../types';
import { IMAGE_WIDTHS, projectImage } from './images';
import { PROJECTS } from './projects';

// Keys look like "../../public/images/projects/<id>/cover.jpg"; files are listed, not loaded.
const PUBLIC_FILES = new Set(
  Object.keys(import.meta.glob('../../public/images/**/*.{jpg,jpeg,png,webp,avif}')).map((k) =>
    k.replace('../../public', ''),
  ),
);

function filesFor(image: ImageRef): string[] {
  const fromSrcSet = image.srcSet?.split(',').map((c) => c.trim().split(/\s+/)[0]) ?? [];
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return [image.src, ...fromSrcSet].map((file) => (base && file.startsWith(base) ? file.slice(base.length) : file));
}

const declared: { where: string; image: ImageRef }[] = PROJECTS.flatMap((p) => [
  ...(p.cover ? [{ where: `${p.id} cover`, image: p.cover }] : []),
  ...p.steps.flatMap((s, i) => (s.image ? [{ where: `${p.id} step ${i + 1}`, image: s.image }] : [])),
]);

describe('projectImage', () => {
  it('builds a single-file path', () => {
    expect(projectImage('cutoff-shorts', 'cover.jpg', 'Cut-offs')).toEqual({
      src: '/images/projects/cutoff-shorts/cover.jpg',
      alt: 'Cut-offs',
      credit: undefined,
    });
  });

  it('builds a responsive srcSet', () => {
    const img = projectImage('cutoff-shorts', 'cover', 'Cut-offs', { widths: IMAGE_WIDTHS });
    expect(img.src).toBe('/images/projects/cutoff-shorts/cover-800.webp');
    expect(img.srcSet).toBe(
      '/images/projects/cutoff-shorts/cover-400.webp 400w, /images/projects/cutoff-shorts/cover-800.webp 800w, /images/projects/cutoff-shorts/cover-1200.webp 1200w',
    );
  });
});

describe('curated project images', () => {
  it('have real alt text', () => {
    for (const { where, image } of declared) {
      expect(image.alt.trim().length, `${where} needs alt text`).toBeGreaterThan(3);
    }
  });

  it('point to files that exist in public/', () => {
    for (const { where, image } of declared) {
      for (const file of filesFor(image)) expect(PUBLIC_FILES.has(file), `${where}: missing public${file}`).toBe(true);
    }
  });
});
