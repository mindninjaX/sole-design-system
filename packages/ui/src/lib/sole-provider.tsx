'use client';

import { createContext, forwardRef, useContext, useEffect, useMemo, useState } from 'react';
import type { AnchorHTMLAttributes, ComponentType, ReactNode, RefAttributes } from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { SYDNEY, todayDate } from './dates.ts';
import type { DateOnly } from './dates.ts';
import type { SolePerson } from './person.ts';

export interface SoleLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
}

/** A router's link, adapted to take `href`: react-router's `Link`, Next's `Link`, or a plain anchor. */
export type SoleLinkComponent = ComponentType<SoleLinkProps & RefAttributes<HTMLAnchorElement>>;

export interface SoleProviderProps {
  children: ReactNode;
  /** The link every part uses for an in-app address. Defaults to a plain `<a>`. */
  linkComponent?: SoleLinkComponent;
  /** The work clock's time zone. Defaults to Australia/Sydney. */
  timeZone?: string;
  /** The app's clock. Defaults to the real one; a demo or a test pins it. */
  now?: () => Date;
  /** Where a person's name links to, or null for no link. Defaults to no link. */
  personHref?: (person: SolePerson) => string | null;
}

const PlainLink = forwardRef<HTMLAnchorElement, SoleLinkProps>(function PlainLink(props, ref) {
  return <a ref={ref} {...props} />;
});

interface SoleContextValue {
  linkComponent: SoleLinkComponent;
  timeZone: string;
  now: () => Date;
  personHref: (person: SolePerson) => string | null;
}

const defaults: SoleContextValue = {
  linkComponent: PlainLink,
  timeZone: SYDNEY,
  now: () => new Date(),
  personHref: () => null,
};

const SoleContext = createContext<SoleContextValue>(defaults);

export function SoleProvider({ children, linkComponent, timeZone, now, personHref }: SoleProviderProps) {
  const value = useMemo<SoleContextValue>(
    () => ({
      linkComponent: linkComponent ?? defaults.linkComponent,
      timeZone: timeZone ?? defaults.timeZone,
      now: now ?? defaults.now,
      personHref: personHref ?? defaults.personHref,
    }),
    [linkComponent, timeZone, now, personHref],
  );
  // Radix tooltips need a provider above them. It lives here so a consumer wraps the app once.
  return (
    <SoleContext.Provider value={value}>
      <TooltipPrimitive.Provider delayDuration={400}>{children}</TooltipPrimitive.Provider>
    </SoleContext.Provider>
  );
}

/** The provider's four values, or the defaults when there is no provider. */
export function useSole(): SoleContextValue {
  return useContext(SoleContext);
}

/** A link to an address inside the app. An absolute `http` address is always a plain anchor. */
export const SoleLink = forwardRef<HTMLAnchorElement, SoleLinkProps>(function SoleLink(props, ref) {
  const { linkComponent: Link } = useSole();
  if (/^https?:/i.test(props.href)) return <PlainLink ref={ref} {...props} />;
  return <Link ref={ref} {...props} />;
});

/** The current time, refreshed every `intervalMs` (a minute by default). */
export function useNow(intervalMs = 60_000): Date {
  const { now } = useSole();
  const [value, setValue] = useState(() => now());
  useEffect(() => {
    setValue(now());
    const timer = setInterval(() => setValue(now()), intervalMs);
    return () => clearInterval(timer);
  }, [now, intervalMs]);
  return value;
}

/** Today on the work clock, rolling over at midnight. */
export function useToday(): DateOnly {
  const { timeZone } = useSole();
  return todayDate(useNow(), timeZone);
}
