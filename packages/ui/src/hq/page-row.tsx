'use client';

import { FileText, Lock } from 'lucide-react';
import * as React from 'react';
import { AvatarStack } from '../components/sole/avatar.tsx';
import { cn } from '../lib/cn.ts';
import { dateIn, formatDate } from '../lib/dates.ts';
import type { DateOnly, Timestamp } from '../lib/dates.ts';
import type { SolePerson } from '../lib/person.ts';
import { SoleLink, useSole, useToday } from '../lib/sole-provider.tsx';
import { ReviewBadge } from './review-badge.tsx';

const NO_TAGS: Array<{ id: string; name: string }> = [];
const NO_PEOPLE: SolePerson[] = [];

// A wiki page row (brand-and-ux 5.14): 52px, the whole row is the link. Title and
// review pill; folder, tags and comment count; owner first, then collaborators; the
// date it was last updated.

export interface PageRowProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title' | 'children'> {
  /** Where the page opens. The title is the link, stretched over the whole row. */
  href: string;
  title: string;
  isPrivate?: boolean;
  reviewDue: DateOnly | null;
  /** "Knowledge", when the list mixes spaces (80.2 Pages they own, 02.7). */
  spaceName?: string | null;
  folderName?: string | null;
  tags?: Array<{ id: string; name: string }>;
  commentCount?: number;
  owner: SolePerson | null;
  collaborators?: SolePerson[];
  updatedAt: Timestamp;
  /** Defaults to today on the provider's clock. */
  today?: DateOnly;
  /** The row's overflow menu, shown on hover. */
  actions?: React.ReactNode;
}

export const PageRow = React.forwardRef<HTMLDivElement, PageRowProps>(function PageRow(
  {
    href,
    title,
    isPrivate = false,
    reviewDue,
    spaceName,
    folderName,
    tags = NO_TAGS,
    commentCount = 0,
    owner,
    collaborators = NO_PEOPLE,
    updatedAt,
    today,
    actions,
    className,
    ...props
  },
  ref,
) {
  const current = useToday();
  const { timeZone } = useSole();
  const day = today ?? current;
  const people = [owner, ...collaborators.filter((c) => c.id !== owner?.id)].filter((p): p is SolePerson => !!p);
  const meta: Array<{ key: string; text: string }> = [];
  if (spaceName) meta.push({ key: 'space', text: spaceName });
  meta.push({ key: 'folder', text: folderName ?? 'Unfiled' });
  if (tags.length) meta.push({ key: 'tags', text: tags.map((t) => t.name).join(', ') });
  if (isPrivate) meta.push({ key: 'private', text: 'Private to you' });
  if (commentCount > 0) meta.push({ key: 'comments', text: `${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}` });
  const Icon = isPrivate ? Lock : FileText;

  return (
    <div {...props} ref={ref} className={cn('group/page relative flex h-[52px] items-center gap-3 border-b border-hairline px-3 hover:bg-row-hover', className)}>
      <Icon size={16} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-subtle-foreground" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 items-center gap-2">
          <SoleLink href={href} className="truncate text-strong font-medium text-foreground outline-none after:absolute after:inset-0 focus-visible:underline">
            {title || 'Untitled'}
          </SoleLink>
          <ReviewBadge reviewDue={reviewDue} today={day} />
        </div>
        <p className="truncate text-label font-normal text-subtle-foreground">
          {meta.map((m, i) => (
            <span key={m.key}>
              {i > 0 && <span aria-hidden="true" className="mx-[3px]"> · </span>}
              {m.text}
            </span>
          ))}
        </p>
      </div>
      <AvatarStack people={people} max={3} />
      <time dateTime={updatedAt} className="tnum w-[84px] shrink-0 text-right text-label font-normal text-subtle-foreground">
        {formatDate(dateIn(updatedAt, timeZone), day, { year: true })}
      </time>
      {actions && <div className="relative z-10 opacity-0 group-hover/page:opacity-100 focus-within:opacity-100">{actions}</div>}
    </div>
  );
});
PageRow.displayName = 'PageRow';
