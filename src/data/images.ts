import type { ImageRef } from '../types';

/** Widths to export when a curated image is responsive. */
export const IMAGE_WIDTHS = [400, 800, 1200];

interface ProjectImageOptions {
  /** Set when you exported `<file>-400.webp`, `<file>-800.webp`, … instead of a single file. */
  widths?: number[];
  credit?: string;
}

/**
 * Curated image stored in public/images/projects/<projectId>/.
 *
 *   projectImage('cutoff-shorts', 'cover.jpg', 'Frayed denim cut-offs')
 *     → /images/projects/cutoff-shorts/cover.jpg
 *   projectImage('cutoff-shorts', 'cover', 'Frayed denim cut-offs', { widths: IMAGE_WIDTHS })
 *     → cover-400.webp, cover-800.webp, cover-1200.webp
 */
export function projectImage(projectId: string, file: string, alt: string, options: ProjectImageOptions = {}): ImageRef {
  const base = `${import.meta.env.BASE_URL}images/projects/${projectId}/`;
  const { widths, credit } = options;
  if (!widths?.length) return { src: base + file, alt, credit };
  const candidates = widths.map((w) => `${base}${file}-${w}.webp ${w}w`);
  const fallback = widths.find((w) => w >= 800) ?? widths[widths.length - 1];
  return { src: `${base}${file}-${fallback}.webp`, srcSet: candidates.join(', '), alt, credit };
}
