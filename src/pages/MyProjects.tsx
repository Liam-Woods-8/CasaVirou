import { Link, Navigate, Outlet, useParams } from 'react-router';
import { ArrowRight, Check } from 'lucide-react';
import { getProject } from '../data/projects';
import { useMyUserProjects } from '../store/selectors';
import type { Project, UserProject } from '../types';
import { formatDate, formatTime } from '../utils/format';
import { Page } from '../components/layout/Layouts';
import { Artwork } from '../components/ui/Artwork';
import { Button } from '../components/ui/Button';
import { Difficulty, EmptyState, PageHeader, ProgressBar, Tabs } from '../components/ui/primitives';

export function ProjectsLayout() {
  return (
    <Page>
      <Tabs
        className="mb-8"
        items={[
          { to: '/projects', label: 'Discover', end: true },
          { to: '/projects/mine', label: 'My Projects' },
        ]}
      />
      <Outlet />
    </Page>
  );
}

const TABS = {
  saved: 'SAVED',
  'in-progress': 'IN_PROGRESS',
  completed: 'COMPLETED',
} as const;

type TabKey = keyof typeof TABS;

export function MyProjectsIndex() {
  const mine = useMyUserProjects();
  const tab: TabKey = mine.some((up) => up.status === 'IN_PROGRESS') ? 'in-progress' : 'saved';
  return <Navigate to={`/projects/mine/${tab}`} replace />;
}

interface Entry {
  up: UserProject;
  project: Project;
}

function Row({ up, project }: Entry) {
  return (
    <li className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 border-b border-line py-5 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center sm:gap-6">
      <Link to={`/projects/${project.id}`} className="block border border-line transition-colors hover:border-ink">
        <Artwork
          photo={up.status === 'COMPLETED' ? up.finishedPhoto : undefined}
          image={project.cover}
          sizes="160px"
          art={project.art}
          icon={project.output}
          alt={project.title}
          aspect="aspect-square"
        />
      </Link>
      <div className="min-w-0">
        <Link to={`/projects/${project.id}`} className="font-mono text-sm font-semibold uppercase tracking-wide hover:underline hover:underline-offset-4 sm:text-base">
          {project.title}
        </Link>

        {up.status === 'SAVED' && (
          <div className="eyebrow mt-2 flex flex-wrap gap-x-3 text-muted">
            <Difficulty level={project.difficulty} className="text-ink" />
            <span>{formatTime(project.minutes)}</span>
          </div>
        )}

        {up.status === 'IN_PROGRESS' && (
          <div className="mt-2 max-w-sm">
            <p className="text-sm">
              Step {up.currentStep + 1} of {project.steps.length}: {project.steps[up.currentStep]?.title}
            </p>
            <ProgressBar className="mt-2" value={up.currentStep} total={project.steps.length} />
          </div>
        )}

        {up.status === 'COMPLETED' && (
          <div className="mt-2 flex flex-col gap-1">
            <p className="eyebrow inline-flex items-center gap-1.5 text-emerald-800">
              <Check className="h-3.5 w-3.5" /> Completed {up.completedAt && formatDate(up.completedAt)}
            </p>
            <p className="text-xs text-muted">
              {up.postId ? 'Shared to Explore' : up.finishedPhoto ? 'Finished photo added' : 'No finished photo yet'}
            </p>
          </div>
        )}
      </div>

      <div className="col-span-2 flex gap-2 sm:col-span-1 sm:justify-end">
        {up.status === 'SAVED' && (
          <Button to={`/projects/${project.id}`} variant="secondary" className="w-full sm:w-auto">
            View project
          </Button>
        )}
        {up.status === 'IN_PROGRESS' && (
          <Button to={`/projects/${project.id}/tutorial`} className="w-full sm:w-auto">
            Continue project <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {up.status === 'COMPLETED' &&
          (up.postId ? (
            <Button to={`/explore/${up.postId}`} variant="secondary" className="w-full sm:w-auto">
              View post
            </Button>
          ) : (
            <Button to={`/projects/${project.id}/share`} className="w-full sm:w-auto">
              Share
            </Button>
          ))}
      </div>
    </li>
  );
}

const EMPTY: Record<TabKey, { title: string; action: React.ReactNode }> = {
  saved: { title: 'Nothing saved yet.', action: <Button to="/projects">Discover projects</Button> },
  'in-progress': { title: 'You\u2019re not working on anything yet.', action: <Button to="/projects">Find a project</Button> },
  completed: { title: 'Your finished projects will appear here.', action: <Button to="/projects">Start a project</Button> },
};

export function MyProjects() {
  const { tab } = useParams();
  const mine = useMyUserProjects();

  if (!tab || !(tab in TABS)) return <Navigate to="/projects/mine" replace />;
  const key = tab as TabKey;

  const entries = (status: UserProject['status']): Entry[] =>
    mine
      .filter((up) => up.status === status)
      .map((up) => ({ up, project: getProject(up.projectId) }))
      .filter((e): e is Entry => Boolean(e.project));

  const list = entries(TABS[key]);

  return (
    <>
      <PageHeader title="My Projects" subtitle="Projects you want to make, are making, and have made." />
      <Tabs
        className="mt-6"
        items={[
          { to: '/projects/mine/saved', label: 'Saved', count: entries('SAVED').length },
          { to: '/projects/mine/in-progress', label: 'In Progress', count: entries('IN_PROGRESS').length },
          { to: '/projects/mine/completed', label: 'Completed', count: entries('COMPLETED').length },
        ]}
      />
      <div className="mt-2">
        {list.length === 0 ? (
          <div className="mt-8">
            <EmptyState title={EMPTY[key].title} action={EMPTY[key].action} />
          </div>
        ) : (
          <ul>
            {list.map((e) => (
              <Row key={e.up.id} {...e} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
