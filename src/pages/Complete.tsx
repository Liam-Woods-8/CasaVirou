import { useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { ArrowRight, Check, X } from 'lucide-react';
import { getProject } from '../data/projects';
import { useMatches, useMyItems, useProjectMatch, useUserProject } from '../store/selectors';
import { useStore } from '../store/useStore';
import type { Item, Project, ProjectMatch } from '../types';
import { formatTime } from '../utils/format';
import { garmentsUsed, leftoverScraps, scrapProjects, type GarmentUse } from '../utils/wardrobe';
import { FocusBar } from '../components/layout/Layouts';
import { Artwork } from '../components/ui/Artwork';
import { Button } from '../components/ui/Button';
import { PhotoField, SelectField, TextArea, TextField } from '../components/ui/fields';
import { Chip, EmptyState, Eyebrow, Notice } from '../components/ui/primitives';

interface GarmentAnswer {
  itemId: string;
  used: boolean;
  leftovers: boolean;
}

/** Asks what happened to the clothes a finished project used, then updates the wardrobe once. */
function WardrobeUpdate({ project, uses }: { project: Project; uses: GarmentUse[] }) {
  const update = useStore((s) => s.updateWardrobeAfterProject);
  const [answers, setAnswers] = useState<GarmentAnswer[]>(() =>
    uses.map((u) => ({ itemId: u.candidates[0].id, used: true, leftovers: false })),
  );
  const [summary, setSummary] = useState<{ removed: string[]; added: string[] } | null>(null);

  const itemById = (id: string): Item => uses.flatMap((u) => u.candidates).find((i) => i.id === id)!;
  const set = (index: number, patch: Partial<GarmentAnswer>) =>
    setAnswers((a) => a.map((x, i) => (i === index ? { ...x, ...patch } : x)));

  if (summary) {
    return (
      <Notice tone="success">
        <p className="font-semibold">Your materials are up to date.</p>
        {summary.removed.length > 0 && <p className="mt-1">Removed: {summary.removed.join(', ')}</p>}
        {summary.added.length > 0 && <p className="mt-1">Added: {summary.added.join(', ')}</p>}
        <Link to="/materials" className="mt-2 inline-block underline underline-offset-4">
          View my materials
        </Link>
      </Notice>
    );
  }

  const save = () => {
    const used = answers.filter((a) => a.used);
    const leftovers = answers.filter((a) => a.leftovers).map((a) => leftoverScraps(itemById(a.itemId), project));
    update(project.id, { removeItemIds: used.map((a) => a.itemId), addItems: leftovers });
    setSummary({ removed: used.map((a) => itemById(a.itemId).name), added: leftovers.map((d) => d.name) });
  };

  return (
    <section className="border border-ink p-5 sm:p-6">
      <Eyebrow>Update your materials</Eyebrow>
      <h2 className="mt-2 font-mono text-base font-semibold uppercase tracking-wide">What happened to your clothes?</h2>
      <p className="mt-1 text-sm text-muted">So your project matches stay accurate.</p>

      <div className="mt-5 flex flex-col divide-y divide-line">
        {uses.map((use, index) => {
          const answer = answers[index];
          const item = itemById(answer.itemId);
          return (
            <div key={use.requirement.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
              {use.candidates.length > 1 ? (
                <SelectField
                  label={`Which ${use.requirement.label.toLowerCase()} did you use?`}
                  value={answer.itemId}
                  onChange={(itemId) => itemId && set(index, { itemId })}
                  options={use.candidates.map((i) => ({ value: i.id, label: i.name }))}
                />
              ) : (
                <p className="font-mono text-sm font-semibold uppercase">{item.name}</p>
              )}
              <div className="flex flex-wrap gap-2" role="group" aria-label={`What happened to ${item.name}`}>
                <Chip active={answer.used} onClick={() => set(index, { used: true })}>
                  It became my {project.title}
                </Chip>
                <Chip active={!answer.used} onClick={() => set(index, { used: false })}>
                  I still have it
                </Chip>
              </div>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={answer.leftovers}
                  onChange={(e) => set(index, { leftovers: e.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-ink"
                />
                <span>
                  I have leftover fabric from it
                  <span className="block text-xs text-muted">We&rsquo;ll add it as scraps so it shows up in scrap projects.</span>
                </span>
              </label>
            </div>
          );
        })}
      </div>

      <Button onClick={save} className="mt-6 w-full sm:w-auto">
        Update my materials
      </Button>
    </section>
  );
}

function LeftoverIdeas({ matches }: { matches: ProjectMatch[] }) {
  if (!matches.length) return null;
  return (
    <section className="mt-12">
      <Eyebrow>Got leftover fabric?</Eyebrow>
      <h2 className="mt-2 font-mono text-base font-semibold uppercase tracking-wide">Make something from the scraps</h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {matches.map(({ project, percent }) => (
          <li key={project.id}>
            <Link to={`/projects/${project.id}`} className="group flex items-center gap-4 py-3">
              <Artwork
                image={project.cover}
                art={project.art}
                icon={project.output}
                alt=""
                aspect="aspect-square"
                sizes="64px"
                className="w-16 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-semibold uppercase tracking-wide group-hover:underline group-hover:underline-offset-4">
                  {project.title}
                </p>
                <p className="eyebrow mt-1 text-muted">
                  {percent}% match · {formatTime(project.minutes)}
                </p>
              </div>
              <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function useCompletedProject() {
  const { projectId } = useParams();
  const project = getProject(projectId);
  const userProject = useUserProject(projectId);
  return { projectId, project, userProject };
}

export function Complete() {
  const { projectId, project, userProject } = useCompletedProject();
  const setFinishedPhoto = useStore((s) => s.setFinishedPhoto);
  const match = useProjectMatch(projectId);
  const matches = useMatches();
  // Captured on first render so the form doesn't vanish as items are removed.
  const [uses] = useState(() => (match && !userProject?.wardrobeUpdated ? garmentsUsed(match) : []));

  if (!project) return <Navigate to="/projects" replace />;
  if (!userProject || userProject.status !== 'COMPLETED') return <Navigate to={`/projects/${projectId}`} replace />;

  const photo = userProject.finishedPhoto;
  const leftoverIdeas = scrapProjects(matches, project.id);

  return (
    <>
      <FocusBar
        left={<p className="eyebrow">{project.title}</p>}
        right={
          <Link to="/projects/mine/completed" className="eyebrow inline-flex items-center gap-1.5 hover:underline hover:underline-offset-4">
            <X className="h-4 w-4" /> Close
          </Link>
        }
      />
      <div className="mx-auto max-w-xl px-4 pb-16 pt-10 sm:pt-16">
        <p className="display text-4xl text-emerald-800 sm:text-6xl">
          Project complete <Check className="inline h-9 w-9 -translate-y-1 sm:h-12 sm:w-12" strokeWidth={2.5} />
        </p>
        <h1 className="mt-6 font-mono text-lg font-semibold uppercase tracking-wide">{project.title}</h1>
        <p className="mt-1 text-sm text-muted">You finished all {project.steps.length} steps.</p>

        {uses.length > 0 && (
          <div className="mt-8">
            <WardrobeUpdate project={project} uses={uses} />
          </div>
        )}

        <div className="mt-8">
          {photo ? (
            <Artwork photo={photo} alt={`Finished ${project.title}`} className="border border-ink" />
          ) : (
            <PhotoField
              label="Upload finished project"
              optional
              value={photo}
              onChange={(v) => v && setFinishedPhoto(project.id, v)}
              aspect="aspect-[4/5]"
            />
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {photo ? (
            <>
              {userProject.postId ? (
                <Button to={`/explore/${userProject.postId}`} size="lg">
                  View your post
                </Button>
              ) : (
                <Button to={`/projects/${project.id}/share`} size="lg">
                  Share to Explore <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              <Button to="/projects/mine/completed" variant="secondary">
                Done
              </Button>
            </>
          ) : (
            <>
              <Button to={`/projects/${project.id}/share`} size="lg" variant="secondary">
                Share without a photo
              </Button>
              <Button to="/projects/mine/completed" variant="ghost">
                Skip for now
              </Button>
            </>
          )}
          <p className="text-xs text-muted">Sharing is always optional. Your project stays under Completed either way.</p>
        </div>

        <LeftoverIdeas matches={leftoverIdeas} />
      </div>
    </>
  );
}

export function Share() {
  const { projectId, project, userProject } = useCompletedProject();
  const items = useMyItems();
  const match = useProjectMatch(projectId);
  const sharePost = useStore((s) => s.sharePost);
  const navigate = useNavigate();

  const matchedIds = useMemo(
    () => new Set(match?.have.flatMap((r) => r.matchedBy.map((i) => i.id)) ?? []),
    [match],
  );
  const [photo, setPhoto] = useState(userProject?.finishedPhoto);
  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<Set<string>>(() => new Set(matchedIds));
  const [otherMaterials, setOtherMaterials] = useState(() => userProject?.usedUpItems?.join(', ') ?? '');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  if (!project) return <Navigate to="/projects" replace />;
  if (!userProject || userProject.status !== 'COMPLETED') return <Navigate to={`/projects/${projectId}`} replace />;

  const bar = (
    <FocusBar
      left={<p className="eyebrow">Share · {project.title}</p>}
      right={
        <Link to="/projects/mine/completed" className="eyebrow inline-flex items-center gap-1.5 hover:underline hover:underline-offset-4">
          <X className="h-4 w-4" /> Cancel
        </Link>
      }
    />
  );

  if (userProject.postId) {
    return (
      <>
        {bar}
        <div className="mx-auto max-w-xl px-4 pt-12">
          <EmptyState
            title="Already shared."
            body="This project is already on Explore."
            action={<Button to={`/explore/${userProject.postId}`}>View your post</Button>}
          />
        </div>
      </>
    );
  }

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sortedItems = [...items].sort((a, b) => Number(matchedIds.has(b.id)) - Number(matchedIds.has(a.id)));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!title.trim()) next.title = 'Give your piece a name.';
    if (!description.trim()) next.description = 'Add a sentence or two about it.';
    if (description.length > 280) next.description = 'Keep it under 280 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const materialsUsed = [
      ...items.filter((i) => selected.has(i.id)).map((i) => i.name),
      ...otherMaterials
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ];
    const post = sharePost({ userProjectId: userProject.id, title, description, materialsUsed, photo });
    navigate(`/explore/${post.id}`, { replace: true, state: { justShared: true } });
  };

  return (
    <>
      {bar}
      <form onSubmit={submit} noValidate className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:pt-12">
        <Eyebrow>Share to Explore</Eyebrow>
        <h1 className="display mt-2 text-3xl sm:text-4xl">Show what you made</h1>
        <p className="mt-3 text-sm text-muted">
          Your post links back to the {project.title} project so others can make their own.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-10">
          <PhotoField label="Finished project photo" optional value={photo} onChange={setPhoto} aspect="aspect-[4/5]" />
          <div className="flex flex-col gap-5">
            <TextField label="Project name" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} maxLength={60} />
            <TextArea
              label="Short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              placeholder="What did you use, and how did it turn out?"
              maxLength={300}
            />
            <fieldset>
              <legend className="eyebrow mb-2">Materials used</legend>
              {sortedItems.length === 0 ? (
                <p className="text-sm text-muted">Your wardrobe is empty. Add materials below.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sortedItems.map((i) => (
                    <label
                      key={i.id}
                      className={`eyebrow inline-flex h-9 cursor-pointer items-center gap-2 border px-3 transition-all ${
                        selected.has(i.id) ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'
                      }`}
                    >
                      <input type="checkbox" className="sr-only" checked={selected.has(i.id)} onChange={() => toggle(i.id)} />
                      {selected.has(i.id) && <Check className="h-3 w-3" />}
                      {i.name}
                    </label>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <TextField
                  label="Other materials"
                  optional
                  value={otherMaterials}
                  onChange={(e) => setOtherMaterials(e.target.value)}
                  placeholder="Comma separated, e.g. Borrowed pins, Snap button"
                />
              </div>
            </fieldset>
            {!photo && <Notice>No photo? Your post will use the project artwork instead.</Notice>}
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
          <Button to="/projects/mine/completed" variant="secondary">
            Not now
          </Button>
          <Button type="submit" size="lg">
            Share to Explore
          </Button>
        </div>
      </form>
    </>
  );
}
