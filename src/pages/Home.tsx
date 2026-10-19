import { Link } from 'react-router';
import { ArrowRight, Plus } from 'lucide-react';
import { getProject } from '../data/projects';
import { useCurrentUser, useMatches, useMyItems, useMyUserProjects, useSortedPosts } from '../store/selectors';
import { EmptyWardrobe } from '../components/EmptyWardrobe';
import { ItemCard } from '../components/ItemCard';
import { PostCard } from '../components/PostCard';
import { ProjectCard } from '../components/ProjectCard';
import { Page } from '../components/layout/Layouts';
import { Artwork } from '../components/ui/Artwork';
import { Button } from '../components/ui/Button';
import { EmptyState, Eyebrow, ProgressBar, SectionHeading } from '../components/ui/primitives';

const grid = 'grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4';

export function Home() {
  const user = useCurrentUser();
  const items = useMyItems();
  const matches = useMatches();
  const userProjects = useMyUserProjects();
  const posts = useSortedPosts().filter((p) => p.userId !== user?.id).slice(0, 4);

  const active = userProjects.find((up) => up.status === 'IN_PROGRESS');
  const activeProject = active ? getProject(active.projectId) : undefined;
  const wardrobeEmpty = items.length === 0;
  const recommended = matches.filter((m) => m.percent > 0).slice(0, 4);
  const sections = [
    ...(!wardrobeEmpty || active ? ['continue'] : []),
    ...(!wardrobeEmpty ? ['make', 'materials'] : []),
    'explore',
  ];
  const index = (key: string) => String(sections.indexOf(key) + 1).padStart(2, '0');

  const seeAll = (to: string, label = 'See all') => (
    <Link to={to} className="eyebrow inline-flex shrink-0 items-center gap-1.5 hover:underline hover:underline-offset-4">
      {label} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );

  return (
    <Page>
      <header className="border-b border-ink pb-6">
        <Eyebrow className="mb-3">Home</Eyebrow>
        <h1 className="display text-3xl sm:text-5xl">Hi, {user?.username}.</h1>
      </header>

      {wardrobeEmpty && (
        <div className="mt-10">
          <EmptyWardrobe />
        </div>
      )}

      {sections.includes('continue') && (
        <section className="mt-10">
          <SectionHeading index={index('continue')} title="Continue making" />
          {active && activeProject ? (
            <Link
              to={`/projects/${activeProject.id}/tutorial`}
              className="group grid grid-cols-[96px_minmax(0,1fr)] gap-4 border border-ink p-3 transition-colors hover:bg-ink/[0.03] sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-center sm:gap-8 sm:p-4"
            >
              <Artwork image={activeProject.cover} sizes="160px" art={activeProject.art} icon={activeProject.output} alt={activeProject.title} aspect="aspect-square" />
              <div className="min-w-0">
                <p className="font-mono text-base font-semibold uppercase tracking-wide sm:text-xl">{activeProject.title}</p>
                <p className="mt-2 text-sm">
                  Step {active.currentStep + 1} of {activeProject.steps.length}: {activeProject.steps[active.currentStep]?.title}
                </p>
                <ProgressBar className="mt-3 max-w-sm" value={active.currentStep} total={activeProject.steps.length} />
              </div>
              <span className="col-span-2 inline-flex h-11 items-center justify-center gap-2 border border-ink bg-ink px-5 font-mono text-xs uppercase tracking-wider text-paper transition-all group-hover:bg-paper group-hover:text-ink sm:col-span-1">
                Continue <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ) : (
            <EmptyState title="You're not working on anything yet." action={<Button to="/projects">Find a project</Button>} />
          )}
        </section>
      )}

      {!wardrobeEmpty && (
        <>
          <section className="mt-16">
            <SectionHeading index={index('make')} title="What can I make?" action={seeAll('/projects', 'Discover')} />
            {recommended.length === 0 ? (
              <EmptyState
                title="No matches yet."
                body="Try adding basics like scissors, thread, or fabric scraps."
                action={<Button to="/projects">Browse all projects</Button>}
              />
            ) : (
              <div className={grid}>
                {recommended.map((m) => (
                  <ProjectCard key={m.project.id} match={m} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-16">
            <SectionHeading
              index={index('materials')}
              title="Your materials"
              action={
                <div className="flex items-center gap-4">
                  {seeAll('/materials', `View all (${items.length})`)}
                  <Link to="/materials/new" className="eyebrow inline-flex items-center gap-1 hover:underline hover:underline-offset-4">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Link>
                </div>
              }
            />
            <div className={grid}>
              {items.slice(0, 4).map((i) => (
                <ItemCard key={i.id} item={i} />
              ))}
            </div>
          </section>
        </>
      )}

      <section className="mt-16">
        <SectionHeading index={index('explore')} title="Explore" action={seeAll('/explore')} />
        {posts.length === 0 ? (
          <EmptyState title="Nothing from the community yet." body="Finished projects shared by others will appear here." />
        ) : (
          <div className={grid}>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}
