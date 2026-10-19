'use client';

import * as React from 'react';
import { Lock, RotateCw, TriangleAlert, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn.ts';
import { Button } from '../ui/button.tsx';
import { Skeleton } from '../ui/skeleton.tsx';

// Empty, error, no access and loading (brand-and-ux 5.15). Error and empty are never
// the same screen: a failed load does not claim there is nothing there (U51).

// The designed states (02-components.png, 99.1 to 99.3): a 24px icon, a 14/500 title,
// one or two 13px lines, and at most one secondary button. `framed` puts them in the
// 420px bordered card a whole screen uses; bare, they sit inside a list or a card.
// CenteredState places a framed state a little above the middle of the page body.

const stateBox = (framed: boolean | undefined, className?: string) =>
  cn(
    'flex flex-col items-center text-center',
    framed ? 'w-full max-w-[420px] rounded-xl border border-border bg-card px-6 py-12' : 'px-4 py-16',
    className,
  );

export interface CenteredStateProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
}

export const CenteredState = React.forwardRef<HTMLDivElement, CenteredStateProps>(function CenteredState({ children, className, ...props }, ref) {
  return (
    <div ref={ref} className={cn('flex min-h-full items-center justify-center px-6 pt-10 pb-20', className)} {...props}>
      {children}
    </div>
  );
});
CenteredState.displayName = 'CenteredState';

export interface EmptyStateProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title' | 'children'> {
  icon?: LucideIcon;
  /** A fact, as a sentence: "Nothing is assigned to you right now." */
  title: string;
  body?: React.ReactNode;
  /** The next move: one secondary button or link. */
  action?: React.ReactNode;
  framed?: boolean;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState({ icon: Icon, title, body, action, framed, className, ...props }, ref) {
  return (
    <div ref={ref} role="status" className={stateBox(framed, className)} {...props}>
      {Icon && <Icon size={24} strokeWidth={1.8} aria-hidden="true" className="mb-1.5 text-subtle-foreground" />}
      <p className="text-strong font-medium text-muted-foreground">{title}</p>
      {body && <p className="mt-1.5 max-w-96 text-body text-subtle-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
});
EmptyState.displayName = 'EmptyState';

export interface ErrorStateProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title' | 'children'> {
  /** "Could not load the wiki". */
  title: string;
  body?: React.ReactNode;
  /** Shows the Try again button. */
  onRetry?: () => void;
  framed?: boolean;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(function ErrorState(
  { title, body = 'The server did not answer. Try again in a moment.', onRetry, framed, className, ...props },
  ref,
) {
  return (
    <div ref={ref} role="alert" className={stateBox(framed, className)} {...props}>
      <TriangleAlert size={24} strokeWidth={1.8} aria-hidden="true" className="mb-1.5 text-warning" />
      <p className="text-strong font-medium text-muted-foreground">{title}</p>
      {body && <p className="mt-1.5 max-w-96 text-body text-subtle-foreground">{body}</p>}
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          <RotateCw aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
});
ErrorState.displayName = 'ErrorState';

export interface NoAccessProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  /** What they cannot open, finishing "You do not have access to ...": "the Payroll board". */
  what: string;
  body?: React.ReactNode;
  framed?: boolean;
}

export const NoAccess = React.forwardRef<HTMLDivElement, NoAccessProps>(function NoAccess({ what, body = 'Ask an admin to add you.', framed, className, ...props }, ref) {
  return (
    <div ref={ref} role="status" className={stateBox(framed, className)} {...props}>
      <Lock size={24} strokeWidth={1.8} aria-hidden="true" className="mb-1.5 text-subtle-foreground" />
      <p className="text-strong font-medium text-muted-foreground">You do not have access to {what}.</p>
      {body && <p className="mt-1.5 max-w-96 text-body text-subtle-foreground">{body}</p>}
    </div>
  );
});
NoAccess.displayName = 'NoAccess';

/** True once `ms` have passed. Loading states wait 300ms so quick loads never flash. */
export function useDelayed(ms = 300): boolean {
  const [ready, setReady] = React.useState(ms <= 0);
  React.useEffect(() => {
    if (ms <= 0) return;
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready;
}

const WIDTHS = ['62%', '48%', '71%', '55%', '66%', '44%', '58%', '69%'];

export interface SkeletonRowsProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  rows?: number;
  /** row: a 36px work item row. page: a 52px two-line row. */
  variant?: 'row' | 'page';
  /** Milliseconds to show nothing for, so a quick load never flashes. */
  delay?: number;
  /** What screen readers hear while it loads. */
  label?: string;
}

/**
 * Skeleton rows shaped like the real rows. Shows nothing for the first 300ms, then
 * 12px bars pulsing at 1.4s. One loading state per screen (U20).
 */
export const SkeletonRows = React.forwardRef<HTMLDivElement, SkeletonRowsProps>(function SkeletonRows(
  { rows = 6, variant = 'row', delay = 300, label = 'Loading', className, ...props },
  ref,
) {
  const visible = useDelayed(delay);
  if (!visible) return <div ref={ref} aria-busy="true" aria-label={label} className={className} {...props} />;
  return (
    <div ref={ref} aria-busy="true" aria-label={label} className={cn('flex flex-col', className)} {...props}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={cn('flex items-center gap-3 border-b border-hairline px-3', variant === 'row' ? 'h-9' : 'h-[52px]')}>
          {variant === 'row' ? (
            <>
              <Skeleton className="w-4" />
              <Skeleton className="w-12" />
              <Skeleton style={{ width: WIDTHS[i % WIDTHS.length] }} />
              <Skeleton className="ml-auto w-12" />
            </>
          ) : (
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton style={{ width: WIDTHS[i % WIDTHS.length] }} />
              <Skeleton className="h-2.5 w-40" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
});
SkeletonRows.displayName = 'SkeletonRows';
