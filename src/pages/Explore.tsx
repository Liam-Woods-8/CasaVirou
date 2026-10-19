import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PROJECT_CATEGORY_LABELS } from '../data/options';
import { getProject } from '../data/projects';
import { useSortedPosts, useUserById } from '../store/selectors';
import type { ExplorePost } from '../types';
import { formatDate, formatTime } from '../utils/format';
import { PostCard } from '../components/PostCard';
import { Page } from '../components/layout/Layouts';
import { Artwork } from '../components/ui/Artwork';
import { Button } from '../components/ui/Button';
import { Chip, Difficulty, EmptyState, Eyebrow, Notice, PageHeader } from '../components/ui/primitives';

const FILTERS = ['trending', 'beginner', 'clothing', 'accessories', 'scraps'] as const;
type Filter = (typeof FILTERS)[number];

function applyFilter(posts: ExplorePost[], filter: Filter): ExplorePost[] {
  if (filter === 'trending') {
    const madeCount = new Map<string, number>();
    posts.forEach((p) => madeCount.set(p.projectId, (madeCount.get(p.projectId) ?? 0) + 1));
    return [...posts].sort(
      (a, b) => (madeCount.get(b.projectId) ?? 0) - (madeCount.get(a.projectId) ?? 0) || b.createdAt.localeCompare(a.createdAt),
    );
  }
  return posts.filter((p) => {
    const project = getProject(p.projectId);
    if (!project) return false;
    if (filter === 'beginner') return project.difficulty <= 2;
    if (filter === 'clothing') return project.output === 'garment';
    if (filter === 'accessories') return project.output !== 'garment';
    return project.usesScraps;
  });
}

export function Explore() {
  const posts = useSortedPosts();
  const [filter, setFilter] = useState<Filter>('trending');
  const visible = useMemo(() => applyFilter(posts, filter), [posts, filter]);

  return (
    <Page>
      <PageHeader title="Explore" subtitle="See what other people are making." />
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
      </div>
      <div className="mt-8">
        {visible.length === 0 ? (
          <EmptyState title="Nothing here yet." body="Try another filter, or finish a project and share it." />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

export function ExplorePostPage() {
  const { postId } = useParams();
  const location = useLocation();
  const posts = useSortedPosts();
  const post = posts.find((p) => p.id === postId);
  const creator = useUserById(post?.userId);
  const project = getProject(post?.projectId);
  const justShared = (location.state as { justShared?: boolean } | null)?.justShared;

  if (!post) {
    return (
      <Page narrow>
        <EmptyState title="Post not found." action={<Button to="/explore">Back to Explore</Button>} />
      </Page>
    );
  }

  return (
    <Page>
      <Link to="/explore" className="eyebrow inline-flex items-center gap-2 text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Explore
      </Link>

      {justShared && (
        <div className="mt-6">
          <Notice tone="success">Shared to Explore ✓ Others can now find this and make their own.</Notice>
        </div>
      )}

      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-16">
        <Artwork
          photo={post.photo}
          image={project?.cover}
          art={post.art}
          icon={project?.output}
          alt={post.title}
          sizes="(min-width: 768px) 45vw, 100vw"
          className="border border-ink"
        />

        <div className="flex flex-col">
          <Eyebrow>
            @{creator?.username ?? 'unknown'} · {formatDate(post.createdAt)}
          </Eyebrow>
          <h1 className="display mt-3 text-4xl sm:text-5xl">{post.title}</h1>
          <p className="mt-5 text-base leading-relaxed">{post.description}</p>

          {post.materialsUsed.length > 0 && (
            <div className="mt-8">
              <h2 className="eyebrow mb-3 border-b border-ink pb-2 font-semibold">Materials used</h2>
              <ul className="flex flex-wrap gap-2">
                {post.materialsUsed.map((m) => (
                  <li key={m} className="eyebrow border border-line px-3 py-1.5">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project ? (
            <div className="mt-10 border border-ink">
              <p className="eyebrow border-b border-ink px-4 py-2">Original project</p>
              <div className="flex gap-4 p-4">
                <Artwork image={project.cover} sizes="96px" art={project.art} icon={project.output} alt={project.title} aspect="aspect-square" className="w-20 shrink-0 sm:w-24" />
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold uppercase tracking-wide">{project.title}</p>
                  <p className="eyebrow mt-1 text-muted">{PROJECT_CATEGORY_LABELS[project.category]}</p>
                  <div className="eyebrow mt-2 flex flex-wrap gap-x-3 text-muted">
                    <Difficulty level={project.difficulty} className="text-ink" />
                    <span>{formatTime(project.minutes)}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-ink p-4">
                <Button to={`/projects/${project.id}`} state={{ fromPost: post.id }} size="lg" className="w-full">
                  Make this <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="mt-2 text-xs text-muted">See what you already have and what you&rsquo;d need first.</p>
              </div>
            </div>
          ) : (
            <div className="mt-10">
              <Notice>The original project for this post is no longer available.</Notice>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
