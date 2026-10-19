import { act, fireEvent, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bot } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { renderUi } from '../../../test/render.tsx';
import { AVATAR_COLOURS, avatarColour } from '../../lib/colour.ts';
import { HUES } from '../../lib/hue.ts';
import type { SolePerson } from '../../lib/person.ts';
import { Input } from '../ui/input.tsx';
import { Avatar, AvatarStack, type AvatarSize } from './avatar.tsx';
import { Banner, InlineError, InlineSuccess } from './banner.tsx';
import { CopyField } from './copy-field.tsx';
import { CountBadge } from './count-badge.tsx';
import { Field, ReadOnlyField } from './field.tsx';
import { Kbd, keysText } from './kbd.tsx';
import { LabelTag, LabelTags } from './label-tag.tsx';
import { SoleLockup, SoleMark } from './logo.tsx';
import { PersonChip } from './person-chip.tsx';
import { AvatarRow, PersonHeader } from './person-header.tsx';
import { Pill } from './pill.tsx';
import { CenteredState, EmptyState, ErrorState, NoAccess, SkeletonRows, useDelayed } from './states.tsx';

const ava: SolePerson = { id: 'p-ava', name: 'Ava Thompson' };
const noah: SolePerson = { id: 'p-noah', name: 'Noah Patel' };
const mia: SolePerson = { id: 'p-mia', name: 'Mia Rossi' };
const taskmate: SolePerson = { id: 'p-bot', name: 'Taskmate', isBot: true };
// A one-pixel picture as a data: address, so nothing touches the network.
const PICTURE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const withPicture = (person: SolePerson, url = PICTURE): SolePerson => ({ ...person, avatarUrl: url });

