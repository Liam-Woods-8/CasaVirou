import { Link } from 'react-router';
import { getProject } from '../data/projects';
import { useUserById } from '../store/selectors';
import type { ExplorePost } from '../types';
import { Artwork } from './ui/Artwork';

export function PostCard({ post }: { post: ExplorePost }) {
  const creator = useUserById(post.userId);
  const project = getProject(post.projectId);
  return (
    <Link to={`/explore/${post.id}`} className="group flex flex-col">
      <div className="overflow-hidden border border-line transition-colors group-hover:border-ink">
        <Artwork
          photo={post.photo}
          image={project?.cover}
          art={post.art}
          icon={project?.output}
          alt={post.title}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-1 pt-3">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wide group-hover:underline group-hover:underline-offset-4">
          {post.title}
        </h3>
        <p className="eyebrow text-muted">@{creator?.username ?? 'unknown'}</p>
      </div>
    </Link>
  );
}
