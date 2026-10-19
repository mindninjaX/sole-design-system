import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileText, Sparkles } from 'lucide-react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderUi } from '../../test/render.tsx';
import { SoleLink } from '../lib/sole-provider.tsx';
import type { SoleLinkProps } from '../lib/sole-provider.tsx';
import type { SolePerson } from '../lib/person.ts';
import { ActivityLine } from './activity-line.tsx';
import type { ActivityKind } from './activity-line.tsx';
import { ChecklistItem } from './checklist-item.tsx';
import { Comment } from './comment.tsx';
import { InboxRow } from './inbox-row.tsx';
import { LinkRow } from './link-row.tsx';
import { CitationChip, MentionChip } from './mention-chip.tsx';
import { RecentItem } from './recent-item.tsx';
import { Sticky } from './sticky.tsx';
import type { StickyColour } from './types.ts';
import { TemplateCard } from './template-card.tsx';

// The fixed "today" is Tuesday 29 Sep 2026, 3:00 PM in Sydney (2026-09-29T05:00:00Z, UTC+10).
const ava: SolePerson = { id: 'p-ava', name: 'Ava Thompson' };
const noah: SolePerson = { id: 'p-noah', name: 'Noah Patel' };
const taskmate: SolePerson = { id: 'p-taskmate', name: 'Taskmate', isBot: true };

/** 1:00 PM today in Sydney: two hours before the fixed now. */
const TWO_HOURS_AGO = '2026-09-29T03:00:00Z';
/** 1:00 PM yesterday. */
const YESTERDAY = '2026-09-28T03:00:00Z';
/** 1:00 PM on 10 Sep, more than a week back. */
const LAST_MONTH = '2026-09-10T03:00:00Z';

/** A router's link: the provider hands it every in-app address, never an `http` one. */
const RouterLink = React.forwardRef<HTMLAnchorElement, SoleLinkProps>(function RouterLink(props, ref) {
  return <a ref={ref} data-router-link="" {...props} />;
});

const stopNavigation = (event: React.MouseEvent) => event.preventDefault();

