'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';
import { SoleLink } from '../../lib/sole-provider.tsx';

// Sub-navigation item (02.5; the wiki rail in 60.1, Settings and Admin nav in 80.3 and
// 90.1): 32px, a 16px icon, 13/500 text, a count on the right. Active is the accent fill
// with blue text, the same as the sidebar.

const base =
  'group/subnav flex h-8 w-full min-w-0 items-center gap-2 rounded-md px-2.5 text-left text-body font-medium text-sidebar-foreground outline-none transition-colors duration-[120ms] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground hover:bg-sidebar-hover focus-visible:shadow-[var(--focus-ring)]';
const activeClass = 'bg-accent text-accent-foreground hover:bg-accent [&_svg]:text-accent-foreground';

function Inner({ icon, label, count }: { icon?: React.ReactNode; label: React.ReactNode; count?: number | string }) {
  return (
    <>
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && <span className="tnum shrink-0 text-label font-normal text-subtle-foreground">{count}</span>}
    </>
  );
}

/**
 * One item. With `href` it is a link (the provider's link component) and `active` marks the
 * current page with `aria-current`; the caller decides, so a matching address never marks
 * an item as current that is drawn as not. Without `href` it is a button that sets state
 * (the wiki rail's filters) and `active` is `aria-pressed`.
 */
export const SubNavItem = React.forwardRef<
  HTMLElement,
  {
    icon?: React.ReactNode;
    label: React.ReactNode;
    count?: number | string;
    /** An address in the app: the item is a link. */
    href?: string;
    active?: boolean;
    onClick?: () => void;
    className?: string;
  }
>(function SubNavItem({ icon, label, count, href, active, onClick, className }, ref) {
  // One ref type for both elements; each branch narrows it to the element it renders.
  if (href) {
    return (
      <SoleLink
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={onClick}
        className={cn(base, active && activeClass, className)}
        aria-current={active ? 'page' : undefined}
      >
        <Inner icon={icon} label={label} count={count} />
      </SoleLink>
    );
  }
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type="button" onClick={onClick} aria-pressed={active} className={cn(base, active && activeClass, className)}>
      <Inner icon={icon} label={label} count={count} />
    </button>
  );
});
SubNavItem.displayName = 'SubNavItem';

/** A column of sub-nav items with an optional 11px heading ("SPACES", "FOLDERS"). */
export const SubNav = React.forwardRef<HTMLElement, Omit<React.ComponentPropsWithoutRef<'nav'>, 'children'> & { label?: React.ReactNode; children: React.ReactNode }>(
  function SubNav({ label, children, className, ...props }, ref) {
    return (
      <nav ref={ref} aria-label={typeof label === 'string' ? label : undefined} className={cn('flex flex-col gap-0.5', className)} {...props}>
        {label && <div className="flex h-7 items-end px-2.5 pb-1.5 text-micro text-subtle-foreground">{label}</div>}
        {children}
      </nav>
    );
  },
);
SubNav.displayName = 'SubNav';
