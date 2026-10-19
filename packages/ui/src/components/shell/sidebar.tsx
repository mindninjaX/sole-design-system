'use client';

import * as React from 'react';
import { ChevronDown, ChevronsUpDown, PanelLeft, Search } from 'lucide-react';
import { cn } from '../../lib/cn.ts';
import { personName, type SolePerson } from '../../lib/person.ts';
import { SoleLink } from '../../lib/sole-provider.tsx';
import { Avatar } from '../sole/avatar.tsx';
import { CountBadge } from '../sole/count-badge.tsx';
import { Kbd, keysText } from '../sole/kbd.tsx';
import { SoleLockup, SoleMark } from '../sole/logo.tsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip.tsx';

// The sidebar (brand-and-ux 4.3, D2; hq/design/screens 30.1, 20.1 and 20.4): a header, the
// destinations, collapsible groups, then the user row. 240px wide, or a 52px rail of icons
// whose tooltips carry the label and the hint ("Inbox · 1 mention, 3 unread"). Everything
// arrives as props or children: the app owns its nav list, its data and its router.

/** `Sidebar` says whether it is a rail, so its parts do not each need `rail`. A part's own `rail` wins. */
const RailContext = React.createContext(false);

function useRail(own: boolean | undefined): boolean {
  const fromSidebar = React.useContext(RailContext);
  return own ?? fromSidebar;
}

const itemClass = (active: boolean) =>
  cn(
    'flex h-8 w-full min-w-0 items-center gap-2 rounded-md px-2 text-body font-medium outline-none transition-colors duration-[120ms]',
    'focus-visible:shadow-[var(--focus-ring)]',
    active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground',
  );

/** A rail button: 36 by 32, centred in the 52px rail. */
const railClass = 'h-8 w-9 justify-center px-0';

/**
 * The rail's tooltip (20.1): no arrow, its edge 13px from the button (4px past the rail),
 * and the dot between the label and the hint set a little apart.
 */
function RailTip({ label, hint, children }: { label: string; hint?: string | undefined; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={13} className="py-[4.5px] [&>span:has(>svg)]:hidden">
        {label}
        {hint && (
          <>
            <span aria-hidden="true" className="px-[2.5px]">
              {' · '}
            </span>
            {hint}
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export interface SidebarProps extends React.ComponentPropsWithoutRef<'nav'> {
  /** The 52px rail of icons instead of the 240px sidebar. Every part inside follows it. */
  rail?: boolean;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(function Sidebar({ rail = false, className, children, ...props }, ref) {
  return (
    <RailContext.Provider value={rail}>
      <nav
        ref={ref}
        aria-label="Main"
        data-pane="sidebar"
        data-rail={rail || undefined}
        className={cn('flex h-full shrink-0 flex-col bg-sidebar px-2 transition-[width] duration-200 ease-rise', rail ? 'w-[52px] items-center' : 'w-60', className)}
        {...props}
      >
        {children}
      </nav>
    </RailContext.Provider>
  );
});
Sidebar.displayName = 'Sidebar';

export interface SidebarHeaderProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  rail?: boolean;
  /** Where the logo goes. */
  href?: string;
  /** The logo link's accessible name. */
  label?: string;
  /** The logo beside the collapse button. Defaults to the Sole lockup. */
  logo?: React.ReactNode;
  /** The logo in the rail, where it doubles as the expand button. Defaults to the Sole mark. */
  mark?: React.ReactNode;
  /** Collapses the sidebar, or expands the rail. Without it there is no button. */
  onToggle?: () => void;
}

export const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(function SidebarHeader(
  { rail: railProp, href = '/', label = 'Go to Home', logo, mark, onToggle, className, ...props },
  ref,
) {
  const rail = useRail(railProp);
  if (rail) {
    return (
      <div ref={ref} className={cn('flex h-[60px] shrink-0 items-center justify-center', className)} {...props}>
        {onToggle ? (
          <RailTip label="Expand the sidebar">
            <button
              type="button"
              onClick={onToggle}
              aria-label="Expand the sidebar"
              className="group/mark inline-flex size-9 items-center justify-center rounded-md text-subtle-foreground outline-none hover:bg-sidebar-hover hover:text-foreground focus-visible:shadow-[var(--focus-ring)]"
            >
              <span className="group-hover/mark:hidden group-focus-visible/mark:hidden">{mark ?? <SoleMark size={20} />}</span>
              <PanelLeft size={16} strokeWidth={1.8} aria-hidden="true" className="hidden group-hover/mark:block group-focus-visible/mark:block" />
            </button>
          </RailTip>
        ) : (
          (mark ?? <SoleMark size={20} />)
        )}
      </div>
    );
  }
  return (
    <div ref={ref} className={cn('flex h-[66px] shrink-0 items-center justify-between pt-3 pl-2', className)} {...props}>
      <SoleLink href={href} aria-label={label} className="rounded-md outline-none focus-visible:shadow-[var(--focus-ring)]">
        {logo ?? <SoleLockup size={20} />}
      </SoleLink>
      {onToggle && (
        <RailTip label="Collapse the sidebar">
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse the sidebar"
            className="inline-flex size-7 items-center justify-center rounded-md text-subtle-foreground outline-none hover:bg-sidebar-hover hover:text-foreground focus-visible:shadow-[var(--focus-ring)]"
          >
            <PanelLeft size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </RailTip>
      )}
    </div>
  );
});
SidebarHeader.displayName = 'SidebarHeader';

/** A stack of rows: 2px apart, or 4px apart and centred in the rail. */
export const SidebarSection = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'> & { rail?: boolean }>(function SidebarSection(
  { rail: railProp, className, ...props },
  ref,
) {
  const rail = useRail(railProp);
  return <div ref={ref} className={cn('flex w-full flex-col', rail ? 'items-center gap-1' : 'gap-0.5', className)} {...props} />;
});
SidebarSection.displayName = 'SidebarSection';

/** The middle of the sidebar: it takes the spare height and scrolls when the rows do not fit. */
export const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'> & { rail?: boolean }>(function SidebarContent(
  { rail: railProp, className, ...props },
  ref,
) {
  const rail = useRail(railProp);
  return <div ref={ref} className={cn('flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto', rail ? 'mt-4 items-center' : 'mt-3', className)} {...props} />;
});
SidebarContent.displayName = 'SidebarContent';

