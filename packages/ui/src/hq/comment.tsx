'use client';

import * as React from 'react';
import { Avatar } from '../components/sole/avatar.tsx';
import { cn } from '../lib/cn.ts';
import { formatDayTime, formatFullTimestamp } from '../lib/dates.ts';
import type { Timestamp } from '../lib/dates.ts';
import { personName } from '../lib/person.ts';
import type { SolePerson } from '../lib/person.ts';
import { useNow, useSole } from '../lib/sole-provider.tsx';

// A comment (02-components.png 02.6; 50.6, 60.5): a 24px avatar, the name at 13/600, the
// time at 12px, then the body. Work item comments are 13/20; `reading` sets the page
// comment size, 14/20. The rich body and its actions are the app's: the body is `children`.

export interface CommentProps extends Omit<React.ComponentPropsWithoutRef<'article'>, 'children'> {
  /** Who wrote it. `null` is a former member. */
  author: SolePerson | null | undefined;
  /**
   * Who really wrote it, when a bot posted it for someone: "Ava (from the Dialer)". The name reads as the label and the
   * avatar stays the bot's, so it is plain that it came through the Dialer.
   */
  label?: string | null;
  createdAt: Timestamp;
  edited?: boolean;
  resolved?: boolean;
  /** Page comments: the body at 14/20. */
  reading?: boolean;
  /** Overrides the provider's clock. */
  now?: Date;
  /** The viewer's time zone for the stamp. Defaults to the provider's. */
  tz?: string;
  /** Edit, Delete: shown on hover at the end of the header. */
  actions?: React.ReactNode;
  /** The rendered body. */
  children: React.ReactNode;
}

export const Comment = React.forwardRef<HTMLElement, CommentProps>(function Comment(
  { author, label, createdAt, edited = false, resolved = false, reading = false, now, tz, actions, children, className, ...props },
  ref,
) {
  const tick = useNow();
  const { timeZone } = useSole();
  const zone = tz ?? timeZone;
  return (
    <article ref={ref} className={cn('group/comment flex min-w-0 gap-2.5', resolved && 'opacity-60', className)} {...props}>
      <Avatar person={author} size={24} />
      <div className="min-w-0 flex-1">
        <header className="flex min-h-4 flex-wrap items-center gap-x-2 [&>*]:leading-4">
          <span className={cn('text-body leading-4 font-semibold text-foreground', !author && 'text-subtle-foreground')}>{label?.trim() || personName(author)}</span>
          <time dateTime={createdAt} title={formatFullTimestamp(createdAt, zone)} className="tnum text-label font-normal text-subtle-foreground">
            {formatDayTime(createdAt, now ?? tick, zone)}
          </time>
          {edited && <span className="text-label font-normal text-subtle-foreground">edited</span>}
          {resolved && <span className="text-label text-success-text">Resolved</span>}
          {actions && (
            <span className="ml-auto flex items-center gap-3 self-center opacity-0 transition-opacity duration-[120ms] group-hover/comment:opacity-100 focus-within:opacity-100">
              {actions}
            </span>
          )}
        </header>
        <div className={cn('text-foreground', reading ? 'mt-1 text-[14px] leading-5' : 'mt-[3px] text-body')}>{children}</div>
      </div>
    </article>
  );
});
Comment.displayName = 'Comment';
