import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SoleProvider } from '../src/lib/sole-provider.tsx';
import type { SoleProviderProps } from '../src/lib/sole-provider.tsx';

/** The fixed "today" for every test and example: Tuesday 29 Sep 2026, 3:00 PM in Sydney. */
export const NOW = new Date('2026-09-29T05:00:00Z');

/** Renders `ui` inside a SoleProvider pinned to NOW. */
export function renderUi(ui: ReactNode, opts: { provider?: Partial<Omit<SoleProviderProps, 'children'>> } = {}) {
  return render(
    <SoleProvider now={() => NOW} timeZone="Australia/Sydney" {...opts.provider}>
      {ui}
    </SoleProvider>,
  );
}
