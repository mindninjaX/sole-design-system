'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';
import { personName, type SolePerson } from '../../lib/person.ts';
import { Avatar } from './avatar.tsx';
import { Pill } from './pill.tsx';

const NO_META: readonly string[] = [];

// Person header (80.2): the 64px avatar, the name at 20/28 with an Admin pill, one meta
// line joined by middle dots, and actions on the right ("Linked to Slack").

export interface PersonHeaderProps extends Omit<React.ComponentPropsWithoutRef<'header'>, 'children'> {
  person: SolePerson;
  admin?: boolean;
  /** "Payroll lead", the email, "Perth, 2 hours behind Sydney". Empty parts are dropped. */
  meta?: ReadonlyArray<string | null | undefined | false>;
  actions?: React.ReactNode;
}

export const PersonHeader = React.forwardRef<HTMLElement, PersonHeaderProps>(function PersonHeader(
  { person, admin = false, meta = NO_META, actions, className, ...props },
  ref,
) {
  // Each part once, so it can be its own key.
  const parts = [...new Set(meta.filter((m): m is string => typeof m === 'string' && m !== ''))];
  return (
    <header ref={ref} className={cn('flex min-w-0 items-center gap-4', className)} {...props}>
      <Avatar person={person} size={64} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-page text-foreground">{personName(person)}</h1>
          {admin && <Pill tone="neutral">Admin</Pill>}
        </div>
        {parts.length > 0 && (
          <p className="mt-px truncate text-body text-subtle-foreground">
            {parts.map((part, i) => (
              <span key={part}>
                {i > 0 && (
                  <span aria-hidden="true" className="px-[7px]">
                    ·
                  </span>
                )}
                {part}
              </span>
            ))}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
});
PersonHeader.displayName = 'PersonHeader';

export interface AvatarRowProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title' | 'children'> {
  person: SolePerson;
  title: React.ReactNode;
  body?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Avatar row (80.3 Profile): the 64px avatar with a 13/500 line and a 12px line beside it, and
 * the buttons that change the picture (Change, Remove) on the right.
 */
export const AvatarRow = React.forwardRef<HTMLDivElement, AvatarRowProps>(function AvatarRow({ person, title, body, actions, className, ...props }, ref) {
  return (
    <div ref={ref} className={cn('flex min-w-0 items-center gap-3.5', className)} {...props}>
      <Avatar person={person} size={64} />
      <div className="min-w-0 flex-1">
        <p className="text-body font-medium text-foreground">{title}</p>
        {body && <p className="text-label font-normal text-subtle-foreground">{body}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
});
AvatarRow.displayName = 'AvatarRow';
