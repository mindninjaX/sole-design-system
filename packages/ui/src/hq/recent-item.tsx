'use client';

import { FileText, SquareCheck } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/cn.ts';
import { SoleLink } from '../lib/sole-provider.tsx';
import type { SoleLinkProps } from '../lib/sole-provider.tsx';

export interface RecentItemProps extends Omit<SoleLinkProps, 'children' | 'title'> {
  kind: 'page' | 'work_item';
  /** For a work item, "ENG-14 Fix the pricing copy on the plans page". */
  title: React.ReactNode;
  /** "Knowledge", "Engineering". */
  where?: React.ReactNode;
}

/** Recent item (30.1 Recently viewed): a page or work item icon, the title, where it lives. */
export const RecentItem = React.forwardRef<HTMLAnchorElement, RecentItemProps>(function RecentItem({ kind, title, where, className, ...props }, ref) {
  const Icon = kind === 'page' ? FileText : SquareCheck;
  return (
    <SoleLink
      ref={ref}
      className={cn(
        'flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-2 outline-none transition-colors duration-[120ms] hover:bg-row-hover focus-visible:shadow-[inset_0_0_0_2px_var(--brand)]',
        className,
      )}
      {...props}
    >
      <Icon size={16} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-subtle-foreground" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body leading-[18px] font-medium text-foreground">{title}</span>
        {where && <span className="truncate text-label font-normal text-subtle-foreground">{where}</span>}
      </span>
    </SoleLink>
  );
});
RecentItem.displayName = 'RecentItem';
