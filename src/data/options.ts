import type { ItemCategory, ProjectCategory, ProjectOutput } from '../types';

export interface Option {
  value: string;
  label: string;
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  clothing: 'Clothing',
  material: 'Material',
  tool: 'Tool',
};

export const CLOTHING_TYPES: Option[] = [
  { value: 'jeans', label: 'Jeans' },
  { value: 't-shirt', label: 'T-Shirt' },
  { value: 'shirt', label: 'Shirt / button-up' },
  { value: 'hoodie', label: 'Hoodie / sweatshirt' },
  { value: 'sweater', label: 'Sweater' },
  { value: 'jacket', label: 'Jacket' },
  { value: 'dress', label: 'Dress' },
  { value: 'skirt', label: 'Skirt' },
  { value: 'other', label: 'Other' },
];

export const MATERIAL_TYPES: Option[] = [
  { value: 'scraps', label: 'Fabric scraps' },
  { value: 'fabric', label: 'Fabric yardage' },
  { value: 'thread', label: 'Thread' },
  { value: 'button-snap', label: 'Buttons / snaps' },
  { value: 'zipper', label: 'Zipper' },
  { value: 'elastic', label: 'Elastic' },
  { value: 'webbing', label: 'Webbing / strap' },
  { value: 'cord', label: 'Cord / ribbon' },
  { value: 'interfacing', label: 'Interfacing' },
  { value: 'other', label: 'Other' },
];

export const TOOL_TYPES: Option[] = [
  { value: 'scissors', label: 'Scissors' },
  { value: 'sewing-machine', label: 'Sewing machine' },
  { value: 'pins', label: 'Pins' },
  { value: 'needle', label: 'Hand needle' },
  { value: 'measuring-tape', label: 'Measuring tape' },
  { value: 'iron', label: 'Iron' },
  { value: 'fabric-chalk', label: 'Fabric chalk' },
  { value: 'seam-ripper', label: 'Seam ripper' },
  { value: 'other', label: 'Other' },
];

export const FABRICS: Option[] = [
  { value: 'denim', label: 'Denim' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'canvas', label: 'Canvas' },
  { value: 'jersey', label: 'Jersey' },
  { value: 'wool', label: 'Wool' },
  { value: 'linen', label: 'Linen' },
  { value: 'flannel', label: 'Flannel' },
  { value: 'fleece', label: 'Fleece' },
  { value: 'polyester', label: 'Polyester' },
  { value: 'leather', label: 'Leather' },
  { value: 'other', label: 'Other' },
];

export const CONDITIONS: Option[] = [
  { value: 'like-new', label: 'Like new' },
  { value: 'worn', label: 'Worn' },
  { value: 'damaged', label: 'Damaged / stained' },
  { value: 'scrap-only', label: 'Scrap only' },
];

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  repair: 'Repair',
  alteration: 'Alteration',
  reconstruction: 'Reconstruction',
  accessory: 'Accessory',
};

export const PROJECT_OUTPUT_LABELS: Record<ProjectOutput, string> = {
  garment: 'Garment',
  bag: 'Bag',
  accessory: 'Accessory',
};

/** Tools beyond basic hand tools. Used by the "No special tools" filter. */
export const SPECIAL_TOOL_TYPES = ['sewing-machine', 'iron'];

export function typeOptionsFor(category: ItemCategory): Option[] {
  if (category === 'clothing') return CLOTHING_TYPES;
  if (category === 'material') return MATERIAL_TYPES;
  return TOOL_TYPES;
}

export function labelFor(options: Option[], value?: string): string {
  if (!value) return '';
  return options.find((o) => o.value === value)?.label ?? value;
}

export function itemTypeLabel(category: ItemCategory, value: string): string {
  return labelFor(typeOptionsFor(category), value);
}
