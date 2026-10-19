import { screen } from '@testing-library/react';
import { cloneElement, createRef } from 'react';
import type { ReactElement, Ref } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { SolePerson } from '../lib/person.ts';
import { renderUi } from '../../test/render.tsx';
import { BoardCard } from './board-card.tsx';
import { BoardChip, BoardEmoji } from './board-chip.tsx';
import { DueChip } from './due-chip.tsx';
import { GroupHeader, GroupLabel } from './group-header.tsx';
import { PageRow } from './page-row.tsx';
import { PriorityIcon } from './priority-icon.tsx';
import { PropertyTypeIcon } from './property-type-icon.tsx';
import { REVIEW_SOON_DAYS, ReviewBadge, ReviewStateBadge, reviewBadge, reviewState } from './review-badge.tsx';
import { StateIcon, STATE_GROUP_LABELS } from './state-icon.tsx';
import { StatePill } from './state-pill.tsx';
import { PRIORITY_LABELS } from './types.ts';
import type { BoardSummary, PropertyType, WorkItemSummary } from './types.ts';
import { WorkItemRow } from './work-item-row.tsx';

const TODAY = '2026-09-29';

const ava: SolePerson = { id: 'p-ava', name: 'Ava Thompson' };
const noah: SolePerson = { id: 'p-noah', name: 'Noah Patel' };
const mia: SolePerson = { id: 'p-mia', name: 'Mia Rossi' };

const ledger: WorkItemSummary = {
  key: 'ENG-14',
  href: '/b/ENG/14',
  title: 'Reconcile the September ledger',
  priority: 'high',
  state: { name: 'In review', group: 'started' },
  labels: [{ id: 'l-finance', name: 'Finance', hue: 'teal' }],
  dueDate: TODAY,
  assignees: [ava, noah],
  isDone: false,
};

const eng: BoardSummary = { id: 'b-eng', name: 'Engineering', emoji: '💻', key: 'ENG' };

describe('StateIcon and PriorityIcon', () => {
  it('name themselves for screen readers', () => {
    renderUi(
      <>
        <StateIcon group="started" name="In review" />
        <StateIcon group="backlog" />
        <PriorityIcon priority="urgent" />
        <PriorityIcon priority="none" />
      </>,
    );
    expect(screen.getByRole('img', { name: 'In review' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Backlog' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Urgent priority' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'No priority' })).toBeInTheDocument();
  });

  it('hide from screen readers when the name is written next to them', () => {
    const { container } = renderUi(
      <>
        <StateIcon group="completed" decorative />
        <PriorityIcon priority="low" decorative />
      </>,
    );
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(2);
  });

  it('say the words HQ uses for each group and priority', () => {
    expect(STATE_GROUP_LABELS.unstarted).toBe('Todo');
    expect(STATE_GROUP_LABELS.completed).toBe('Done');
    expect(PRIORITY_LABELS.none).toBe('No priority');
  });

  it('fill 3, 2, 1 and 0 bars for high, medium, low and none', () => {
    const filled = (priority: 'high' | 'medium' | 'low' | 'none') => {
      const { container, unmount } = renderUi(<PriorityIcon priority={priority} />);
      const count = container.querySelectorAll('rect.fill-muted-foreground').length;
      unmount();
      return count;
    };
    expect([filled('high'), filled('medium'), filled('low'), filled('none')]).toEqual([3, 2, 1, 0]);
  });
});

