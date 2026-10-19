'use client';

import * as React from 'react';
import { Avatar } from '../components/sole/avatar.tsx';
import { cn } from '../lib/cn.ts';
import { FORMER_MEMBER, personName } from '../lib/person.ts';
import type { SolePerson } from '../lib/person.ts';

// The two inline chips (02-components.png 02.8): how an @mention reads in any rendered
// text, and the [2] source marker in an Ask answer.

export interface MentionChipProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> {
  /** The person, when known, for the current name and the avatar colour. */
  person?: SolePerson | null;
  /** The name stored in the document, used when the person is not loaded. */
  label?: string;
}

/**
 * Mention chip: how an @mention reads in any rendered text. The 16px avatar and the name
 * in blue on the accent fill; 22px, but set in the line without making it taller.
 */
export const MentionChip = React.forwardRef<HTMLSpanElement, MentionChipProps>(function MentionChip({ person, label, className, ...props }, ref) {
  const name = person ? personName(person) : label || FORMER_MEMBER;
  return (
    <span
      ref={ref}
      data-mention={person?.id ?? ''}
      className={cn(
        'mx-px -my-px inline-flex h-[22px] max-w-full items-center gap-1 rounded-md bg-accent pr-1.5 pl-[3px] align-middle text-[0.8125rem] leading-none font-medium whitespace-nowrap text-accent-foreground',
        className,
      )}
      {...props}
    >
      {person ? <Avatar person={person} size={16} /> : <span aria-hidden="true">@</span>}
      <span className="truncate">{name}</span>
    </span>
  );
});
MentionChip.displayName = 'MentionChip';

export interface CitationChipProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick' | 'children'> {
  /** The source number: 2 reads "[2]" in the answer and is named "Source 2". */
  n: number;
  /** Makes the chip a link. */
  href?: string;
  /** Makes the chip a button, or runs beside the link. */
  onClick?: () => void;
}

/** Citation chip: [2] in an Ask answer, a 16px square, 10/600 on the muted fill. A link, a button or plain, by what it is given. */
export const CitationChip = React.forwardRef<HTMLElement, CitationChipProps>(function CitationChip({ n, href, onClick, className, ...props }, ref) {
  const classes = cn(
    'mx-0.5 inline-flex size-4 items-center justify-center rounded-sm bg-muted align-[1px] text-[10px] leading-none font-semibold text-muted-foreground tnum',
    (href || onClick) && 'outline-none hover:bg-accent hover:text-accent-foreground focus-visible:shadow-[var(--focus-ring)]',
    className,
  );
  const label = `Source ${n}`;
  if (href) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} onClick={onClick} aria-label={label} className={classes} {...props}>
        {n}
      </a>
    );
  }
  if (onClick) {
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type="button" onClick={onClick} aria-label={label} className={classes} {...props}>
        {n}
      </button>
    );
  }
  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} aria-label={label} className={classes} {...props}>
      {n}
    </span>
  );
});
CitationChip.displayName = 'CitationChip';