describe('InboxRow', () => {
  it('is one link with the actor, the sentence, the item and the time', () => {
    const { container } = renderUi(
      <InboxRow href="/inbox/n1" notificationId="n1" actor={ava} summary="Ava Thompson assigned this to you" detail="ENG-14 Fix the pricing copy" at={TWO_HOURS_AGO} unread />,
    );
    const row = screen.getByRole('link');
    expect(row).toHaveAttribute('href', '/inbox/n1');
    expect(row).toHaveAttribute('data-inbox-row', 'n1');
    expect(row).toHaveTextContent('Ava Thompson assigned this to you');
    expect(row).toHaveTextContent('ENG-14 Fix the pricing copy');
    expect(within(row).getByText('AT')).toBeInTheDocument();
    const time = container.querySelector('time')!;
    expect(time).toHaveTextContent('2 h ago');
    expect(time).toHaveAttribute('datetime', TWO_HOURS_AGO);
    expect(time).toHaveAttribute('title', 'Tuesday, 29 September 2026, 1:00 PM');
  });

  it('marks an unread row with the blue dot and tells screen readers', () => {
    const { container } = renderUi(<InboxRow href="/inbox/n1" actor={ava} summary="Sentence" detail="Item" at={TWO_HOURS_AGO} unread />);
    const row = screen.getByRole('link');
    expect(row).toHaveAttribute('data-unread');
    expect(row).toHaveAccessibleName(/^Unread\./);
    expect(container.querySelector('span[aria-hidden="true"].bg-brand')).not.toBeNull();
  });

  it('draws a read row with no dot and no unread text', () => {
    const { container } = renderUi(<InboxRow href="/inbox/n1" actor={ava} summary="Sentence" detail="Item" at={TWO_HOURS_AGO} />);
    const row = screen.getByRole('link');
    expect(row).not.toHaveAttribute('data-unread');
    expect(row).not.toHaveAccessibleName(/Unread/);
    expect(container.querySelector('.bg-brand')).toBeNull();
    // The dot still takes its room, so read and unread rows line up.
    expect(container.querySelector('span[aria-hidden="true"].bg-transparent')).not.toBeNull();
  });

  it('draws a "?" for an actor who has gone, and still draws the row', () => {
    renderUi(<InboxRow href="/inbox/n2" actor={null} summary="A page you own is due for review" detail="Refund policy" at={TWO_HOURS_AGO} />);
    expect(screen.getByRole('link')).toHaveTextContent('?');
    expect(screen.getByRole('link')).toHaveTextContent('Refund policy');
  });

  it('marks the selected row', () => {
    renderUi(<InboxRow href="/inbox/n1" actor={ava} summary="Sentence" detail="Item" at={TWO_HOURS_AGO} selected />);
    expect(screen.getByRole('link')).toHaveClass('bg-accent');
  });

  it('lets the app mark it read from onClick', async () => {
    const onClick = vi.fn<(event: React.MouseEvent) => void>(stopNavigation);
    renderUi(<InboxRow href="/inbox/n1" actor={noah} summary="Sentence" detail="Item" at={TWO_HOURS_AGO} unread onClick={onClick} />);
    await userEvent.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('goes through the provider link, so a router can handle it', () => {
    renderUi(<InboxRow href="/inbox/n1" actor={ava} summary="Sentence" detail="Item" at={TWO_HOURS_AGO} />, { provider: { linkComponent: RouterLink } });
    expect(screen.getByRole('link')).toHaveAttribute('data-router-link');
  });

  it('words the time against the provider clock: yesterday, then the date', () => {
    const { container } = renderUi(
      <>
        <InboxRow href="/a" actor={ava} summary="One" detail="A" at={YESTERDAY} />
        <InboxRow href="/b" actor={ava} summary="Two" detail="B" at={LAST_MONTH} />
      </>,
    );
    expect([...container.querySelectorAll('time')].map((t) => t.textContent)).toEqual(['Yesterday', '10 Sep']);
  });

  it('takes its clock from the `now` prop when given one', () => {
    const { container } = renderUi(<InboxRow href="/a" actor={ava} summary="One" detail="A" at={TWO_HOURS_AGO} now={new Date('2026-09-29T03:05:00Z')} />);
    expect(container.querySelector('time')).toHaveTextContent('5 min ago');
  });
});

describe('ActivityLine', () => {
  it('shows the sentence the app built, and when', () => {
    const { container } = renderUi(
      <ActivityLine actor={ava} kind="state" at={TWO_HOURS_AGO}>
        Ava moved this from Todo to Done
      </ActivityLine>,
    );
    expect(screen.getByText('Ava moved this from Todo to Done')).toBeInTheDocument();
    const time = container.querySelector('time')!;
    expect(time).toHaveTextContent('2 h ago');
    expect(time).toHaveAttribute('title', 'Tuesday, 29 September 2026, 1:00 PM');
    expect(time).toHaveAttribute('datetime', TWO_HOURS_AGO);
  });

  it('keeps the sentence for a bot, or for someone who has gone, as the app wrote it', () => {
    renderUi(
      <>
        <ActivityLine actor={taskmate} kind="created" at={YESTERDAY}>
          Taskmate created this from Slack
        </ActivityLine>
        <ActivityLine actor={null} kind="comment" at={LAST_MONTH}>
          Former member commented
        </ActivityLine>
      </>,
    );
    expect(screen.getByText('Taskmate created this from Slack')).toBeInTheDocument();
    expect(screen.getByText('Former member commented')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByText('10 Sep')).toBeInTheDocument();
  });

  it('records who did it as data-actor, and nothing for a former member', () => {
    const { container } = renderUi(
      <>
        <ActivityLine actor={noah} at={TWO_HOURS_AGO}>
          Noah edited this
        </ActivityLine>
        <ActivityLine actor={null} at={TWO_HOURS_AGO}>
          Someone edited this
        </ActivityLine>
      </>,
    );
    const [first, second] = [...container.querySelectorAll('div')];
    expect(first).toHaveAttribute('data-actor', 'p-noah');
    expect(second).not.toHaveAttribute('data-actor');
  });

  it.each<[ActivityKind, string]>([
    ['created', 'circle-plus'],
    ['state', 'arrow-left-right'],
    ['assignee', 'user-plus'],
    ['label', 'tag'],
    ['due', 'calendar-clock'],
    ['comment', 'message-square'],
    ['link', 'link-2'],
    ['delete', 'trash-2'],
    ['edit', 'pencil'],
    ['property', 'sliders-horizontal'],
  ])('draws the %s icon, hidden from screen readers', (kind, icon) => {
    const { container } = renderUi(
      <ActivityLine kind={kind} at={TWO_HOURS_AGO}>
        Something changed
      </ActivityLine>,
    );
    const svg = container.querySelector(`svg.lucide-${icon}`);
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('falls back to the edit icon when it is not told the kind', () => {
    const { container } = renderUi(<ActivityLine at={TWO_HOURS_AGO}>Something changed</ActivityLine>);
    expect(container.querySelector('svg.lucide-pencil')).not.toBeNull();
  });

  it('stamps the time in the provider time zone', () => {
    const { container } = renderUi(<ActivityLine at={TWO_HOURS_AGO}>Something changed</ActivityLine>, { provider: { timeZone: 'Australia/Perth' } });
    // Perth is two hours behind Sydney.
    expect(container.querySelector('time')).toHaveAttribute('title', 'Tuesday, 29 September 2026, 11:00 AM');
  });
});

describe('Comment', () => {
  it('shows the author, when, and the body', () => {
    const { container } = renderUi(
      <Comment author={ava} createdAt={TWO_HOURS_AGO}>
        Can we confirm the plan names before this goes out?
      </Comment>,
    );
    expect(screen.getByText('Ava Thompson')).toBeInTheDocument();
    expect(screen.getByText('Can we confirm the plan names before this goes out?')).toBeInTheDocument();
    expect(screen.getByText('AT')).toBeInTheDocument();
    const time = container.querySelector('time')!;
    expect(time).toHaveTextContent('Today 1:00 PM');
    expect(time).toHaveAttribute('title', 'Tuesday, 29 September 2026, 1:00 PM');
  });

  it('words the time as yesterday, a weekday, or the date', () => {
    const { container } = renderUi(
      <>
        <Comment author={ava} createdAt={YESTERDAY}>
          One
        </Comment>
        <Comment author={ava} createdAt="2026-09-25T03:00:00Z">
          Two
        </Comment>
        <Comment author={ava} createdAt={LAST_MONTH}>
          Three
        </Comment>
      </>,
    );
    expect([...container.querySelectorAll('time')].map((t) => t.textContent)).toEqual(['Yesterday 1:00 PM', 'Fri 1:00 PM', '10 Sep, 1:00 PM']);
  });

  it('reads the label in place of the author\'s name, and keeps the bot as the avatar', () => {
    const { container } = renderUi(
      <Comment author={taskmate} label="Noah (from the Dialer)" createdAt={TWO_HOURS_AGO}>
        Called back
      </Comment>,
    );
    expect(screen.getByText('Noah (from the Dialer)')).toBeInTheDocument();
    expect(screen.queryByText('Taskmate')).not.toBeInTheDocument();
    expect(container.querySelector('svg.lucide-bot')).not.toBeNull();
  });

  it('ignores a blank label', () => {
    renderUi(
      <Comment author={noah} label="   " createdAt={TWO_HOURS_AGO}>
        Body
      </Comment>,
    );
    expect(screen.getByText('Noah Patel')).toBeInTheDocument();
  });

  it('names a bot by its own name and draws the bot avatar', () => {
    const { container } = renderUi(
      <Comment author={taskmate} createdAt={TWO_HOURS_AGO}>
        Filed from Slack
      </Comment>,
    );
    expect(screen.getByText('Taskmate')).not.toHaveClass('text-subtle-foreground');
    expect(container.querySelector('svg.lucide-bot')).not.toBeNull();
  });

  it('names a former member plainly, in the quiet colour, with a "?" avatar', () => {
    renderUi(
      <Comment author={null} createdAt={TWO_HOURS_AGO}>
        Thanks, done
      </Comment>,
    );
    expect(screen.getByText('Former member')).toHaveClass('text-subtle-foreground');
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('says when it was edited and when it is resolved, and fades a resolved comment', () => {
    renderUi(
      <Comment author={ava} createdAt={TWO_HOURS_AGO} edited resolved>
        Body
      </Comment>,
    );
    expect(screen.getByText('edited')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveClass('opacity-60');
  });

  it('says neither of those when it is neither', () => {
    renderUi(
      <Comment author={ava} createdAt={TWO_HOURS_AGO}>
        Body
      </Comment>,
    );
    expect(screen.queryByText('edited')).not.toBeInTheDocument();
    expect(screen.queryByText('Resolved')).not.toBeInTheDocument();
    expect(screen.getByRole('article')).not.toHaveClass('opacity-60');
  });

  it('sets a page comment at the reading size and a work item comment at the body size', () => {
    renderUi(
      <>
        <Comment author={ava} createdAt={TWO_HOURS_AGO} reading>
          Page comment
        </Comment>
        <Comment author={ava} createdAt={TWO_HOURS_AGO}>
          Work item comment
        </Comment>
      </>,
    );
    expect(screen.getByText('Page comment')).toHaveClass('text-[14px]');
    expect(screen.getByText('Work item comment')).toHaveClass('text-body');
  });

  it('shows the actions at the end of the header', () => {
    renderUi(
      <Comment author={ava} createdAt={TWO_HOURS_AGO} actions={<button type="button">Edit</button>}>
        Body
      </Comment>,
    );
    expect(within(screen.getByRole('article').querySelector('header')!).getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('stamps the time in the viewer\'s time zone, not only the provider\'s', () => {
    const { container } = renderUi(
      <Comment author={ava} createdAt={TWO_HOURS_AGO} tz="Australia/Perth">
        Body
      </Comment>,
    );
    expect(container.querySelector('time')).toHaveTextContent('Today 11:00 AM');
  });

  it('keeps the body as given, rich or plain', () => {
    renderUi(
      <Comment author={ava} createdAt={TWO_HOURS_AGO}>
        <p>
          First <strong>line</strong>
        </p>
      </Comment>,
    );
    expect(screen.getByText('line').tagName).toBe('STRONG');
  });
});

describe('Sticky', () => {
  const colours: StickyColour[] = ['gray', 'peach', 'pink', 'orange', 'green', 'light-blue', 'dark-blue', 'purple'];

  it.each(colours)('draws the %s note on its own fill', (colour) => {
    const { container } = renderUi(
      <Sticky colour={colour} title="Ideas">
        Ask Sole should read the refund policy page first
      </Sticky>,
    );
    const note = container.querySelector(`[data-sticky="${colour}"]`)!;
    expect(note).toHaveClass(`bg-[var(--sticky-${colour})]`);
    expect(note).toHaveTextContent('Ideas');
  });

  it('is gray unless told otherwise', () => {
    const { container } = renderUi(<Sticky>Plain note</Sticky>);
    expect(container.querySelector('[data-sticky="gray"]')).toHaveTextContent('Plain note');
  });

  it('keeps the line breaks of the note, and truncates the title', () => {
    renderUi(
      <Sticky title="A very long title">
        {'One\nTwo'}
      </Sticky>,
    );
    expect(screen.getByText('A very long title')).toHaveClass('truncate');
    expect(screen.getByText(/One/)).toHaveClass('whitespace-pre-line');
  });

  it('draws a title alone, or a note alone, without the gap between them', () => {
    renderUi(
      <>
        <Sticky title="Only a title" />
        <Sticky>Only a note</Sticky>
      </>,
    );
    expect(screen.getByText('Only a title')).toBeInTheDocument();
    expect(screen.getByText('Only a note')).not.toHaveClass('mt-[5px]');
  });

  it('passes clicks and other attributes through, for editing', async () => {
    const onClick = vi.fn<() => void>();
    renderUi(
      <Sticky title="Edit me" onClick={onClick} role="button" aria-label="Edit the sticky">
        Body
      </Sticky>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit the sticky' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('TemplateCard', () => {
  it('is a radio that says whether it is the chosen template', () => {
    renderUi(
      <>
        <TemplateCard icon={FileText} title="Blank" description="An empty page." selected />
        <TemplateCard icon={Sparkles} title="Meeting notes" description="Agenda, notes and actions." />
      </>,
    );
    expect(screen.getByRole('radio', { name: /Blank/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /Meeting notes/ })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: /Blank/ })).toHaveClass('border-brand');
    expect(screen.getByRole('radio', { name: /Meeting notes/ })).toHaveClass('border-border');
  });

  it('shows the name and the hint, and hides the icon from screen readers', () => {
    const { container } = renderUi(<TemplateCard icon={FileText} title="Blank" description="An empty page." />);
    expect(screen.getByText('Blank')).toBeInTheDocument();
    expect(screen.getByText('An empty page.')).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('picks the template when clicked', async () => {
    const pick = vi.fn<() => void>();
    renderUi(<TemplateCard icon={FileText} title="Blank" description="An empty page." onClick={pick} />);
    await userEvent.click(screen.getByRole('radio', { name: /Blank/ }));
    expect(pick).toHaveBeenCalledOnce();
  });

  it('does not submit a form it sits in', async () => {
    const submit = vi.fn<(event: React.FormEvent) => void>((event) => event.preventDefault());
    renderUi(
      <form onSubmit={submit}>
        <TemplateCard icon={FileText} title="Blank" description="An empty page." />
      </form>,
    );
    await userEvent.click(screen.getByRole('radio', { name: /Blank/ }));
    expect(submit).not.toHaveBeenCalled();
  });

  it('can be disabled', async () => {
    const pick = vi.fn<() => void>();
    renderUi(<TemplateCard icon={FileText} title="Blank" description="An empty page." disabled onClick={pick} />);
    expect(screen.getByRole('radio', { name: /Blank/ })).toBeDisabled();
    await userEvent.click(screen.getByRole('radio', { name: /Blank/ }));
    expect(pick).not.toHaveBeenCalled();
  });
});

describe('MentionChip', () => {
  it('shows the person\'s current name with their avatar', () => {
    const { container } = renderUi(<MentionChip person={ava} label="Old name" />);
    const chip = container.querySelector('[data-mention]')!;
    expect(chip).toHaveAttribute('data-mention', 'p-ava');
    expect(chip).toHaveTextContent('Ava Thompson');
    expect(chip).not.toHaveTextContent('Old name');
    expect(within(chip as HTMLElement).getByText('AT')).toBeInTheDocument();
  });

  it('falls back to the stored name, with an @, when the person is not loaded', () => {
    const { container } = renderUi(<MentionChip person={null} label="Mia Rossi" />);
    const chip = container.querySelector('[data-mention]')!;
    expect(chip).toHaveAttribute('data-mention', '');
    expect(chip).toHaveTextContent('@Mia Rossi');
  });

  it('says Former member when it has neither a person nor a name', () => {
    renderUi(<MentionChip />);
    expect(screen.getByText('Former member')).toBeInTheDocument();
  });

  it('draws a bot as the bot', () => {
    const { container } = renderUi(<MentionChip person={taskmate} />);
    expect(container).toHaveTextContent('Taskmate');
    expect(container.querySelector('svg.lucide-bot')).not.toBeNull();
  });

  it('sits in a line of text', () => {
    renderUi(
      <p>
        Thanks <MentionChip person={noah} />, that fixes it.
      </p>,
    );
    // The avatar's initials are part of the chip's text, so the line reads "Thanks NPNoah Patel, ..." to a text query.
    expect(screen.getByText(/that fixes it/)).toHaveTextContent('Noah Patel, that fixes it.');
  });
});

describe('CitationChip', () => {
  it('is a plain marker named for its source when it goes nowhere', () => {
    renderUi(<CitationChip n={2} />);
    const chip = screen.getByLabelText('Source 2');
    expect(chip).toHaveTextContent('2');
    expect(chip.tagName).toBe('SPAN');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('is a link when it has an address', () => {
    renderUi(<CitationChip n={1} href="/wiki/refunds" />);
    expect(screen.getByRole('link', { name: 'Source 1' })).toHaveAttribute('href', '/wiki/refunds');
  });

  it('is a button when it has only a click, such as jumping to the source below', async () => {
    const jump = vi.fn<() => void>();
    renderUi(<CitationChip n={3} onClick={jump} />);
    await userEvent.click(screen.getByRole('button', { name: 'Source 3' }));
    expect(jump).toHaveBeenCalledOnce();
  });

  it('runs onClick beside the link when it has both', async () => {
    const seen = vi.fn<() => void>();
    renderUi(<CitationChip n={4} href="#source-4" onClick={seen} />);
    await userEvent.click(screen.getByRole('link', { name: 'Source 4' }));
    expect(seen).toHaveBeenCalledOnce();
  });
});

describe('ChecklistItem', () => {
  it('ticks and unticks, saying which way', async () => {
    const onChange = vi.fn<(v: boolean) => void>();
    const { rerender } = renderUi(
      <ChecklistItem checked={false} onCheckedChange={onChange}>
        Update the comparison table
      </ChecklistItem>,
    );
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenLastCalledWith(true);
    rerender(
      <ChecklistItem checked onCheckedChange={onChange}>
        Update the comparison table
      </ChecklistItem>,
    );
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('toggles from a click on the words, because the line is a label', async () => {
    const onChange = vi.fn<(v: boolean) => void>();
    renderUi(
      <ChecklistItem checked={false} onCheckedChange={onChange}>
        Send the draft to Noah
      </ChecklistItem>,
    );
    await userEvent.click(screen.getByText('Send the draft to Noah'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('names the checkbox by its line, and turns a done line the subtle grey', () => {
    renderUi(
      <>
        <ChecklistItem checked>Done line</ChecklistItem>
        <ChecklistItem checked={false}>Open line</ChecklistItem>
      </>,
    );
    expect(screen.getByRole('checkbox', { name: 'Done line' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Open line' })).not.toBeChecked();
    expect(screen.getByText('Done line')).toHaveClass('text-subtle-foreground');
    expect(screen.getByText('Open line')).toHaveClass('text-foreground');
  });

  it('does nothing when disabled', async () => {
    const onChange = vi.fn<(v: boolean) => void>();
    renderUi(
      <ChecklistItem checked={false} disabled onCheckedChange={onChange}>
        Locked line
      </ChecklistItem>,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
    await userEvent.click(screen.getByText('Locked line'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('works read-only, with no handler', async () => {
    renderUi(<ChecklistItem checked={false}>Read-only line</ChecklistItem>);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('sets the line at the reading size, or the body size for denser lists', () => {
    const { container } = renderUi(
      <>
        <ChecklistItem checked={false}>Reading</ChecklistItem>
        <ChecklistItem checked={false} size="body">
          Dense
        </ChecklistItem>
      </>,
    );
    const [reading, dense] = [...container.querySelectorAll('label')];
    expect(reading).toHaveClass('text-read');
    expect(dense).toHaveClass('text-body');
  });
});

describe('LinkRow', () => {
  it('opens an outside link in a new tab, safely, and does not hand it to the router', () => {
    renderUi(<LinkRow href="https://example.com/archives/p1" title="The original message in Slack" meta="#pricing · Noah Patel · 24 Sep" />, {
      provider: { linkComponent: RouterLink },
    });
    const link = screen.getByRole('link', { name: 'The original message in Slack' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    expect(link).not.toHaveAttribute('data-router-link');
    expect(screen.getByText('#pricing · Noah Patel · 24 Sep')).toBeInTheDocument();
  });

  it('opens an inside link in the app, through the provider link', () => {
    renderUi(<LinkRow href="/b/ENG/14" title="ENG-14 Fix the pricing copy" />, { provider: { linkComponent: RouterLink } });
    const link = screen.getByRole('link', { name: 'ENG-14 Fix the pricing copy' });
    expect(link).toHaveAttribute('href', '/b/ENG/14');
    expect(link).toHaveAttribute('data-router-link');
    expect(link).not.toHaveAttribute('target');
  });

  it('draws the link glyph, or the icon it is given in its place', () => {
    const { container } = renderUi(
      <>
        <LinkRow href="/a" title="Default" />
        <LinkRow href="/b" title="Custom" icon={<span data-testid="custom-icon" />} />
      </>,
    );
    expect(container.querySelectorAll('svg.lucide-link-2')).toHaveLength(1);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('shows the actions at the end, hidden until hover or focus', () => {
    renderUi(<LinkRow href="/a" title="With actions" actions={<button type="button">Remove</button>} />);
    const actions = screen.getByRole('button', { name: 'Remove' }).parentElement!;
    expect(actions).toHaveClass('opacity-0');
    expect(actions).toHaveClass('group-hover/link:opacity-100');
  });

  it('draws no meta or actions when it has none', () => {
    const { container } = renderUi(<LinkRow href="/a" title="Bare" />);
    expect(container.querySelectorAll('span')).toHaveLength(0);
  });
});

describe('RecentItem', () => {
  it('draws a page with the page icon, its title and where it lives', () => {
    const { container } = renderUi(<RecentItem kind="page" href="/wiki/p1" title="How we run payroll month end" where="Knowledge" />);
    expect(screen.getByRole('link', { name: /How we run payroll month end/ })).toHaveAttribute('href', '/wiki/p1');
    expect(screen.getByText('Knowledge')).toBeInTheDocument();
    expect(container.querySelector('svg.lucide-file-text')).not.toBeNull();
  });

  it('draws a work item with the work item icon', () => {
    const { container } = renderUi(<RecentItem kind="work_item" href="/b/ENG/14" title="ENG-14 Fix the pricing copy on the plans page" where="Engineering" />);
    expect(screen.getByRole('link', { name: /ENG-14/ })).toHaveAttribute('href', '/b/ENG/14');
    expect(container.querySelector('svg.lucide-square-check')).not.toBeNull();
  });

  it('draws no second line when it does not know where', () => {
    const { container } = renderUi(<RecentItem kind="page" href="/wiki/p1" title="Untitled" />);
    expect(container.querySelectorAll('a > span > span')).toHaveLength(1);
  });

  it('goes through the provider link', () => {
    renderUi(<RecentItem kind="page" href="/wiki/p1" title="A page" />, { provider: { linkComponent: RouterLink } });
    expect(screen.getByRole('link')).toHaveAttribute('data-router-link');
  });
});

describe('SoleLink in these parts', () => {
  it('is what they use, so a plain anchor is the default without a provider link', () => {
    renderUi(<SoleLink href="/inbox">Inbox</SoleLink>);
    expect(screen.getByRole('link', { name: 'Inbox' })).not.toHaveAttribute('data-router-link');
  });
});

describe('refs', () => {
  let got: HTMLElement | null = null;
  const ref = (element: HTMLElement | null) => {
    got = element;
  };

  const cases: Array<[string, () => React.ReactElement]> = [
    ['InboxRow', () => <InboxRow ref={ref} href="/inbox/n1" actor={ava} summary="Sentence" detail="Item" at={TWO_HOURS_AGO} />],
    [
      'ActivityLine',
      () => (
        <ActivityLine ref={ref} at={TWO_HOURS_AGO}>
          Something changed
        </ActivityLine>
      ),
    ],
    [
      'Comment',
      () => (
        <Comment ref={ref} author={ava} createdAt={TWO_HOURS_AGO}>
          Body
        </Comment>
      ),
    ],
    ['Sticky', () => <Sticky ref={ref} title="Note" />],
    ['TemplateCard', () => <TemplateCard ref={ref} icon={FileText} title="Blank" description="An empty page." />],
    ['MentionChip', () => <MentionChip ref={ref} person={ava} />],
    ['CitationChip (plain)', () => <CitationChip ref={ref} n={1} />],
    ['CitationChip (link)', () => <CitationChip ref={ref} n={1} href="/source" />],
    ['CitationChip (button)', () => <CitationChip ref={ref} n={1} onClick={() => {}} />],
    ['ChecklistItem', () => <ChecklistItem ref={ref} checked={false}>Line</ChecklistItem>],
    ['LinkRow', () => <LinkRow ref={ref} href="/a" title="A link" />],
    ['RecentItem', () => <RecentItem ref={ref} kind="page" href="/wiki/p1" title="A page" />],
  ];

  it.each(cases)('%s forwards its ref', (_name, build) => {
    got = null;
    const view = renderUi(build());
    expect(got).toBeInstanceOf(HTMLElement);
    expect(view.container).toContainElement(got);
  });
});
