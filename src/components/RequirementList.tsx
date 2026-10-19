import { Fragment } from 'react';
import { Link } from 'react-router';
import type { RequirementResult } from '../types';

interface RequirementListProps {
  title: string;
  results: RequirementResult[];
  empty?: string;
  /** Hide have/missing status, e.g. when signed out. */
  neutral?: boolean;
  /** Show "Material" / "Tool" on each row. */
  showKind?: boolean;
}

export function RequirementList({ title, results, empty, neutral = false, showKind = false }: RequirementListProps) {
  return (
    <div>
      <h3 className="eyebrow mb-1 border-b border-ink pb-2 font-semibold text-ink">
        {title} <span className="text-muted">({results.length})</span>
      </h3>
      {results.length === 0 ? (
        empty && <p className="py-3 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-line">
          {results.map(({ requirement, matchedBy }) => {
            const owned = matchedBy.length > 0;
            return (
              <li key={requirement.id} className="flex items-start gap-3 py-3">
                {!neutral && (
                  <span aria-hidden className={`mt-0.5 w-4 font-mono text-sm ${owned ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {owned ? '✓' : '○'}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    {!neutral && <span className="sr-only">{owned ? 'Have: ' : 'Missing: '}</span>}
                    {requirement.label}
                    {requirement.optional && <span className="eyebrow ml-2 text-muted">Optional</span>}
                  </p>
                  {!neutral && owned && (
                    <p className="mt-0.5 text-xs text-muted">
                      Satisfied by{' '}
                      {matchedBy.map((item, i) => (
                        <Fragment key={item.id}>
                          {i > 0 && ', '}
                          <Link to={`/materials/${item.id}`} className="text-ink underline-offset-4 hover:underline">
                            {item.name}
                          </Link>
                        </Fragment>
                      ))}
                    </p>
                  )}
                </div>
                {showKind && <span className="eyebrow text-muted">{requirement.kind}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
