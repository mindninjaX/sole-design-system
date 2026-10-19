'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';
import { FORMER_MEMBER, personName, type SolePerson } from '../../lib/person.ts';
import { SoleLink, useSole } from '../../lib/sole-provider.tsx';
import { Avatar } from './avatar.tsx';

// A 20px avatar and the name, linking to the person. The bot shows as Taskmate and
// links nowhere; someone who has gone shows as "Former member" (brand-and-ux 5.12).
// The link comes from the provider's `personHref`; without one the chip is plain text.

export interface PersonChipProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> {
  person: SolePerson | null | undefined;
  /** Set false for a chip that must not link, e.g. inside another link. */
  link?: boolean;
}

export const PersonChip = React.forwardRef<HTMLElement, PersonChipProps>(function PersonChip({ person, link = true, className, ...props }, ref) {
  const { personHref } = useSole();
  const name = person ? personName(person) : FORMER_MEMBER;
  const inner = (
    <>
      <Avatar person={person} size={20} />
      <span className={cn('truncate', !person && 'text-subtle-foreground')}>{name}</span>
    </>
  );
  const base = 'inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 text-body font-medium';
  const href = link && person && !person.isBot ? personHref(person) : null;
  if (!href) {
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} className={cn(base, className)} {...props}>
        {inner}
      </span>
    );
  }
  return (
    <SoleLink
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={href}
      className={cn(base, 'transition-colors duration-[120ms] hover:bg-row-hover focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none', className)}
      {...props}
    >
      {inner}
    </SoleLink>
  );
});
PersonChip.displayName = 'PersonChip';
