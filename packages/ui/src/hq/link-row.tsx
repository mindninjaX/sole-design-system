'use client';

import { Link2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/cn.ts';
import { SoleLink } from '../lib/sole-provider.tsx';

export interface LinkRowProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  /** An `http` address opens in a new tab; anything else goes through the provider's link. */
  href: string;
  title: React.ReactNode;
  /** "#pricing · Noah Patel · 24 Sep". */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  /** In place of the link glyph; 16px, subtle, decorative. */
  icon?: React.ReactNode;
}

/** Link row (50.6 Links): 36px box, a link icon, the title as a link, then the meta. */
export const LinkRow = React.forwardRef<HTMLDivElement, LinkRowProps>(function LinkRow({ href, title, meta, actions, icon, className, ...props }, ref) {
  const external = /^https?:\/\//.test(href);
  const linkClass = 'min-w-0 shrink truncate text-body font-medium text-link outline-none hover:underline focus-visible:underline';
  return (
    <div ref={ref} className={cn('group/link flex h-9 min-w-0 items-center gap-2 rounded-lg border border-border bg-card px-2', className)} {...props}>
      {icon ?? <Link2 size={16} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-subtle-foreground" />}
      {external ? (
        <a href={href} target="_blank" rel="noreferrer noopener" className={linkClass}>
          {title}
        </a>
      ) : (
        <SoleLink href={href} className={linkClass}>
          {title}
        </SoleLink>
      )}
      {meta && <span className="ml-1 min-w-0 flex-1 truncate text-label font-normal text-subtle-foreground">{meta}</span>}
      {actions && <span className="ml-auto flex shrink-0 items-center gap-1 opacity-0 group-hover/link:opacity-100 focus-within:opacity-100">{actions}</span>}
    </div>
  );
});
LinkRow.displayName = 'LinkRow';
