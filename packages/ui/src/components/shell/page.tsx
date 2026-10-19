'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn.ts';
import { SoleLink } from '../../lib/sole-provider.tsx';

// Every signed-in screen renders inside <Page>: it draws the 48px top bar with breadcrumbs
// and the screen's actions, and gives the screen a scrolling body. It does not set the tab
// title: an app sets that itself, in its own wrapper around <Page>.

export interface Crumb {
  label: string;
  /** An address in the app. The last crumb is the current page, so it never links. */
  href?: string;
  /** A board emoji or an icon before the label. */
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'children'> {
  crumbs: Crumb[];
}

export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs({ crumbs, className, ...props }, ref) {
  return (
    <nav ref={ref} aria-label="Breadcrumb" className={cn('min-w-0', className)} {...props}>
      <ol className="flex min-w-0 items-center gap-1.5 text-body font-medium">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          const inner = (
            <>
              {crumb.icon}
              <span className="truncate">{crumb.label}</span>
            </>
          );
          return (
            <React.Fragment key={crumb.href ?? crumb.label}>
              {i > 0 && <ChevronRight size={14} aria-hidden="true" className="shrink-0 text-faint" />}
              <li className={cn('flex min-w-0 items-center gap-1.5', last ? 'text-foreground' : 'text-muted-foreground')} aria-current={last ? 'page' : undefined}>
                {crumb.href && !last ? (
                  <SoleLink href={crumb.href} className="flex min-w-0 items-center gap-1.5 rounded-sm outline-none hover:text-foreground focus-visible:shadow-[var(--focus-ring)]">
                    {inner}
                  </SoleLink>
                ) : (
                  inner
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
});
Breadcrumbs.displayName = 'Breadcrumbs';

export interface TopBarProps extends Omit<React.ComponentPropsWithoutRef<'header'>, 'children'> {
  crumbs: Crumb[];
  /** Buttons for the screen, on the right. */
  actions?: React.ReactNode;
}

export const TopBar = React.forwardRef<HTMLElement, TopBarProps>(function TopBar({ crumbs, actions, className, ...props }, ref) {
  return (
    <header ref={ref} data-topbar className={cn('flex h-12 shrink-0 items-center gap-3 border-b border-border px-4', className)} {...props}>
      <Breadcrumbs crumbs={crumbs} />
      {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
});
TopBar.displayName = 'TopBar';

// `title` is left out on purpose: HQ's Page took the tab title here, and an app that still
// passes it should get a type error instead of a native tooltip over the whole screen.
export interface PageProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'className' | 'title'> {
  crumbs: Crumb[];
  actions?: React.ReactNode;
  /** Classes for the scrolling body under the top bar, not for the root. */
  className?: string;
}

export const Page = React.forwardRef<HTMLDivElement, PageProps>(function Page({ crumbs, actions, children, className, ...props }, ref) {
  return (
    <div ref={ref} className="flex h-full min-h-0 flex-col" {...props}>
      <TopBar crumbs={crumbs} actions={actions} />
      <div data-page-body className={cn('min-h-0 flex-1 overflow-y-auto overflow-x-hidden', className)}>
        {children}
      </div>
    </div>
  );
});
Page.displayName = 'Page';
