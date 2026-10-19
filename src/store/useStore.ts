import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { getProject } from '../data/projects';
import { SEED_ITEMS, SEED_POSTS, SEED_USER_PROJECTS, SEED_USERS } from '../data/seed';
import type { ExplorePost, Item, ItemDraft, User, UserProject } from '../types';
import { hashPassword, uid } from '../utils/id';

export const STORAGE_ERROR_EVENT = 'stitch:storage-error';

/** localStorage wrapper that reports quota errors instead of throwing inside React. */
const safeStorage: StateStorage = {
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      window.dispatchEvent(new Event(STORAGE_ERROR_EVENT));
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
};

export interface SignUpInput {
  username: string;
  email: string;
  password: string;
}

export interface ShareInput {
  userProjectId: string;
  title: string;
  description: string;
  materialsUsed: string[];
  photo?: string;
}

interface State {
  users: User[];
  sessionUserId: string | null;
  items: Item[];
  userProjects: UserProject[];
  posts: ExplorePost[];

  signUp: (input: SignUpInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  signIn: (identifier: string, password: string) => Promise<boolean>;
  signOut: () => void;
  updateProfile: (patch: Pick<User, 'username' | 'bio'> & { avatar?: string }) => string | null;

  addItem: (draft: ItemDraft) => Item;
  updateItem: (id: string, draft: ItemDraft) => void;
  deleteItem: (id: string) => void;

  saveProject: (projectId: string) => void;
  unsaveProject: (projectId: string) => void;
  startProject: (projectId: string) => UserProject;
  setStep: (projectId: string, step: number) => void;
  completeProject: (projectId: string) => void;
  setFinishedPhoto: (projectId: string, photo: string) => void;
  /** After finishing: drop garments that were used up and add any leftover scraps. */
  updateWardrobeAfterProject: (projectId: string, change: { removeItemIds: string[]; addItems: ItemDraft[] }) => void;
  sharePost: (input: ShareInput) => ExplorePost;
}

const now = () => new Date().toISOString();

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const requireUser = (): string => {
        const id = get().sessionUserId;
        if (!id) throw new Error('Not signed in');
        return id;
      };

      const findUserProject = (projectId: string) => {
        const userId = requireUser();
        return get().userProjects.find((up) => up.userId === userId && up.projectId === projectId);
      };

      const patchUserProject = (id: string, patch: Partial<UserProject>) =>
        set((s) => ({
          userProjects: s.userProjects.map((up) => (up.id === id ? { ...up, ...patch, updatedAt: now() } : up)),
        }));

