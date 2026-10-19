'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';

// The one frame every signed-in screen renders inside (U5). The sidebar on the canvas, the
// content panel inset 8px with a 12px radius, and an aside docked beside it, pushing the
// content rather than covering it.
//
// Desktop only (D32): the layout holds from 1024px up. Narrower windows keep the same
// layout and scroll sideways; there is no phone layout and no bottom tab bar.

export interface AppFrameProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  /** A `Sidebar`. */
  sidebar: React.ReactNode;
  /** A panel docked beside the content, such as an assistant. Leave it out when closed. */
  aside?: React.ReactNode;
  /** A strip above the content panel. It sits in the 8px gap, so the panel gets no top gap of its own. */
  banner?: React.ReactNode;
  /** Classes for the content panel, for an app that restyles the screen beside its aside. */
  contentClassName?: string;
  /** The screen: usually a `Page`. */
  children: React.ReactNode;
}

export const AppFrame = React.forwardRef<HTMLDivElement, AppFrameProps>(function AppFrame(
  { sidebar, aside, banner, contentClassName, children, className, ...props },
  ref,
) {
  return (
    <div ref={ref} data-app-shell className={cn('flex h-dvh w-full min-w-[1024px] overflow-hidden bg-background', className)} {...props}>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {banner}
        <div className={cn('flex min-h-0 flex-1 gap-2 pr-2 pb-2', !banner && 'pt-2')}>
          <main
            id="content"
            data-pane="content"
            data-has-aside={aside ? true : undefined}
            className={cn('relative min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-card', contentClassName)}
          >
            {children}
          </main>
          {aside}
        </div>
      </div>
    </div>
  );
});
AppFrame.displayName = 'AppFrame';
