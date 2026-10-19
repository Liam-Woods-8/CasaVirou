import { useMemo } from 'react';
import { PROJECTS } from '../data/projects';
import type { ProjectMatch } from '../types';
import { matchAll, matchProject } from '../utils/matching';
import { useStore } from './useStore';

export function useCurrentUser() {
  const users = useStore((s) => s.users);
  const sessionUserId = useStore((s) => s.sessionUserId);
  return useMemo(() => users.find((u) => u.id === sessionUserId) ?? null, [users, sessionUserId]);
}

export function useUserById(id: string | undefined) {
  const users = useStore((s) => s.users);
  return useMemo(() => users.find((u) => u.id === id) ?? null, [users, id]);
}

export function useMyItems() {
  const items = useStore((s) => s.items);
  const sessionUserId = useStore((s) => s.sessionUserId);
  return useMemo(
    () =>
      items
        .filter((i) => i.ownerId === sessionUserId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [items, sessionUserId],
  );
}

export function useMyUserProjects() {
  const userProjects = useStore((s) => s.userProjects);
  const sessionUserId = useStore((s) => s.sessionUserId);
  return useMemo(
    () =>
      userProjects
        .filter((up) => up.userId === sessionUserId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [userProjects, sessionUserId],
  );
}

export function useUserProject(projectId: string | undefined) {
  const mine = useMyUserProjects();
  return useMemo(() => mine.find((up) => up.projectId === projectId) ?? null, [mine, projectId]);
}

export function useMatches(): ProjectMatch[] {
  const items = useMyItems();
  return useMemo(() => matchAll(PROJECTS, items), [items]);
}

export function useProjectMatch(projectId: string | undefined): ProjectMatch | null {
  const items = useMyItems();
  return useMemo(() => {
    const project = PROJECTS.find((p) => p.id === projectId);
    return project ? matchProject(project, items) : null;
  }, [items, projectId]);
}

export function useSortedPosts() {
  const posts = useStore((s) => s.posts);
  return useMemo(() => [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [posts]);
}
