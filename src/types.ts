export type ItemCategory = 'clothing' | 'material' | 'tool';

export type ArtVariant = 'stripes' | 'grid' | 'dots' | 'hatch' | 'weave' | 'plain';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  bio: string;
  avatar?: string;
  createdAt: string;
}

/** An entry in a user's digital wardrobe: clothing, material, or tool. */
export interface Item {
  id: string;
  ownerId: string;
  category: ItemCategory;
  name: string;
  /** Clothing type, material type, or tool type depending on category. */
  itemType: string;
  /** Fabric/fiber. Not used for tools. */
  material?: string;
  color?: string;
  size?: string;
  condition?: string;
  quantity?: number;
  notes?: string;
  photo?: string;
  createdAt: string;
}

export type ItemDraft = Omit<Item, 'id' | 'ownerId' | 'createdAt'>;

/**
 * An item satisfies a requirement when every specified field matches
 * (any-of within a field).
 */
export interface RequirementMatch {
  categories?: ItemCategory[];
  itemTypes?: string[];
  materials?: string[];
}

export interface Requirement {
  id: string;
  label: string;
  kind: 'material' | 'tool';
  optional?: boolean;
  match: RequirementMatch;
}

/** A curated image shipped with the app (project covers, tutorial steps). */
export interface ImageRef {
  src: string;
  /** Describes what's shown, e.g. "Frayed denim cut-offs laid flat". */
  alt: string;
  /** Responsive candidates, e.g. "/a-400.webp 400w, /a-800.webp 800w". */
  srcSet?: string;
  /** Photographer or source; required for anything you didn't shoot yourself. */
  credit?: string;
}

export interface TutorialStep {
  title: string;
  instructions: string;
  /** Requirement ids relevant to this step. */
  uses: string[];
  image?: ImageRef;
}

/** What kind of work the project is. */
export type ProjectCategory = 'repair' | 'alteration' | 'reconstruction' | 'accessory';

/** What the finished piece is. Drives artwork icons and Explore's Clothing/Accessories filters. */
export type ProjectOutput = 'garment' | 'bag' | 'accessory';

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  minutes: number;
  category: ProjectCategory;
  output: ProjectOutput;
  usesScraps: boolean;
  /** Pattern placeholder, shown when there's no cover or it fails to load. */
  art: ArtVariant;
  cover?: ImageRef;
  requirements: Requirement[];
  steps: TutorialStep[];
}

export type UserProjectStatus = 'SAVED' | 'IN_PROGRESS' | 'COMPLETED';

export interface UserProject {
  id: string;
  userId: string;
  projectId: string;
  status: UserProjectStatus;
  /** Zero-based index of the step the user is on. */
  currentStep: number;
  savedAt: string;
  startedAt?: string;
  completedAt?: string;
  finishedPhoto?: string;
  postId?: string;
  /** Set once the user has answered "what happened to the clothes you used?" */
  wardrobeUpdated?: boolean;
  /** Names of garments removed from the wardrobe because this project used them up. */
  usedUpItems?: string[];
  updatedAt: string;
}

export interface ExplorePost {
  id: string;
  userId: string;
  /** The original project template, so MAKE THIS can open it. */
  projectId: string;
  title: string;
  description: string;
  materialsUsed: string[];
  photo?: string;
  art: ArtVariant;
  createdAt: string;
}

export type MatchState = 'MAKE_NOW' | 'ALMOST_READY' | 'POSSIBLE' | 'LOW';

export interface RequirementResult {
  requirement: Requirement;
  /** Items in the user's wardrobe that satisfy this requirement. */
  matchedBy: Item[];
}

export interface ProjectMatch {
  project: Project;
  have: RequirementResult[];
  missing: RequirementResult[];
  /** Non-optional requirements the user has, and the total non-optional count. */
  haveCount: number;
  requiredCount: number;
  percent: number;
  state: MatchState;
}
