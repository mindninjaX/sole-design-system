'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';

// Page parts (02-components.png 02.5, 02.9): the page header, the uppercase section
// label, the section card, the list card, property rows and table headers.

/** Page header (60.1, 80.1, 90.7): a 20/28 title, one 13px line under it, actions on the right. */
export const PageHeader = React.forwardRef<
  HTMLElement,
  Omit<React.ComponentPropsWithoutRef<'header'>, 'title' | 'children'> & {
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    as?: 'h1' | 'h2';
  }
>(function PageHeader({ title, description, actions, as: Heading = 'h1', className, ...props }, ref) {
  return (
    <header ref={ref} className={cn('flex min-w-0 items-start gap-4', className)} {...props}>
      <div className="min-w-0 flex-1">
        <Heading className="text-page text-foreground">{title}</Heading>
        {description && <p className="text-body text-subtle-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
});
PageHeader.displayName = 'PageHeader';

/** Section label (30.1 "RECENTLY VIEWED", 60.5 "COMMENTS 2"): 11/600 uppercase, a count, an action on the right. */
export const SectionLabel = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> & {
    children: React.ReactNode;
    count?: number;
    /** A link-style button: "New sticky", "Show resolved". */
    action?: React.ReactNode;
    as?: 'h2' | 'h3' | 'div';
  }
>(function SectionLabel({ children, count, action, as: Heading = 'h2', className, ...props }, ref) {
  return (
    <div ref={ref} className={cn('flex h-6 min-w-0 items-center gap-2', className)} {...props}>
      <Heading className="text-micro text-subtle-foreground">{children}</Heading>
      {count !== undefined && <span className="tnum text-label font-normal text-subtle-foreground">{count}</span>}
      {action && <div className="ml-auto flex shrink-0 items-center">{action}</div>}
    </div>
  );
});
SectionLabel.displayName = 'SectionLabel';

/** The quiet link-style action a SectionLabel carries: 12/500 in the link colour. */
export const SectionAction = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(function SectionAction({ className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn('rounded-sm text-label text-link outline-none hover:underline focus-visible:shadow-[var(--focus-ring)] disabled:opacity-50', className)}
      {...props}
    />
  );
});
SectionAction.displayName = 'SectionAction';

/** Card/Section (90.7, 90.8, 50.11): a bordered 12px card, a 14/600 title, a 13px line, then the body. */
export const SectionCard = React.forwardRef<
  HTMLElement,
  Omit<React.ComponentPropsWithoutRef<'section'>, 'title'> & {
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
  }
>(function SectionCard({ title, description, actions, children, className, ...props }, ref) {
  return (
    <section ref={ref} className={cn('rounded-xl border border-border bg-card px-5 pt-[18px] pb-5', className)} {...props}>
      <div className="flex min-w-0 items-start gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-strong text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-body text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
});
SectionCard.displayName = 'SectionCard';

/** List card (30.1 My work, 80.2 Open work): a 12px card with a 42px header, rows below. */
export const ListCard = React.forwardRef<
  HTMLElement,
  Omit<React.ComponentPropsWithoutRef<'section'>, 'title'> & {
    title: React.ReactNode;
    /** "9 open", or a number. */
    count?: React.ReactNode;
    /** On the right of the header: "Assigned to you, not done". */
    meta?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
  }
>(function ListCard({ title, count, meta, children, footer, className, ...props }, ref) {
  return (
    <section ref={ref} className={cn('overflow-hidden rounded-xl border border-border bg-card', className)} {...props}>
      <header className="flex h-[43px] min-w-0 items-center gap-2 border-b border-border px-4">
        <h2 className="text-strong text-foreground">{title}</h2>
        {count !== undefined && <span className="tnum text-label font-normal text-subtle-foreground">{count}</span>}
        {meta && <span className="ml-auto truncate text-label font-normal text-subtle-foreground">{meta}</span>}
      </header>
      <div className="[&>*:last-child]:border-b-0">{children}</div>
      {footer && <div className="border-t border-hairline px-4 py-2.5">{footer}</div>}
    </section>
  );
});
ListCard.displayName = 'ListCard';

/** Property row (50.6 side panel): a 96px 13px label, then the value, 36px tall. */
export const PropertyRow = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<'div'>, 'title' | 'children'> & {
    label: React.ReactNode;
    /** The whole label, shown on hover when it is cut to the column. */
    title?: string;
    /** Before the label, inside the same 96px column: 14px, decorative. */
    icon?: React.ReactNode;
    children: React.ReactNode;
  }
>(function PropertyRow({ label, title, icon, children, className, ...props }, ref) {
  return (
    <div ref={ref} className={cn('flex min-h-9 min-w-0 items-center', className)} {...props}>
      {/* A custom property can have a long name: it is cut to the column and shown whole on hover. */}
      <div title={title} className={cn('w-24 shrink-0 pr-2 text-body text-subtle-foreground', icon ? 'flex items-center gap-1.5' : 'truncate')}>
        {icon ? (
          <>
            <span aria-hidden="true" className="flex shrink-0 items-center [&_svg]:size-3.5 [&_svg]:shrink-0">
              {icon}
            </span>
            <span className="min-w-0 truncate">{label}</span>
          </>
        ) : (
          label
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">{children}</div>
    </div>
  );
});
PropertyRow.displayName = 'PropertyRow';

/**
 * Table header (90.1 Access, 80.1 People): 32px, the muted fill, 12/500 labels. Give it
 * the same grid template as the rows, e.g. `className="grid-cols-[1fr_140px_180px_160px_40px]"`.
 * A column is its label, or `{ id, label }` for one with no words (the row menu).
 */
export const TableHeader = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> & {
    columns: ReadonlyArray<string | { id: string; label?: React.ReactNode }>;
  }
>(function TableHeader({ columns, className, ...props }, ref) {
  return (
    <div ref={ref} {...props} role="row" className={cn('grid h-8 items-center gap-4 bg-muted px-4 text-label text-subtle-foreground', className)}>
      {columns.map((c) => {
        const col = typeof c === 'string' ? { id: c, label: c } : c;
        return (
          <div key={col.id} role="columnheader" className="min-w-0 truncate">
            {col.label}
          </div>
        );
      })}
    </div>
  );
});
TableHeader.displayName = 'TableHeader';
