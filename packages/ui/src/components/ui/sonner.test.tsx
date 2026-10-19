import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { toast } from 'sonner';
import { afterEach, describe, expect, it } from 'vitest';
import { renderUi } from '../../../test/render.tsx';
import { Toaster, useToastLift } from './sonner.tsx';

// The toasts as 90.6 and 70.4 draw them: where they sit, their padding, and the icon on
// the title's line. The pixel check against the PNGs is in the report; this pins the
// numbers that produce it.

const toaster = () => document.querySelector<HTMLElement>('[data-sonner-toaster]');
const offset = (side: 'bottom' | 'right') => toaster()?.style.getPropertyValue(`--offset-${side}`);

function Lifted({ bottom, right }: { bottom: number; right?: number }) {
  useToastLift(bottom, right);
  return null;
}

// Mounts the lift, then lets the test unmount it from inside the same tree.
function Harness() {
  const [lifted, setLifted] = useState(true);
  return (
    <>
      <Toaster />
      {lifted && <Lifted bottom={150} />}
      <button type="button" onClick={() => setLifted(false)}>
        Settle
      </button>
    </>
  );
}

afterEach(() => {
  act(() => void toast.dismiss());
});

describe('the toaster', () => {
  it('sits 24px from the right and 36px from the bottom, as 90.6 draws it', async () => {
    renderUi(<Toaster />);
    act(() => void toast.error('You are the last admin', { description: 'Make someone else an admin first. There must always be at least one admin.' }));
    await screen.findByText('You are the last admin');
    expect(offset('bottom')).toBe('36px');
    expect(offset('right')).toBe('24px');
  });

  it('draws an error with the cross in a circle, level with the title, 11px above and below', async () => {
    renderUi(<Toaster />);
    act(() => void toast.error('Could not move that work item', { description: 'The server did not answer. Nothing changed.' }));
    const title = await screen.findByText('Could not move that work item');
    const item = title.closest<HTMLElement>('[data-sonner-toast]')!;
    expect(item.querySelector('[data-icon] svg')?.getAttribute('class')).toMatch(/lucide-circle-x/);
    expect(item.querySelector('[data-icon] svg')?.getAttribute('class')).not.toMatch(/octagon/);
    expect(item.className).toContain('!py-[11px]');
    expect(item.querySelector('[data-icon]')?.className).toContain('!mt-0');
    expect(title.className).toContain('!leading-[17px]');
    expect(item.querySelector('[data-description]')?.className).toContain('!leading-4');
  });

  it('draws a success with the tick in a circle and its action on the title’s line (70.4)', async () => {
    renderUi(<Toaster />);
    act(() => void toast.success('Saved to the Knowledge wiki', { description: 'How do we handle a payroll re-run after month end?', action: { label: 'Open the page', onClick: () => {} } }));
    const title = await screen.findByText('Saved to the Knowledge wiki');
    const item = title.closest<HTMLElement>('[data-sonner-toast]')!;
    expect(item.querySelector('[data-icon] svg')?.getAttribute('class')).toMatch(/lucide-circle-check/);
    expect(screen.getByRole('button', { name: 'Open the page' }).className).toContain('!-mt-1');
  });

  it('lifts clear of a composer while a screen asks it to, and comes back down after', async () => {
    const user = userEvent.setup();
    renderUi(<Harness />);
    act(() => void toast.success('Saved to the Knowledge wiki'));
    await screen.findByText('Saved to the Knowledge wiki');
    expect(offset('bottom')).toBe('150px');
    expect(offset('right')).toBe('24px');
    await user.click(screen.getByRole('button', { name: 'Settle' }));
    expect(offset('bottom')).toBe('36px');
  });
});