describe('Avatar', () => {
  it('shows initials in a colour hashed from the id', () => {
    renderUi(<Avatar person={ava} size={32} label />);
    const avatar = screen.getByRole('img', { name: 'Ava Thompson' });
    expect(avatar).toHaveTextContent('AT');
    expect(avatar.getAttribute('data-colour')).toBe(avatarColour('p-ava'));
    expect(AVATAR_COLOURS).toContain(avatarColour('p-ava'));
  });

  it('is hidden from screen readers unless it stands alone', () => {
    const { container } = renderUi(<Avatar person={ava} />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it.each<AvatarSize>([16, 20, 24, 32, 40, 48, 64])('draws size %s with a font of 36% and a bot icon of 60%', (size) => {
    const { container } = renderUi(
      <>
        <Avatar person={ava} size={size} />
        <Avatar person={taskmate} size={size} />
      </>,
    );
    const [person, bot] = [...container.children] as HTMLElement[];
    expect(person).toHaveStyle({ width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.36)}px` });
    expect(bot).toHaveStyle({ width: `${size}px`, height: `${size}px` });
    expect(bot?.querySelector('svg')).toHaveAttribute('width', String(Math.round(size * 0.6)));
  });

  it('draws the bot icon for a bot and a question mark for nobody', () => {
    const { container } = renderUi(
      <>
        <Avatar person={taskmate} label />
        <Avatar person={null} label />
      </>,
    );
    expect(container.querySelector('svg.lucide-bot')).not.toBeNull();
    expect(screen.getByRole('img', { name: 'Former member' })).toHaveTextContent('?');
  });

  it('shows the picture in the circle instead of the initials, and is still named for screen readers', () => {
    const { container } = renderUi(<Avatar person={withPicture(ava)} size={32} label />);
    const avatar = screen.getByRole('img', { name: 'Ava Thompson' });
    const picture = container.querySelector('img');
    expect(picture).toHaveAttribute('src', PICTURE);
    expect(picture).toHaveAttribute('alt', '');
    expect(avatar).not.toHaveTextContent('AT');
  });

  it('falls back to the initials when the picture will not load, and tries a new picture afresh', () => {
    const { container, rerender } = renderUi(<Avatar person={withPicture(ava)} size={32} label />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('img', { name: 'Ava Thompson' })).toHaveTextContent('AT');
    // A different picture is a different address, so the broken one does not count against it.
    const next = `${PICTURE}#next`;
    rerender(<Avatar person={withPicture(ava, next)} size={32} label />);
    expect(container.querySelector('img')).toHaveAttribute('src', next);
  });

  it('shows initials for anyone without a picture', () => {
    const { container } = renderUi(
      <>
        <Avatar person={{ ...noah, avatarUrl: null }} label />
        <Avatar person={mia} label />
      </>,
    );
    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(screen.getByRole('img', { name: 'Noah Patel' })).toHaveTextContent('NP');
    expect(screen.getByRole('img', { name: 'Mia Rossi' })).toHaveTextContent('MR');
  });

  it('never gives the bot a picture', () => {
    const { container } = renderUi(<Avatar person={withPicture(taskmate)} label />);
    expect(container.querySelector('img')).toBeNull();
  });
});

describe('AvatarStack', () => {
  it('shows up to max avatars then +n, and names everyone', () => {
    renderUi(<AvatarStack people={[ava, noah, mia]} />);
    const stack = screen.getByRole('img', { name: 'Ava Thompson, Noah Patel, Mia Rossi' });
    expect(stack).toHaveTextContent('AT');
    expect(stack).toHaveTextContent('NP');
    expect(stack).toHaveTextContent('+1');
    expect(stack).not.toHaveTextContent('MR');
  });

  it('shows pictures from avatarUrl, and keeps initials for those without', () => {
    const { container } = renderUi(<AvatarStack people={[withPicture(ava), withPicture(noah), mia]} max={3} />);
    expect(container.querySelectorAll('img')).toHaveLength(2);
    expect(screen.getByText('MR')).toBeInTheDocument();
  });

  it('draws nothing for nobody', () => {
    const { container } = renderUi(<AvatarStack people={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('PersonChip', () => {
  const personHref = (p: SolePerson) => `/people/${p.id}`;

  it('links a person when the provider has personHref', () => {
    renderUi(<PersonChip person={ava} />, { provider: { personHref } });
    expect(screen.getByRole('link', { name: /Ava Thompson/ })).toHaveAttribute('href', '/people/p-ava');
  });

  it('is plain text without personHref, and when link is false', () => {
    renderUi(
      <>
        <PersonChip person={ava} />
        <PersonChip person={noah} link={false} />
      </>,
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Ava Thompson')).toBeInTheDocument();
    renderUi(<PersonChip person={noah} link={false} />, { provider: { personHref } });
    expect(screen.getAllByText('Noah Patel').every((el) => el.closest('a') === null)).toBe(true);
  });

  it('names the bot and former members plainly, and links neither', () => {
    renderUi(
      <>
        <PersonChip person={taskmate} />
        <PersonChip person={null} />
      </>,
      { provider: { personHref } },
    );
    expect(screen.getByText('Taskmate').closest('a')).toBeNull();
    expect(screen.getByText('Former member')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('uses the picture and the link together', () => {
    const { container } = renderUi(<PersonChip person={withPicture(ava)} />, { provider: { personHref } });
    expect(screen.getByRole('link').querySelector('img')).toHaveAttribute('src', PICTURE);
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('forwards its ref to the link when it links', () => {
    const got: { el: HTMLElement | null } = { el: null };
    renderUi(<PersonChip person={ava} ref={(el) => void (got.el = el)} />, { provider: { personHref } });
    expect(got.el).toBe(screen.getByRole('link'));
  });
});

describe('PersonHeader and AvatarRow', () => {
  it('names the person, their admin pill and the meta line', () => {
    renderUi(<PersonHeader person={noah} admin meta={['Payroll lead', null, false, 'noah@example.com', 'Payroll lead']} />);
    expect(screen.getByRole('heading', { name: 'Noah Patel' })).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Payroll lead').parentElement).toHaveTextContent('Payroll lead·noah@example.com');
  });

  it('draws the actions and the title and body of an avatar row', () => {
    renderUi(
      <>
        <PersonHeader person={ava} actions={<button type="button">Message</button>} />
        <AvatarRow person={ava} title="Profile picture" body="A square picture works best." actions={<button type="button">Change</button>} />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Message' })).toBeInTheDocument();
    expect(screen.getByText('Profile picture')).toBeInTheDocument();
    expect(screen.getByText('A square picture works best.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument();
  });
});

describe('Kbd', () => {
  it('says Cmd on a Mac and Ctrl elsewhere', () => {
    const platform = vi.spyOn(navigator, 'platform', 'get');
    platform.mockReturnValue('MacIntel');
    const mac = renderUi(<Kbd keys={['mod', 'K']} />);
    expect(mac.container.textContent).toBe('Cmd K');
    mac.unmount();
    platform.mockReturnValue('Win32');
    const pc = renderUi(<Kbd keys={['mod', 'K']} />);
    expect(pc.container.textContent).toBe('Ctrl K');
  });

  it('keysText joins with + or a given separator', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32');
    expect(keysText(['mod', 'K'])).toBe('Ctrl+K');
    expect(keysText(['mod', 'K'], ' ')).toBe('Ctrl K');
  });
});

describe('CountBadge and Pill', () => {
  it('draws the tint and muted counts with their accessible label', () => {
    renderUi(
      <>
        <CountBadge label="2 unread mentions">2</CountBadge>
        <CountBadge variant="muted">9</CountBadge>
      </>,
    );
    expect(screen.getByLabelText('2 unread mentions')).toHaveClass('bg-accent');
    expect(screen.getByText('9')).toHaveClass('bg-muted');
  });

  it.each(['success', 'warning', 'neutral', 'info'] as const)('draws the %s pill', (tone) => {
    const { container } = renderUi(<Pill tone={tone}>Must change password</Pill>);
    expect(container.querySelector(`[data-pill="${tone}"]`)).toHaveTextContent('Must change password');
  });

  it('draws an icon before the text', () => {
    const { container } = renderUi(<Pill icon={<Bot />}>Bot</Pill>);
    expect(container.querySelector('[data-pill] > svg')).not.toBeNull();
  });
});

describe('Banner and inline messages', () => {
  it('announces danger as an alert and the rest as status, with their actions', () => {
    renderUi(
      <>
        <Banner tone="danger" actions={<button type="button">Try again</button>}>
          Could not save. The server did not answer. Your text is still here.
        </Banner>
        <Banner tone="success">A key is set. Added 12 Sep 2026 by Ava Thompson.</Banner>
      </>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save.');
    expect(screen.getByRole('alert')).toContainElement(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('status')).toHaveAttribute('data-banner', 'success');
  });

  it.each(['danger', 'warning', 'success', 'info'] as const)('draws the %s banner and lets role be set', (tone) => {
    const { container } = renderUi(
      <Banner tone={tone} role="status">
        Words
      </Banner>,
    );
    expect(container.querySelector(`[data-banner="${tone}"]`)).toHaveAttribute('role', 'status');
  });

  it('draws InlineError as an alert and InlineSuccess as status', () => {
    renderUi(
      <>
        <InlineError>Could not save that page</InlineError>
        <InlineSuccess>The key works.</InlineSuccess>
      </>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save that page');
    expect(screen.getByRole('status')).toHaveTextContent('The key works.');
  });
});

describe('Field and ReadOnlyField', () => {
  it('ties a field to its label and its error', () => {
    renderUi(
      <Field label="Work email" error="That email or password is not right.">
        <Input defaultValue="ava@example.com" />
      </Field>,
    );
    const input = screen.getByLabelText('Work email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('That email or password is not right.');
  });

  it('keeps what the control already points at, and adds its hint', () => {
    renderUi(
      <>
        <p id="rules">At least 12 characters.</p>
        <Field label="New password" hint="You will use it next time you sign in.">
          <Input type="password" aria-describedby="rules" />
        </Field>
      </>,
    );
    expect(screen.getByLabelText('New password')).toHaveAccessibleDescription('At least 12 characters. You will use it next time you sign in.');
  });

  it('uses the control own id, or the id it is given', () => {
    renderUi(
      <>
        <Field label="Own">
          <Input id="own-id" />
        </Field>
        <Field label="Given" id="given-id">
          <Input />
        </Field>
      </>,
    );
    expect(screen.getByLabelText('Own')).toHaveAttribute('id', 'own-id');
    expect(screen.getByLabelText('Given')).toHaveAttribute('id', 'given-id');
  });

  it('shows the value and why it cannot change', () => {
    renderUi(<ReadOnlyField label="Email" value="ava@example.com" note="Set by your account" />);
    expect(screen.getByText('ava@example.com').parentElement).toHaveTextContent('ava@example.com·Set by your account');
  });
});

describe('CopyField', () => {
  it('copies the value and says so for 2 seconds', async () => {
    const writeText = vi.fn<(t: string) => Promise<void>>().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderUi(<CopyField value="Harbour-violet-7-kettle" secret label="Temporary password" />);
    expect(screen.getByText('Harbour-violet-7-kettle')).toHaveClass('font-mono');
    await userEvent.click(screen.getByRole('button', { name: 'Copy temporary password' }));
    expect(writeText).toHaveBeenCalledWith('Harbour-violet-7-kettle');
    expect(screen.getByRole('button', { name: 'Copy temporary password' })).toHaveTextContent('Copied');
    // The button keeps its name, so the copy is announced separately.
    expect(screen.getAllByRole('status').some((el) => el.textContent === 'Temporary password copied')).toBe(true);
  });

  it('draws a plain value in the body face', () => {
    const { container } = renderUi(<CopyField value="https://example.com/join/abc" label="Sign-up link" />);
    expect(container.querySelector('[data-copy-field="plain"]')).not.toBeNull();
    expect(screen.getByText('https://example.com/join/abc')).not.toHaveClass('font-mono');
  });
});

describe('states', () => {
  it('ErrorState offers Try again; EmptyState states the fact and the next move', async () => {
    const retry = vi.fn<() => void>();
    renderUi(
      <>
        <ErrorState title="Could not load the wiki" onRetry={retry} />
        <EmptyState title="Nothing is assigned to you right now." action={<a href="/b/ENG">Open the boards</a>} />
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load the wiki');
    expect(screen.getByText('Open the boards')).toBeInTheDocument();
  });

  it('ErrorState has no button without onRetry; NoAccess says what and who to ask', () => {
    renderUi(
      <>
        <ErrorState title="Could not load the wiki" framed />
        <NoAccess what="the Payroll board" />
        <CenteredState>
          <span>Centred</span>
        </CenteredState>
      </>,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('You do not have access to the Payroll board.')).toBeInTheDocument();
    expect(screen.getByText('Ask an admin to add you.')).toBeInTheDocument();
    expect(screen.getByText('Centred')).toBeInTheDocument();
  });

  it('SkeletonRows shows nothing for the first 300ms', () => {
    vi.useFakeTimers();
    try {
      const { container } = renderUi(<SkeletonRows rows={3} />);
      expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(0);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('SkeletonRows draws the page variant, and useDelayed is ready at once for 0', () => {
    const { container } = renderUi(<SkeletonRows rows={2} variant="page" delay={0} label="Loading pages" />);
    expect(screen.getByLabelText('Loading pages')).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelectorAll('.h-\\[52px\\]')).toHaveLength(2);
    expect(renderHook(() => useDelayed(0)).result.current).toBe(true);
    expect(renderHook(() => useDelayed(300)).result.current).toBe(false);
  });
});

describe('LabelTag and logo', () => {
  it.each(HUES)('draws the %s hue', (hue) => {
    const { container } = renderUi(<LabelTag name="Payroll" hue={hue} />);
    expect(container.firstElementChild).toHaveClass(`hue-${hue}`);
    expect(container.firstElementChild).toHaveTextContent('Payroll');
  });

  it('shows up to max labels then +n with the rest named', () => {
    renderUi(
      <LabelTags
        labels={[
          { id: 'l1', name: 'Payroll', hue: 'blue' },
          { id: 'l2', name: 'Billing', hue: 'amber' },
          { id: 'l3', name: 'Onboarding', hue: 'teal' },
        ]}
      />,
    );
    expect(screen.getByText('+1')).toHaveAttribute('title', 'Onboarding');
    expect(screen.queryByText('Onboarding')).toBeNull();
  });

  it('draws the mark from the package, or from src', () => {
    const { container } = renderUi(
      <>
        <SoleMark size={24} />
        <SoleMark src="/mark.png" />
      </>,
    );
    const [own, custom] = [...container.querySelectorAll('img')];
    expect(own?.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
    expect(own).toHaveAttribute('width', '24');
    expect(custom).toHaveAttribute('src', '/mark.png');
  });

  it('draws the lockup with the product name', () => {
    renderUi(
      <>
        <SoleLockup />
        <SoleLockup name="Sole Dialer" size={24} />
      </>,
    );
    expect(screen.getByText('Sole HQ')).toBeInTheDocument();
    expect(screen.getByText('Sole Dialer')).toHaveClass('text-title');
  });
});
