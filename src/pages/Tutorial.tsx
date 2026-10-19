import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { getProject } from '../data/projects';
import { useProjectMatch, useUserProject } from '../store/selectors';
import { useStore } from '../store/useStore';
import { pad2 } from '../utils/format';
import { FocusBar } from '../components/layout/Layouts';
import { Artwork } from '../components/ui/Artwork';
import { Button } from '../components/ui/Button';
import { EmptyState, Eyebrow, ProgressBar } from '../components/ui/primitives';

export function Tutorial() {
  const { projectId } = useParams();
  const project = getProject(projectId);
  const userProject = useUserProject(projectId);
  const match = useProjectMatch(projectId);
  const setStep = useStore((s) => s.setStep);
  const startProject = useStore((s) => s.startProject);
  const completeProject = useStore((s) => s.completeProject);
  const navigate = useNavigate();
  const [reviewStep, setReviewStep] = useState(0);

  const isReview = userProject?.status === 'COMPLETED';
  const exitTo = isReview
    ? '/projects/mine/completed'
    : userProject?.status === 'IN_PROGRESS'
      ? '/projects/mine/in-progress'
      : `/projects/${projectId}`;

  const bar = (
    <FocusBar
      left={
        <p className="eyebrow min-w-0 truncate">
          {project?.title ?? 'Tutorial'}
          {isReview && <span className="text-muted"> · Review</span>}
        </p>
      }
      right={
        <Link to={exitTo} className="eyebrow inline-flex shrink-0 items-center gap-1.5 hover:underline hover:underline-offset-4">
          <X className="h-4 w-4" /> Exit tutorial
        </Link>
      }
    />
  );

  if (!project || !match) {
    return (
      <>
        {bar}
        <div className="mx-auto max-w-2xl px-4 pt-12">
          <EmptyState title="Project not found." action={<Button to="/projects">Discover projects</Button>} />
        </div>
      </>
    );
  }

  if (!userProject || userProject.status === 'SAVED') {
    return (
      <>
        {bar}
        <div className="mx-auto max-w-2xl px-4 pt-12">
          <EmptyState
            title="You haven't started this project."
            body="Starting moves it to In Progress and saves your place as you go."
            action={
              <Button onClick={() => startProject(project.id)}>
                Start project <ArrowRight className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </>
    );
  }

  const total = project.steps.length;
  const index = isReview ? reviewStep : Math.min(userProject.currentStep, total - 1);
  const step = project.steps[index];
  const isLast = index === total - 1;
  const goTo = (i: number) => {
    if (isReview) setReviewStep(i);
    else setStep(project.id, i);
    window.scrollTo(0, 0);
  };

  const next = () => {
    if (!isLast) return goTo(index + 1);
    if (isReview) return navigate(exitTo);
    completeProject(project.id);
    navigate(`/projects/${project.id}/complete`, { replace: true });
  };

  const uses = step.uses
    .map((id) => {
      const have = match.have.find((r) => r.requirement.id === id);
      const miss = match.missing.find((r) => r.requirement.id === id);
      return have ? { ...have, owned: true } : miss ? { ...miss, owned: false } : null;
    })
    .filter((u): u is NonNullable<typeof u> => u !== null);

  return (
    <>
      {bar}
      <div className="mx-auto max-w-5xl px-4 pb-32 pt-6 sm:px-6 sm:pt-10 md:pb-16">
        <div className="flex items-baseline justify-between gap-4">
          <p className="eyebrow">
            Step {index + 1} of {total}
          </p>
          <p className="eyebrow text-muted">{Math.round((index / total) * 100)}% done</p>
        </div>
        <ProgressBar className="mt-3" value={isReview ? total : index} total={total} />

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] md:gap-12">
          <Artwork
            image={step.image}
            sizes="(min-width: 768px) 55vw, 100vw"
            art={project.art}
            icon={project.output}
            alt={`Step ${index + 1}: ${step.title}`}
            label={`Step ${pad2(index + 1)} · ${step.title}`}
            aspect="aspect-[4/3]"
            className="border border-ink"
          />

          <div>
            <span className="display text-5xl text-ink/15 sm:text-6xl">{pad2(index + 1)}</span>
            <h1 className="display mt-2 text-2xl sm:text-4xl">{step.title}</h1>
            <p className="mt-5 text-base leading-relaxed">{step.instructions}</p>

            {uses.length > 0 && (
              <div className="mt-8">
                <Eyebrow className="mb-3 border-b border-ink pb-2 !text-ink">For this step</Eyebrow>
                <ul className="divide-y divide-line">
                  {uses.map(({ requirement, matchedBy, owned }) => (
                    <li key={requirement.id} className="flex items-center gap-3 py-2 text-sm">
                      <span aria-hidden className={`font-mono ${owned ? 'text-emerald-800' : 'text-amber-800'}`}>
                        {owned ? '✓' : '○'}
                      </span>
                      <span className="flex-1">
                        {requirement.label}
                        {owned && matchedBy[0] && <span className="text-muted"> · {matchedBy[0].name}</span>}
                      </span>
                      {!owned && <span className="eyebrow text-amber-800">Missing</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ol className="mt-10 hidden border-t border-line md:block" aria-label="All steps">
              {project.steps.map((s, i) => {
                const done = isReview || i < index;
                const current = i === index;
                return (
                  <li key={s.title}>
                    <button
                      type="button"
                      disabled={!done && !current}
                      onClick={() => goTo(i)}
                      className={`flex w-full items-center gap-3 border-b border-line py-2.5 text-left text-sm transition-colors ${
                        current ? 'font-semibold' : done ? 'text-muted hover:text-ink' : 'text-muted/60'
                      }`}
                      aria-current={current ? 'step' : undefined}
                    >
                      <span className="w-6 font-mono text-xs">{done && !current ? <Check className="h-3.5 w-3.5" /> : pad2(i + 1)}</span>
                      {s.title}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink bg-paper pb-[env(safe-area-inset-bottom)] md:static md:border-0 md:bg-transparent">
        <div className="mx-auto grid max-w-5xl grid-cols-[auto_1fr] gap-3 px-4 py-3 sm:px-6 md:flex md:justify-end md:pb-16">
          <Button variant="secondary" size="lg" disabled={index === 0} onClick={() => goTo(index - 1)} className="px-4 sm:px-6">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Previous</span>
            <span className="sr-only sm:hidden">Previous</span>
          </Button>
          <Button size="lg" onClick={next}>
            {isReview ? (isLast ? 'Done' : 'Next') : isLast ? 'Complete project' : 'Complete & next'}
            {isLast ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </>
  );
}
