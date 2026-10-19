'use client';

import { forwardRef, useEffect, useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { CircleCheckIcon, CircleXIcon, InfoIcon, Loader2Icon, TriangleAlertIcon } from 'lucide-react';
import { Toaster as Sonner } from 'sonner';
import type { ToasterProps } from 'sonner';

// Bottom right, 360px (brand-and-ux 5.16), 24px from the right edge and 36px from the
// bottom, as 90.6 draws it. Success toasts leave after 4s; error toasts stay until
// dismissed (set per toast with duration: Infinity). Laid out as 70.4 and 90.6 draw it:
// 74px tall with a two-line message; the icon (a tick or a cross in a circle) level with the
// title, and the action on the title's line; the title at 13/17 and the description at
// 13/16, 1px apart, 11px above and below; the text 41px in from the toast's left edge.
//
// A screen with a composer at its foot (Ask Sole, the Cmd J panel) lifts the toasts clear
// of it with useToastLift while it is mounted (70.4: the toast's bottom edge 150px up,
// its right edge 24px in).

interface Lift {
  bottom: number;
  right: number;
}

const lifts: Lift[] = [];
let currentLift: Lift | null = null;
const liftListeners = new Set<() => void>();

function setLifts() {
  currentLift = lifts.at(-1) ?? null;
  for (const listen of liftListeners) listen();
}

function subscribeLift(listener: () => void) {
  liftListeners.add(listener);
  return () => {
    liftListeners.delete(listener);
  };
}

const readLift = () => currentLift;

/** Where toasts sit when no screen lifts them (90.6). */
const EDGE = { top: 16, left: 16, bottom: 36, right: 24 };

/** While mounted, toasts sit `bottom` px from the bottom and `right` px from the right. */
export function useToastLift(bottom: number, right = EDGE.right) {
  useEffect(() => {
    const lift = { bottom, right };
    lifts.push(lift);
    setLifts();
    return () => {
      lifts.splice(lifts.indexOf(lift), 1);
      setLifts();
    };
  }, [bottom, right]);
}

// `toast` is not exported here: the package re-exports sonner's own, so a consumer's calls
// and this Toaster share one sonner instance.
const Toaster = forwardRef<HTMLElement, ToasterProps>(function Toaster({ ...props }, ref) {
  const lift = useSyncExternalStore(subscribeLift, readLift, readLift);
  return (
    <Sonner
      ref={ref}
      theme="light"
      position="bottom-right"
      offset={lift ? { ...EDGE, bottom: lift.bottom, right: lift.right } : EDGE}
      duration={4000}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4 text-subtle-foreground" />,
        warning: <TriangleAlertIcon className="size-4 text-warning" />,
        error: <CircleXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            '!w-[360px] !max-w-[calc(100vw-32px)] !items-start !rounded-xl !border-border !bg-popover !py-[11px] !pr-3.5 !text-popover-foreground !shadow-lg !text-body',
          icon: '!mt-0 !ml-[-2px] !mr-[3px]',
          content: '!gap-px !pr-3.5',
          title: '!text-body !leading-[17px] !font-semibold',
          description: '!text-body !leading-4 !text-muted-foreground',
          actionButton: '!-mt-1 !bg-transparent !px-0 !text-body !text-link !font-medium',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': '12px',
          '--width': '360px',
        } as CSSProperties
      }
      {...props}
    />
  );
});
Toaster.displayName = 'Toaster';

export { Toaster };
