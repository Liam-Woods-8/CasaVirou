import { useState } from 'react';
import { Backpack, Scissors, Shirt, Sparkles, type LucideIcon } from 'lucide-react';
import type { ArtVariant, ImageRef, ItemCategory, ProjectOutput } from '../../types';

const ART_CLASSES: Record<ArtVariant, string> = {
  stripes: 'art-stripes',
  grid: 'art-grid',
  dots: 'art-dots',
  hatch: 'art-hatch',
  weave: 'art-weave',
  plain: 'art-plain',
};

const ICONS: Record<ProjectOutput | ItemCategory, LucideIcon> = {
  garment: Shirt,
  bag: Backpack,
  accessory: Sparkles,
  clothing: Shirt,
  material: Sparkles,
  tool: Scissors,
};

interface ArtworkProps {
  /** A user's own photo (data URL). Takes priority over `image`. */
  photo?: string;
  /** A curated image shipped with the app. */
  image?: ImageRef;
  art?: ArtVariant;
  icon?: ProjectOutput | ItemCategory;
  label?: string;
  alt: string;
  /** Tailwind aspect ratio class. */
  aspect?: string;
  /** Rendered width hint for responsive images, e.g. "(min-width: 768px) 25vw, 50vw". */
  sizes?: string;
  className?: string;
}

/** Shows a photo or curated image, or a textile-pattern placeholder when there isn't one (or it fails to load). */
export function Artwork({
  photo,
  image,
  art = 'plain',
  icon,
  label,
  alt,
  aspect = 'aspect-[4/5]',
  sizes = '100vw',
  className = '',
}: ArtworkProps) {
  const src = photo ?? image?.src;
  const [failedSrc, setFailedSrc] = useState<string>();

  if (src && failedSrc !== src) {
    return (
      <div className={`${aspect} overflow-hidden bg-paper-deep ${className}`}>
        <img
          src={src}
          srcSet={photo ? undefined : image?.srcSet}
          sizes={photo || !image?.srcSet ? undefined : sizes}
          alt={photo ? alt : (image?.alt ?? alt)}
          title={photo ? undefined : image?.credit}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
      </div>
    );
  }
  const Icon = icon ? ICONS[icon] : null;
  return (
    <div
      role="img"
      aria-label={alt}
      className={`${aspect} ${ART_CLASSES[art]} relative flex items-center justify-center overflow-hidden ${className}`}
    >
      {Icon && <Icon aria-hidden className="h-10 w-10 text-ink/25" strokeWidth={1.25} />}
      {label && (
        <span className="eyebrow absolute bottom-3 left-3 right-3 truncate text-ink/45">{label}</span>
      )}
    </div>
  );
}