/** The bottom of the sidebar (settings, the user row), pinned under the scrolling middle. */
export const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'> & { rail?: boolean }>(function SidebarFooter(
  { rail: railProp, className, ...props },
  ref,
) {
  const rail = useRail(railProp);
  return <div ref={ref} className={cn('flex w-full shrink-0 flex-col pt-2', rail ? 'items-center gap-1 pb-4' : 'gap-0.5 pb-5', className)} {...props} />;
});
SidebarFooter.displayName = 'SidebarFooter';

export interface SidebarItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** An address in the app: the row is a link. Without it the row is a button. */
  href?: string;
  /** Drawn at 16px; its stroke is 1.8, and 2.1 when active. An emoji works too. */
  icon: React.ReactNode;
  label: string;
  /** The current page. Sets `aria-current`. The caller decides, so a row is never current by accident. */
  active?: boolean;
  /** A count: `text` is drawn, `label` is what a screen reader hears ("2 unread mentions"). */
  badge?: { text: string; label: string };
  /** Keys shown on hover, as `Kbd` takes them: `['mod', 'J']`. Hidden while there is a badge. */
  shortcut?: string[];
  /** What the rail's tooltip adds after the label. Defaults to the shortcut's keys, else the badge's label. */
  hint?: string;
  /** Something at the right edge, such as a count that shows on hover (`group-hover/nav:opacity-100`). */
  trailing?: React.ReactNode;
  rail?: boolean;
}

export const SidebarItem = React.forwardRef<HTMLElement, SidebarItemProps>(function SidebarItem(
  { href, icon, label, active = false, badge, shortcut, hint, trailing, rail: railProp, className, ...props },
  ref,
) {
  const rail = useRail(railProp);
  const classes = cn(itemClass(active), 'group/nav relative', rail && railClass, className);
  const common = {
    'aria-current': active ? ('page' as const) : undefined,
    'aria-label': rail ? (badge ? `${label}, ${badge.label}` : label) : undefined,
    className: classes,
    ...props,
  };
  const inner = (
    <>
      <span
        aria-hidden="true"
        className={cn('flex shrink-0 items-center justify-center [&>svg]:size-4', active ? '[&>svg]:[stroke-width:2.1]' : '[&>svg]:[stroke-width:1.8]')}
      >
        {icon}
      </span>
      {!rail && <span className="flex-1 truncate text-left">{label}</span>}
      {!rail && badge && <CountBadge label={badge.label}>{badge.text}</CountBadge>}
      {!rail && shortcut && !badge && <Kbd keys={shortcut} className="opacity-0 transition-opacity group-hover/nav:opacity-100" />}
      {!rail && trailing}
    </>
  );
  // One ref type for both elements; each branch narrows it to the element it renders.
  const row = href ? (
    <SoleLink ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...common}>
      {inner}
    </SoleLink>
  ) : (
    <button ref={ref as React.Ref<HTMLButtonElement>} type="button" {...common}>
      {inner}
    </button>
  );
  if (!rail) return row;
  // Counts are words in the tooltip, never a dot on the icon (brand-and-ux 4.3).
  return (
    <RailTip label={label} hint={hint ?? (shortcut ? keysText(shortcut, ' ') : badge?.label)}>
      {row}
    </RailTip>
  );
});
SidebarItem.displayName = 'SidebarItem';

