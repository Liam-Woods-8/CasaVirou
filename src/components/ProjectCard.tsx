import { Link } from 'react-router';
import type { ProjectMatch } from '../types';
import { formatTime } from '../utils/format';
import { requiredMissing } from '../utils/matching';
import { MatchBadge } from './MatchBadge';
import { Artwork } from './ui/Artwork';
import { Difficulty } from './ui/primitives';

interface ProjectCardProps {
  match: ProjectMatch;
  /** Hide wardrobe-based match info, e.g. when signed out. */
  showMatch?: boolean;
}

export function ProjectCard({ match, showMatch = true }: ProjectCardProps) {
  const { project, haveCount, requiredCount, percent, state } = match;
  const missing = requiredMissing(match);

  return (
    <Link to={`/projects/${project.id}`} className="group flex flex-col">
      <div className="relative overflow-hidden border border-line transition-colors group-hover:border-ink">
        <Artwork
          image={project.cover}
          art={project.art}
          icon={project.output}
          alt={project.title}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {showMatch && <MatchBadge state={state} className="absolute left-3 top-3" />}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 pt-3">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wide group-hover:underline group-hover:underline-offset-4">
          {project.title}
        </h3>
        <div className="eyebrow flex flex-wrap gap-x-3 text-muted">
          {showMatch && <span className="font-semibold text-ink">{percent}% match</span>}
          <Difficulty level={project.difficulty} className="text-ink" />
          <span>{formatTime(project.minutes)}</span>
        </div>
        {showMatch && (
          <>
            <p className="text-sm">
              You have {haveCount}/{requiredCount} required items
            </p>
            {missing.length > 0 && (state === 'ALMOST_READY' || missing.length <= 2) && (
              <p className={`text-xs ${state === 'ALMOST_READY' ? 'text-amber-800' : 'text-muted'}`}>
                Missing: {missing.slice(0, 2).map((m) => m.requirement.label).join(', ')}
                {missing.length > 2 && ` +${missing.length - 2} more`}
              </p>
            )}
          </>
        )}
      </div>
    </Link>
  );
}

export function CardGrid({ children, dense = false }: { children: React.ReactNode; dense?: boolean }) {
  return (
    <div
      className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 ${
        dense ? 'md:grid-cols-4 lg:grid-cols-5' : 'md:grid-cols-3 lg:grid-cols-4'
      }`}
    >
      {children}
    </div>
  );
}