      return {
        users: SEED_USERS,
        sessionUserId: null,
        items: SEED_ITEMS,
        userProjects: SEED_USER_PROJECTS,
        posts: SEED_POSTS,

        signUp: async ({ username, email, password }) => {
          const { users } = get();
          const uname = username.trim();
          const mail = email.trim().toLowerCase();
          if (users.some((u) => u.username.toLowerCase() === uname.toLowerCase())) {
            return { ok: false, error: 'That username is taken.' };
          }
          if (users.some((u) => u.email.toLowerCase() === mail)) {
            return { ok: false, error: 'An account with that email already exists.' };
          }
          const user: User = {
            id: uid('u'),
            username: uname,
            email: mail,
            passwordHash: await hashPassword(password),
            bio: '',
            createdAt: now(),
          };
          set((s) => ({ users: [...s.users, user], sessionUserId: user.id }));
          return { ok: true };
        },

        signIn: async (identifier, password) => {
          const key = identifier.trim().toLowerCase();
          const user = get().users.find(
            (u) => u.passwordHash && (u.email.toLowerCase() === key || u.username.toLowerCase() === key),
          );
          if (!user) return false;
          if ((await hashPassword(password)) !== user.passwordHash) return false;
          set({ sessionUserId: user.id });
          return true;
        },

        signOut: () => set({ sessionUserId: null }),

        updateProfile: ({ username, bio, avatar }) => {
          const userId = requireUser();
          const uname = username.trim();
          if (get().users.some((u) => u.id !== userId && u.username.toLowerCase() === uname.toLowerCase())) {
            return 'That username is taken.';
          }
          set((s) => ({
            users: s.users.map((u) => (u.id === userId ? { ...u, username: uname, bio: bio.trim(), avatar } : u)),
          }));
          return null;
        },

        addItem: (draft) => {
          const item: Item = { ...draft, id: uid('i'), ownerId: requireUser(), createdAt: now() };
          set((s) => ({ items: [...s.items, item] }));
          return item;
        },

        updateItem: (id, draft) => {
          const userId = requireUser();
          set((s) => ({
            items: s.items.map((i) => (i.id === id && i.ownerId === userId ? { ...i, ...draft } : i)),
          }));
        },

        deleteItem: (id) => {
          const userId = requireUser();
          set((s) => ({ items: s.items.filter((i) => !(i.id === id && i.ownerId === userId)) }));
        },

        saveProject: (projectId) => {
          if (findUserProject(projectId)) return;
          const up: UserProject = {
            id: uid('up'),
            userId: requireUser(),
            projectId,
            status: 'SAVED',
            currentStep: 0,
            savedAt: now(),
            updatedAt: now(),
          };
          set((s) => ({ userProjects: [...s.userProjects, up] }));
        },

        unsaveProject: (projectId) => {
          const existing = findUserProject(projectId);
          if (!existing || existing.status !== 'SAVED') return;
          set((s) => ({ userProjects: s.userProjects.filter((up) => up.id !== existing.id) }));
        },

        startProject: (projectId) => {
          const existing = findUserProject(projectId);
          if (existing) {
            if (existing.status === 'SAVED') {
              patchUserProject(existing.id, { status: 'IN_PROGRESS', startedAt: now(), currentStep: 0 });
            }
            return findUserProject(projectId)!;
          }
          const up: UserProject = {
            id: uid('up'),
            userId: requireUser(),
            projectId,
            status: 'IN_PROGRESS',
            currentStep: 0,
            savedAt: now(),
            startedAt: now(),
            updatedAt: now(),
          };
          set((s) => ({ userProjects: [...s.userProjects, up] }));
          return up;
        },

        setStep: (projectId, step) => {
          const existing = findUserProject(projectId);
          const project = getProject(projectId);
          if (!existing || !project || existing.status === 'COMPLETED') return;
          const clamped = Math.max(0, Math.min(step, project.steps.length - 1));
          patchUserProject(existing.id, { currentStep: clamped });
        },

        completeProject: (projectId) => {
          const existing = findUserProject(projectId);
          const project = getProject(projectId);
          if (!existing || !project || existing.status === 'COMPLETED') return;
          patchUserProject(existing.id, {
            status: 'COMPLETED',
            currentStep: project.steps.length - 1,
            completedAt: now(),
          });
        },

        setFinishedPhoto: (projectId, photo) => {
          const existing = findUserProject(projectId);
          if (existing) patchUserProject(existing.id, { finishedPhoto: photo });
        },

        updateWardrobeAfterProject: (projectId, { removeItemIds, addItems }) => {
          const existing = findUserProject(projectId);
          if (!existing || existing.status !== 'COMPLETED' || existing.wardrobeUpdated) return;
          const userId = requireUser();
          const remove = new Set(removeItemIds);
          const usedUpItems = get()
            .items.filter((i) => i.ownerId === userId && remove.has(i.id))
            .map((i) => i.name);
          const added: Item[] = addItems.map((draft) => ({ ...draft, id: uid('i'), ownerId: userId, createdAt: now() }));
          set((s) => ({
            items: [...s.items.filter((i) => !(i.ownerId === userId && remove.has(i.id))), ...added],
          }));
          patchUserProject(existing.id, { wardrobeUpdated: true, usedUpItems });
        },

        sharePost: ({ userProjectId, title, description, materialsUsed, photo }) => {
          const userId = requireUser();
          const up = get().userProjects.find((p) => p.id === userProjectId && p.userId === userId);
          if (!up) throw new Error('Project not found');
          const project = getProject(up.projectId);
          const post: ExplorePost = {
            id: uid('p'),
            userId,
            projectId: up.projectId,
            title: title.trim(),
            description: description.trim(),
            materialsUsed,
            photo,
            art: project?.art ?? 'plain',
            createdAt: now(),
          };
          set((s) => ({ posts: [post, ...s.posts] }));
          patchUserProject(up.id, { postId: post.id, finishedPhoto: photo ?? up.finishedPhoto });
          return post;
        },
      };
    },
    {
      name: 'stitch-v1',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ users, sessionUserId, items, userProjects, posts }) => ({
        users,
        sessionUserId,
        items,
        userProjects,
        posts,
      }),
      // Fall back to defaults for any field that isn't the expected shape.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        const list = <T,>(value: T[] | undefined, fallback: T[]) => (Array.isArray(value) ? value : fallback);
        const users = list(p.users, current.users);
        return {
          ...current,
          users,
          sessionUserId:
            typeof p.sessionUserId === 'string' && users.some((u) => u.id === p.sessionUserId) ? p.sessionUserId : null,
          items: list(p.items, current.items),
          userProjects: list(p.userProjects, current.userProjects),
          posts: list(p.posts, current.posts),
        };
      },
    },
  ),
);
