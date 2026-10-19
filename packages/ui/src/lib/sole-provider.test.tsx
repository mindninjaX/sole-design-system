import { render, screen } from '@testing-library/react';
import { createRef, forwardRef } from 'react';
import { describe, expect, it } from 'vitest';
import { SoleLink, SoleProvider, useToday } from './sole-provider.tsx';
import type { SoleLinkProps } from './sole-provider.tsx';

const Marked = forwardRef<HTMLAnchorElement, SoleLinkProps>(function Marked(props, ref) {
  return <a ref={ref} data-router {...props} />;
});

function Today() {
  return <span data-testid="today">{useToday()}</span>;
}

describe('SoleLink', () => {
  it('uses the provider link for an app address', () => {
    render(
      <SoleProvider linkComponent={Marked}>
        <SoleLink href="/x">Inside</SoleLink>
      </SoleProvider>,
    );
    expect(screen.getByText('Inside')).toHaveAttribute('data-router');
  });

  it('renders a plain anchor for an http address', () => {
    render(
      <SoleProvider linkComponent={Marked}>
        <SoleLink href="https://example.com">Outside</SoleLink>
      </SoleProvider>,
    );
    expect(screen.getByText('Outside')).not.toHaveAttribute('data-router');
  });

  it('forwards its ref to the anchor', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <SoleProvider linkComponent={Marked}>
        <SoleLink ref={ref} href="/x">
          Ref
        </SoleLink>
      </SoleProvider>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });
});

describe('useToday', () => {
  it('uses the work clock: Sydney is already the 30th', () => {
    render(
      <SoleProvider now={() => new Date('2026-09-29T14:30:00Z')} timeZone="Australia/Sydney">
        <Today />
      </SoleProvider>,
    );
    expect(screen.getByTestId('today')).toHaveTextContent('2026-09-30');
  });
});