export interface SidebarGroupProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  label: string;
  /** Controlled. Leave it out and the group keeps its own state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  rail?: boolean;
  children: React.ReactNode;
}

/** A labelled, collapsible list of rows. In the rail the label becomes a short rule and the rows always show. */
export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(function SidebarGroup(
  { label, open: openProp, defaultOpen = true, onOpenChange, rail: railProp, className, children, ...props },
  ref,
) {
  const rail = useRail(railProp);
  const [own, setOwn] = React.useState(defaultOpen);
  const open = openProp ?? own;
  const toggle = () => {
    if (openProp === undefined) setOwn(!open);
    onOpenChange?.(!open);
  };
  return (
    <div ref={ref} className={cn('flex flex-col', rail ? 'mt-1 items-center gap-1' : 'gap-0.5', className)} {...props}>
      {rail ? (
        <div className="my-1 h-px w-6 bg-border" aria-hidden="true" />
      ) : (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="mt-4 flex h-7 items-center justify-between rounded-md px-2 text-micro text-subtle-foreground outline-none hover:text-foreground focus-visible:shadow-[var(--focus-ring)]"
        >
          {label}
          <ChevronDown size={14} aria-hidden="true" className={cn('text-faint transition-transform duration-200', !open && '-rotate-90')} />
        </button>
      )}
      {(open || rail) && children}
    </div>
  );
});
SidebarGroup.displayName = 'SidebarGroup';

export interface SidebarUserProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> {
  person: SolePerson;
  /** The line under the name, such as "Admin". */
  meta?: string;
  rail?: boolean;
  /** The menu's rows: `DropdownMenuItem`, `DropdownMenuSeparator` and the rest of `ui/dropdown-menu`. The name heads the menu. */
  children?: React.ReactNode;
}

/** The user row and its menu (20.4-user-menu.png). */
export const SidebarUser = React.forwardRef<HTMLButtonElement, SidebarUserProps>(function SidebarUser(
  { person, meta, rail: railProp, className, children, ...props },
  ref,
) {
  const rail = useRail(railProp);
  const name = personName(person);
  const trigger = (
    <DropdownMenuTrigger
      ref={ref}
      aria-label={`${name}, open the menu`}
      className={cn(
        'flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1 text-left outline-none transition-colors duration-[120ms] hover:bg-sidebar-hover focus-visible:shadow-[var(--focus-ring)]',
        // The rail's avatar sits 4px closer to the row below it than the rows above it do (20.1).
        rail && cn(railClass, '-mt-1'),
        className,
      )}
      {...props}
    >
      <Avatar person={person} size={24} />
      {!rail && (
        <>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body leading-4 font-medium text-foreground">{name}</span>
            {meta && <span className="truncate text-label leading-4 font-normal text-subtle-foreground">{meta}</span>}
          </span>
          <ChevronsUpDown size={14} aria-hidden="true" className="shrink-0 text-subtle-foreground" />
        </>
      )}
    </DropdownMenuTrigger>
  );
  return (
    <DropdownMenu>
      {rail ? <RailTip label={name}>{trigger}</RailTip> : trigger}
      <DropdownMenuContent side={rail ? 'right' : 'top'} align={rail ? 'end' : 'start'} sideOffset={rail ? 8 : 0} className="w-[223px]">
        <DropdownMenuLabel className="truncate text-micro text-subtle-foreground">{name}</DropdownMenuLabel>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
SidebarUser.displayName = 'SidebarUser';

export interface SidebarSearchProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> {
  rail?: boolean;
}

/** The Search field that opens the command palette. It is a button: the palette has the real input. */
export const SidebarSearch = React.forwardRef<HTMLButtonElement, SidebarSearchProps>(function SidebarSearch({ rail: railProp, className, ...props }, ref) {
  const rail = useRail(railProp);
  const button = (
    <button
      ref={ref}
      type="button"
      aria-label={rail ? 'Search' : undefined}
      aria-keyshortcuts="Meta+K Control+K"
      className={cn(
        rail
          ? cn(itemClass(false), railClass)
          : 'flex h-8 w-full items-center gap-2 rounded-lg border border-border bg-card px-[7px] text-body text-subtle-foreground shadow-xs outline-none transition-colors duration-[120ms] hover:border-input hover:text-muted-foreground focus-visible:shadow-[var(--focus-ring)]',
        className,
      )}
      {...props}
    >
      <Search size={rail ? 16 : 14} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
      {!rail && (
        <>
          <span className="flex-1 text-left">Search</span>
          <Kbd keys={['mod', 'K']} />
        </>
      )}
    </button>
  );
  return rail ? (
    <RailTip label="Search" hint={keysText(['mod', 'K'], ' ')}>
      {button}
    </RailTip>
  ) : (
    button
  );
});
SidebarSearch.displayName = 'SidebarSearch';