describe('StatePill and PropertyTypeIcon', () => {
  it('writes the state name beside a decorative icon', () => {
    renderUi(<StatePill state={{ name: 'In review', group: 'started' }} />);
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('marks each icon with its property type', () => {
    const types: PropertyType[] = ['text', 'number', 'date', 'select', 'multi_select', 'person', 'checkbox', 'url'];
    const { container } = renderUi(
      <>
        {types.map((type) => (
          <PropertyTypeIcon key={type} type={type} />
        ))}
      </>,
    );
    expect([...container.querySelectorAll('[data-type-icon]')].map((el) => el.getAttribute('data-type-icon'))).toEqual(types);
  });
});

describe('DueChip', () => {
  it('shows each tone, and nothing without a date', () => {
    const { container } = renderUi(
      <>
        <DueChip due="2026-09-26" today={TODAY} />
        <DueChip due={TODAY} today={TODAY} />
        <DueChip due="2026-09-30" today={TODAY} />
        <DueChip due="2026-10-02" today={TODAY} />
        <DueChip due="2026-10-09" today={TODAY} />
        <DueChip due="2026-09-26" today={TODAY} done />
        <DueChip due={null} today={TODAY} />
      </>,
    );
    const tones = [...container.querySelectorAll('[data-due]')].map((el) => `${el.getAttribute('data-due')}:${el.textContent}`);
    expect(tones).toEqual(['overdue:26 Sep', 'today:Today', 'soon:Tomorrow', 'soon:Fri', 'plain:9 Oct', 'done:26 Sep']);
    expect(screen.getByLabelText('Overdue, due 26 Sep')).toBeInTheDocument();
  });

  it('reads today from the provider when none is given', () => {
    const { container } = renderUi(<DueChip due={TODAY} />);
    expect(container.querySelector('[data-due="today"]')).toHaveTextContent('Today');
  });
});

describe('review state and badge', () => {
  it('is unknown when a page was never reviewed', () => {
    expect(reviewState(null, TODAY)).toBe('unknown');
  });

  it('is overdue once the review date has passed', () => {
    expect(reviewState('2026-09-28', TODAY)).toBe('overdue');
    expect(reviewState('2025-03-01', TODAY)).toBe('overdue');
  });

  it('is due soon from today up to 14 days away', () => {
    expect(REVIEW_SOON_DAYS).toBe(14);
    expect(reviewState(TODAY, TODAY)).toBe('due');
    expect(reviewState('2026-10-08', TODAY)).toBe('due');
    expect(reviewState('2026-10-13', TODAY)).toBe('due');
  });

  it('is current beyond 14 days, and moves with the day', () => {
    expect(reviewState('2026-10-14', TODAY)).toBe('current');
    expect(reviewState('2026-11-14', TODAY)).toBe('current');
    expect(reviewState('2026-10-14', '2026-09-30')).toBe('due');
    expect(reviewState('2026-10-14', '2026-10-15')).toBe('overdue');
  });

  it('gives no badge model for a current page', () => {
    expect(reviewBadge('2026-11-14', TODAY)).toBeNull();
  });

  it('says Review by with the date when due soon', () => {
    expect(reviewBadge('2026-10-08', TODAY)).toEqual({ tone: 'warning', label: 'Review by 8 Oct', title: 'Review by 8 October 2026' });
  });

  it('says Review due when overdue, with the full date in the tooltip', () => {
    expect(reviewBadge('2026-09-26', TODAY)).toEqual({ tone: 'danger', label: 'Review due', title: 'Review was due 26 September 2026' });
  });

  it('says Never reviewed when there is no date', () => {
    expect(reviewBadge(null, TODAY)).toMatchObject({ tone: 'neutral', label: 'Never reviewed' });
  });

  it('adds the year to a due date next year', () => {
    expect(reviewBadge('2027-01-05', '2026-12-28')?.label).toBe('Review by 5 Jan 2027');
  });

  it('draws nothing for a current page', () => {
    const { container } = renderUi(
      <>
        <ReviewBadge reviewDue="2026-12-01" today={TODAY} />
        <ReviewBadge reviewDue="2026-09-01" today={TODAY} />
      </>,
    );
    expect(container.querySelectorAll('[data-review]')).toHaveLength(1);
    expect(screen.getByText('Review due')).toHaveAttribute('title', 'Review was due 1 September 2026');
  });

  it('draws the pill from a review state alone, and nothing for current', () => {
    renderUi(
      <>
        <ReviewStateBadge state="overdue" />
        <ReviewStateBadge state="current" />
        <ReviewStateBadge state={null} />
      </>,
    );
    expect(document.querySelectorAll('[data-review]')).toHaveLength(1);
    expect(screen.getByText('Review due')).toBeInTheDocument();
  });
});

describe('GroupHeader and GroupLabel', () => {
  it('shows the name and count, and the group label is a danger heading for Overdue', () => {
    renderUi(
      <>
        <GroupHeader name="In progress" count={4} group="started" />
        <GroupLabel tone="danger" count={1}>
          Overdue
        </GroupLabel>
      </>,
    );
    expect(screen.getByRole('heading', { name: 'In progress' })).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Overdue' })).toHaveClass('text-danger-text');
  });

  it('toggles open and closed, and adds a work item from the plus', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const onToggle = vi.fn<() => void>();
    const onAdd = vi.fn<() => void>();
    const { rerender } = renderUi(<GroupHeader name="Todo" group="unstarted" onToggle={onToggle} onAdd={onAdd} />);
    expect(screen.getByRole('button', { name: 'Hide Todo' })).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'Hide Todo' }));
    expect(onToggle).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'New work item in Todo' }));
    expect(onAdd).toHaveBeenCalledOnce();
    rerender(<GroupHeader name="Todo" group="unstarted" collapsed onToggle={onToggle} />);
    expect(screen.getByRole('button', { name: 'Show Todo' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('draws the micro variant as a group label', () => {
    renderUi(<GroupHeader name="Overdue" variant="micro" tone="danger" count={2} />);
    expect(screen.getByRole('heading', { name: 'Overdue' })).toHaveClass('text-micro');
  });
});

describe('WorkItemRow', () => {
  it('is one link with the key, title, labels, due chip and assignees', () => {
    const { container } = renderUi(<WorkItemRow item={ledger} />);
    const row = screen.getByRole('link');
    expect(row).toHaveAttribute('href', '/b/ENG/14');
    expect(row).toHaveTextContent('ENG-14');
    expect(row).toHaveTextContent('Reconcile the September ledger');
    expect(row).toHaveTextContent('Finance');
    expect(row.querySelector('[data-due="today"]')).not.toBeNull();
    expect(container.querySelector('[data-work-item-row="ENG-14"]')).toBe(row);
    expect(screen.getByRole('img', { name: 'In review' })).toBeInTheDocument();
  });

  it('keeps the assignee slot when empty and drops it on request', () => {
    const none = { ...ledger, assignees: [] };
    const { container, rerender } = renderUi(<WorkItemRow item={none} />);
    expect(container.querySelector('.w-11')).not.toBeNull();
    rerender(<WorkItemRow item={none} assigneeSlot={false} />);
    expect(container.querySelector('.w-11')).toBeNull();
  });

  it('strikes through a cancelled item, and never reddens the due date of a done one', () => {
    const done: WorkItemSummary = { ...ledger, state: { name: 'Cancelled', group: 'cancelled' }, dueDate: '2026-09-26', isDone: true };
    const { container } = renderUi(<WorkItemRow item={done} />);
    expect(screen.getByText('Reconcile the September ledger')).toHaveClass('line-through');
    expect(container.querySelector('[data-due="done"]')).not.toBeNull();
  });

  it('shows an overdue item in red, and marks the selected row', () => {
    const late: WorkItemSummary = { ...ledger, dueDate: '2026-09-22' };
    const { container } = renderUi(<WorkItemRow item={late} selected />);
    expect(container.querySelector('[data-due="overdue"]')).not.toBeNull();
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'true');
  });

  it('opens in place on a plain click, and leaves a Cmd-click to the browser', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const onOpen = vi.fn<(item: WorkItemSummary) => void>();
    renderUi(<WorkItemRow item={ledger} onOpen={onOpen} />);
    await user.click(screen.getByRole('link'));
    expect(onOpen).toHaveBeenCalledWith(ledger);
    onOpen.mockClear();
    await user.keyboard('{Meta>}');
    await user.click(screen.getByRole('link'));
    await user.keyboard('{/Meta}');
    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe('BoardCard', () => {
  it('shows the key, title link, labels, due chip and assignees', () => {
    const { container } = renderUi(<BoardCard item={ledger} />);
    expect(container.querySelector('[data-board-card="ENG-14"]')).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Reconcile the September ledger' })).toHaveAttribute('href', '/b/ENG/14');
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(container.querySelector('[data-due="today"]')).not.toBeNull();
    expect(screen.getByText('AT')).toBeInTheDocument();
  });

  it('leaves the footer out when there is nothing to show in it', () => {
    const bare: WorkItemSummary = { ...ledger, labels: [], dueDate: null, assignees: [] };
    const { container } = renderUi(<BoardCard item={bare} />);
    expect(container.querySelector('.mt-2')).toBeNull();
  });
});

describe('BoardChip and BoardEmoji', () => {
  it('writes the emoji and name, as a link when it has an address', () => {
    const { rerender } = renderUi(<BoardChip board={eng} />);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
    rerender(<BoardChip board={eng} href="/b/ENG" />);
    expect(screen.getByRole('link', { name: 'Engineering' })).toHaveAttribute('href', '/b/ENG');
  });

  it('draws a folder when a board has no emoji', () => {
    const { container } = renderUi(<BoardEmoji board={{ emoji: null }} />);
    expect(container).toHaveTextContent('📁');
  });
});

describe('PageRow', () => {
  it('draws a page row with its space, folder and review pill', () => {
    renderUi(
      <PageRow
        href="/wiki/p3"
        title="New starter checklist"
        reviewDue={TODAY}
        spaceName="Knowledge"
        folderName="Onboarding"
        owner={ava}
        collaborators={[ava, mia]}
        commentCount={2}
        updatedAt="2026-09-22T01:00:00Z"
        today={TODAY}
      />,
    );
    expect(screen.getByRole('link', { name: 'New starter checklist' })).toHaveAttribute('href', '/wiki/p3');
    expect(screen.getByText('Knowledge').parentElement).toHaveTextContent('Knowledge · Onboarding · 2 comments');
    expect(screen.getByText('Review by 29 Sep')).toBeInTheDocument();
    expect(screen.getByText('22 Sep 2026')).toBeInTheDocument();
  });

  it('says Untitled, Unfiled and Private to you where there is nothing else', () => {
    renderUi(<PageRow href="/wiki/p4" title="" isPrivate reviewDue="2027-03-01" owner={null} updatedAt="2026-09-22T01:00:00Z" />);
    expect(screen.getByRole('link', { name: 'Untitled' })).toBeInTheDocument();
    expect(screen.getByText('Unfiled').parentElement).toHaveTextContent('Unfiled · Private to you');
  });
});

describe('refs', () => {
  const parts: Array<[string, ReactElement<{ ref?: Ref<Element> }>]> = [
    ['StateIcon', <StateIcon group="started" />],
    ['StatePill', <StatePill state={{ name: 'Todo', group: 'unstarted' }} />],
    ['PriorityIcon', <PriorityIcon priority="high" />],
    ['DueChip', <DueChip due={TODAY} />],
    ['ReviewBadge', <ReviewBadge reviewDue="2026-09-01" />],
    ['GroupHeader', <GroupHeader name="Todo" group="unstarted" />],
    ['WorkItemRow', <WorkItemRow item={ledger} />],
    ['BoardCard', <BoardCard item={ledger} />],
    ['BoardChip', <BoardChip board={eng} />],
    ['PageRow', <PageRow href="/wiki/p3" title="Checklist" reviewDue={null} owner={ava} updatedAt="2026-09-22T01:00:00Z" />],
  ];

  it.each(parts)('%s forwards its ref', (name, element) => {
    const ref = createRef<Element>();
    renderUi(cloneElement(element, { ref }));
    // PriorityIcon draws an svg, so its ref is an SVG element; every other part draws an HTML element.
    expect(ref.current).toBeInstanceOf(name === 'PriorityIcon' ? SVGElement : HTMLElement);
  });
});
