import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Check } from 'lucide-react';
import { PROJECT_CATEGORY_LABELS, PROJECT_OUTPUT_LABELS } from '../data/options';
import { getProject } from '../data/projects';
import { useCurrentUser, useProjectMatch, useSortedPosts, useUserProject } from '../store/selectors';
import { useStore } from '../store/useStore';
import type { MatchState } from '../types';
import { specialTools } from '../utils/discovery';
import { DIFFICULTY_LABELS, formatDate, formatTime, pad2 } from '../utils/format';
import { MATCH_STATE_LABELS, splitRequirements } from '../utils/matching';
import { PostCard } from '../components/PostCard';
import { RequirementList } from '../components/RequirementList';
import { Page } from '../components/layout/Layouts';
import { Artwork } from '../components/ui/Artwork';
import { Button } from '../components/ui/Button';
import { Difficulty, EmptyState, Eyebrow, ProgressBar, SectionHeading } from '../components/ui/primitives';

const STATE_TONE: Partial<Record<MatchState, string>> = {
  MAKE_NOW: 'text-emerald-800',
  ALMOST_READY: 'text-amber-800',
};

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="eyebrow text-muted">{label}</dt>
      <dd className="text-right text-sm">{children}</dd>
    </div>
  );
}

export function ProjectDetails() {
  const { projectId } = useParams();
  const project = getProject(projectId);
  const user = useCurrentUser();
  const match = useProjectMatch(projectId);
  const userProject = useUserProject(projectId);
  const posts = useSortedPosts().filter((p) => p.projectId === projectId);
  const saveProject = useStore((s) => s.saveProject);
  const unsaveProject = useStore((s) => s.unsaveProject);
  const startProject = useStore((s) => s.startProject);
  const navigate = useNavigate();
  const location = useLocation();

  if (!project || !match) {
    return (
      <Page narrow>
        <EmptyState
          title="Project not found."
          body="This project may have been removed."
          action={<Button to={user ? '/projects' : '/explore'}>Browse projects</Button>}
        />
      </Page>
    );
  }

  const fromPost = (location.state as { fromPost?: string } | null)?.fromPost;
  const { have, missing, optionalHave } = splitRequirements(match);
  const optional = project.requirements
    .filter((r) => r.optional)
    .map((r) => ({ label: r.label, owned: !!user && optionalHave.some((x) => x.requirement.id === r.id) }));
  const labelById = new Map(project.requirements.map((r) => [r.id, r.label]));
  const special = specialTools(project);
  const status = userProject?.status;

  const start = () => {
    startProject(project.id);
    navigate(`/projects/${project.id}/tutorial`);
  };

  const actions = !user ? (
    <div className="flex flex-col gap-3">
      <Button to="/signin" state={{ from: location.pathname }} size="lg">
        Sign in to start this project
      </Button>
      <Button to="/signup" variant="secondary">
        Create an account
      </Button>
    </div>
  ) : status === 'IN_PROGRESS' ? (
    <div className="flex flex-col gap-3">
      <div>
        <p className="eyebrow mb-2">
          In progress · Step {userProject!.currentStep + 1} of {project.steps.length}
        </p>
        <ProgressBar value={userProject!.currentStep} total={project.steps.length} />
      </div>
      <Button to={`/projects/${project.id}/tutorial`} size="lg">
        Continue project <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  ) : status === 'COMPLETED' ? (
    <div className="flex flex-col gap-3">
      <p className="eyebrow inline-flex items-center gap-2 text-emerald-800">
        <Check className="h-4 w-4" /> Completed {userProject!.completedAt && formatDate(userProject!.completedAt)}
      </p>
      {!userProject!.postId && (
        <Button to={`/projects/${project.id}/share`} size="lg">
          Share to Explore
        </Button>
      )}
      <Button to={`/projects/${project.id}/tutorial`} variant="secondary">
        Review the steps
      </Button>
    </div>
  ) : (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Button size="lg" onClick={start}>
          Start project <ArrowRight className="h-4 w-4" />
        </Button>
        {status === 'SAVED' ? (
          <Button variant="secondary" size="lg" onClick={() => unsaveProject(project.id)} aria-pressed>
            <BookmarkCheck className="h-4 w-4" /> Saved
          </Button>
        ) : (
          <Button variant="secondary" size="lg" onClick={() => saveProject(project.id)}>
            <Bookmark className="h-4 w-4" /> Save
          </Button>
        )}
      </div>
      <p className="text-xs text-muted">
        {missing.length > 0
          ? 'Missing items won’t stop you. Borrow, substitute, or pick them up second-hand as you go. '
          : ''}
        Starting opens step 1 and saves your place.
      </p>
    </div>
  );

  return (
    <Page>
      {fromPost ? (
        <Link to={`/explore/${fromPost}`} className="eyebrow inline-flex items-center gap-2 text-muted hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to post
        </Link>
      ) : (
        <Link to={user ? '/projects' : '/explore'} className="eyebrow inline-flex items-center gap-2 text-muted hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> {user ? 'Discover' : 'Explore'}
        </Link>
      )}

      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-16">
        <div className="hidden md:sticky md:top-24 md:block md:self-start">
          <Artwork
            image={project.cover}
            art={project.art}
            icon={project.output}
            alt={project.title}
            sizes="50vw"
            className="border border-ink"
          />
          {project.cover?.credit && <p className="eyebrow mt-2 text-muted">Photo: {project.cover.credit}</p>}
        </div>

        <div className="flex flex-col">
          <Eyebrow>{PROJECT_CATEGORY_LABELS[project.category]}</Eyebrow>
          <h1 className="display mt-3 text-4xl sm:text-5xl lg:text-6xl">{project.title}</h1>

          {user ? (
            <div className="mt-6 flex items-end gap-4">
              <p className={`display text-5xl leading-none sm:text-6xl ${STATE_TONE[match.state] ?? ''}`}>
                {match.percent}%
              </p>
              <div className="pb-1">
                <p className={`eyebrow font-semibold ${STATE_TONE[match.state] ?? 'text-ink'}`}>{MATCH_STATE_LABELS[match.state]}</p>
                <p className="mt-1 text-sm text-muted">
                  You have {match.haveCount} of {match.requiredCount} required items
                </p>
              </div>
            </div>
          ) : (
            <p className="eyebrow mt-6 text-muted">Sign in to see how much of this you already have.</p>
          )}

          <p className="mt-6 text-base leading-relaxed text-muted">{project.description}</p>

          <Artwork
            image={project.cover}
            art={project.art}
            icon={project.output}
            alt={project.title}
            aspect="aspect-[16/9]"
            className="mt-8 border border-ink md:hidden"
          />

          {user ? (
            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <RequirementList title="You have" results={have} empty="Nothing from your wardrobe yet." />
              <RequirementList title="You’re missing" results={missing} empty="Nothing. You have everything you need." />
            </div>
          ) : (
            <div className="mt-10">
              <RequirementList title="What you’ll need" results={[...have, ...missing]} neutral />
            </div>
          )}

          {optional.length > 0 && (
            <p className="mt-5 text-sm text-muted">
              <span className="eyebrow mr-2 text-ink">Nice to have</span>
              {optional.map((o, i) => (
                <span key={o.label}>
                  {i > 0 && ', '}
                  {o.owned && (
                    <span className="text-emerald-800" aria-label="you have this">
                      ✓{' '}
                    </span>
                  )}
                  {o.label}
                </span>
              ))}
            </p>
          )}

          <dl className="mt-10 grid grid-cols-3 border-y border-ink">
            <div className="py-4 pr-3">
              <dt className="eyebrow text-muted">Difficulty</dt>
              <dd className="mt-1 text-sm">
                <Difficulty level={project.difficulty} />
                <span className="mt-0.5 block text-xs text-muted">{DIFFICULTY_LABELS[project.difficulty]}</span>
              </dd>
            </div>
            <div className="border-l border-line px-3 py-4">
              <dt className="eyebrow text-muted">Time</dt>
              <dd className="mt-1 font-mono text-sm uppercase">{formatTime(project.minutes)}</dd>
            </div>
            <div className="border-l border-line py-4 pl-3">
              <dt className="eyebrow text-muted">Steps</dt>
              <dd className="mt-1 font-mono text-sm">{project.steps.length}</dd>
            </div>
          </dl>

          <div className="mt-8">{actions}</div>
        </div>
      </div>

      <div className="mt-20 grid gap-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
        <section>
          <SectionHeading index="01" title="Overview" />
          <dl className="divide-y divide-line">
            <Fact label="Type">{PROJECT_CATEGORY_LABELS[project.category]}</Fact>
            <Fact label="Makes">{PROJECT_OUTPUT_LABELS[project.output]}</Fact>
            <Fact label="Tools">{special.length ? special.map((t) => t.label).join(', ') : 'Hand tools only'}</Fact>
            <Fact label="Uses scraps">{project.usesScraps ? 'Yes' : 'No'}</Fact>
          </dl>
        </section>

        <section>
          <SectionHeading index="02" title="Tutorial preview" note={`${project.steps.length} steps`} />
          <ol className="divide-y divide-line">
            {project.steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 py-4 sm:grid-cols-[3rem_minmax(0,1fr)]">
                <span className="font-mono text-sm text-muted">{pad2(i + 1)}</span>
                <span className="text-sm font-medium">{s.title}</span>
                {s.uses.length > 0 && (
                  <span className="col-start-2 mt-1 text-xs text-muted">
                    Uses {s.uses.map((id) => labelById.get(id) ?? id).join(', ')}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="mt-20">
        <SectionHeading index="03" title="Made by the community" note={posts.length ? `${posts.length} finished` : undefined} />
        {posts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4">
            {posts.slice(0, 4).map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No one has shared this project yet. Finish it and yours could be the first.</p>
        )}
      </section>
    </Page>
  );
}
