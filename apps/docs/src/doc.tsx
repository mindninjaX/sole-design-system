import type { ReactNode } from 'react';

/** One part's section on the components page. */
export interface DocSection {
  /** Anchor id, kebab-case, unique: `button`, `person-chip`. */
  id: string;
  /** The part's name as code uses it: `Button`, `PersonChip`. */
  title: string;
  group: 'Shared' | 'Sole' | 'Shell' | 'HQ';
  /** One or two plain sentences: what it is for. */
  summary: string;
  /** The import, for example `import { Button } from '@sole-ui/react'`. */
  importLine?: string;
  /** Every variant, size and state, live. Build it from Row and Stage. */
  render: () => ReactNode;
}

/** A labelled row of variants: the label on the left, the live parts wrapping on the right. */
export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4 border-b border-hairline py-3 last:border-b-0">
      <div className="w-36 shrink-0 pt-1 text-label text-muted-foreground">{label}</div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/** The card the rows sit on. `width` limits the stage for parts that fill their parent. */
export function Stage({ children, width }: { children: ReactNode; width?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-1" style={width ? { maxWidth: width } : undefined}>
      {children}
    </div>
  );
}

/** A part that needs room (a table, a page header): a padded box with no rows. */
export function Canvas({ children, width, className }: { children: ReactNode; width?: number; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${className ?? ''}`} style={width ? { maxWidth: width } : undefined}>
      {children}
    </div>
  );
}
