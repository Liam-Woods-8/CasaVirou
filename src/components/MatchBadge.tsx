import type { MatchState } from '../types';
import { MATCH_STATE_LABELS } from '../utils/matching';

const STYLES: Partial<Record<MatchState, string>> = {
  MAKE_NOW: 'bg-emerald-100 text-emerald-800',
  ALMOST_READY: 'bg-amber-100 text-amber-800',
};

export function MatchBadge({ state, className = '' }: { state: MatchState; className?: string }) {
  const style = STYLES[state];
  if (!style) return null;
  return <span className={`eyebrow inline-block px-2 py-1 ${style} ${className}`}>{MATCH_STATE_LABELS[state]}</span>;
}
