'use client';

import * as React from 'react';
import { cn } from '../lib/cn.ts';
import { SoleLink } from '../lib/sole-provider.tsx';
import type { BoardSummary } from './types.ts';

// A board's emoji and name. The emoji is data, not copy, so it is allowed (W4).

export interface BoardEmojiProps extends React.ComponentPropsWithoutRef<'span'> {
  board: Pick<BoardSummary, 'emoji'>;
}

export const BoardEmoji = React.forwardRef<HTMLSpanElement, BoardEmojiProps>(function BoardEmoji({ board, className, ...props }, ref) {
  return (
    <span {...props} ref={ref} aria-hidden="true" className={cn('inline-flex w-4 shrink-0 justify-center text-[14px] leading-none', className)}>
      {board.emoji || '📁'}
    </span>
  );
});
BoardEmoji.displayName = 'BoardEmoji';

export interface BoardChipProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> {
  board: BoardSummary;
  /** Where the board opens. With it the chip is a link; without it, plain text. */
  href?: string;
}

export const BoardChip = React.forwardRef<HTMLElement, BoardChipProps>(function BoardChip({ board, href, className, ...props }, ref) {
  const classes = cn('inline-flex h-[22px] max-w-48 shrink-0 items-center gap-1.5 rounded-md bg-neutral-soft px-2 text-label text-neutral-text', className);
  const inner = (
    <>
      <BoardEmoji board={board} className="text-[12px]" />
      <span className="truncate">{board.name}</span>
    </>
  );
  if (!href) {
    return (
      <span {...props} ref={ref as React.Ref<HTMLSpanElement>} className={classes}>
        {inner}
      </span>
    );
  }
  // The span props are the anchor's too, apart from the handlers' element type, so they are spread as a link's.
  const linkProps = props as React.ComponentPropsWithoutRef<'a'>;
  return (
    <SoleLink
      {...linkProps}
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={href}
      className={cn(classes, 'hover:bg-sidebar-hover focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none')}
    >
      {inner}
    </SoleLink>
  );
});
BoardChip.displayName = 'BoardChip';
