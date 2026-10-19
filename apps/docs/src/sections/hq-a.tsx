import {
  BoardCard,
  BoardChip,
  BoardEmoji,
  DueChip,
  GroupHeader,
  GroupLabel,
  PageRow,
  PriorityIcon,
  PropertyTypeIcon,
  ReviewBadge,
  ReviewStateBadge,
  STATE_GROUP_LABELS,
  StateIcon,
  StatePill,
  WorkItemRow,
} from '@sole-ui/react/hq';
import type { Priority, PropertyType, StateGroup, WorkItemSummary } from '@sole-ui/react/hq';
import { Canvas, Row, Stage } from '../doc.tsx';
import type { DocSection } from '../doc.tsx';
import { ava, boards, grace, leo, mia, noah, TODAY } from '../demo/people.ts';

const GROUPS: StateGroup[] = ['backlog', 'unstarted', 'started', 'completed', 'cancelled'];
const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low', 'none'];
const PROPERTY_TYPES: PropertyType[] = ['text', 'number', 'date', 'select', 'multi_select', 'person', 'checkbox', 'url'];
const [eng, cs] = boards;

const ledger: WorkItemSummary = {
  key: 'ENG-14',
  href: '#work-item-row',
  title: 'Reconcile the September ledger',
  priority: 'high',
  state: { name: 'In review', group: 'started' },
  labels: [
    { id: 'l-finance', name: 'Finance', hue: 'teal' },
    { id: 'l-month-end', name: 'Month end', hue: 'violet' },
    { id: 'l-audit', name: 'Audit', hue: 'amber' },
  ],
  dueDate: '2026-10-02',
  assignees: [ava, noah, mia],
  isDone: false,
};
const unassigned: WorkItemSummary = { ...ledger, key: 'ENG-15', title: 'Draft the payroll cut-off notice', priority: 'medium', labels: [], dueDate: null, assignees: [] };
const finished: WorkItemSummary = {
  ...ledger,
  key: 'ENG-9',
  title: 'Archive the August timesheets',
  priority: 'low',
  state: { name: 'Done', group: 'completed' },
  dueDate: '2026-09-26',
  assignees: [leo],
  isDone: true,
};
const overdue: WorkItemSummary = { ...ledger, key: 'ENG-11', title: 'Chase the missing super statements', priority: 'urgent', state: { name: 'Todo', group: 'unstarted' }, dueDate: '2026-09-22', assignees: [grace] };

export const sections: DocSection[] = [
  {
    id: 'state-icon',
    title: 'StateIcon',
    group: 'HQ',
    summary: 'One icon per state group, so Backlog and Todo differ by shape and not only by colour. Colour is by group, never by the state\'s own hex.',
    importLine: "import { StateIcon, STATE_GROUP_LABELS } from '@sole-ui/react/hq'",
    render: () => (
      <Stage>
        <Row label="Each group">
          {GROUPS.map((group) => (
            <StateIcon key={group} group={group} />
          ))}
        </Row>
        <Row label="Named by the state">
          <StateIcon group="started" name="In review" />
          <StateIcon group="completed" name="Shipped" />
        </Row>
        <Row label="Decorative">
          {GROUPS.map((group) => (
            <span key={group} className="inline-flex items-center gap-1.5 text-body">
              <StateIcon group={group} decorative />
              {STATE_GROUP_LABELS[group]}
            </span>
          ))}
        </Row>
        <Row label="Size 12 and 20">
          <StateIcon group="started" size={12} />
          <StateIcon group="started" size={20} />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'state-pill',
    title: 'StatePill',
    group: 'HQ',
    summary: 'A state with its name, for properties and column headers. Rows use the icon alone.',
    importLine: "import { StatePill } from '@sole-ui/react/hq'",
    render: () => (
      <Stage>
        <Row label="Each group">
          <StatePill state={{ name: 'Backlog', group: 'backlog' }} />
          <StatePill state={{ name: 'Todo', group: 'unstarted' }} />
          <StatePill state={{ name: 'In review', group: 'started' }} />
          <StatePill state={{ name: 'Done', group: 'completed' }} />
          <StatePill state={{ name: 'Cancelled', group: 'cancelled' }} />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'priority-icon',
    title: 'PriorityIcon',
    group: 'HQ',
    summary: 'Only urgent is coloured. The rest are three bars with one, two or three filled, so priority reads without colour.',
    importLine: "import { PriorityIcon } from '@sole-ui/react/hq'",
    render: () => (
      <Stage>
        <Row label="Each priority">
          {PRIORITIES.map((priority) => (
            <PriorityIcon key={priority} priority={priority} />
          ))}
        </Row>
        <Row label="Decorative">
          {PRIORITIES.map((priority) => (
            <span key={priority} className="inline-flex items-center gap-1.5 text-body">
              <PriorityIcon priority={priority} decorative />
              {priority}
            </span>
          ))}
        </Row>
        <Row label="Size 20">
          <PriorityIcon priority="urgent" size={20} />
          <PriorityIcon priority="medium" size={20} />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'property-type-icon',
    title: 'PropertyTypeIcon',
    group: 'HQ',
    summary: 'One glyph per kind of custom property, in the settings list and the type picker.',
    importLine: "import { PropertyTypeIcon } from '@sole-ui/react/hq'",
    render: () => (
      <Stage>
        <Row label="Each type">
          {PROPERTY_TYPES.map((type) => (
            <span key={type} className="inline-flex items-center gap-1.5 text-body">
              <PropertyTypeIcon type={type} />
              {type}
            </span>
          ))}
        </Row>
      </Stage>
    ),
  },
  {
    id: 'due-chip',
    title: 'DueChip',
    group: 'HQ',
    summary: 'The due date. Solid red is for an open item past its date and nothing else; later dates and done items are plain text.',
    importLine: "import { DueChip } from '@sole-ui/react/hq'",
    render: () => (
      <Stage>
        <Row label="Overdue">
          <DueChip due="2026-09-22" today={TODAY} />
        </Row>
        <Row label="Today">
          <DueChip due={TODAY} today={TODAY} />
        </Row>
        <Row label="Tomorrow">
          <DueChip due="2026-09-30" today={TODAY} />
        </Row>
        <Row label="This week">
          <DueChip due="2026-10-02" today={TODAY} />
        </Row>
        <Row label="Later">
          <DueChip due="2026-10-09" today={TODAY} />
          <DueChip due="2027-01-14" today={TODAY} />
        </Row>
        <Row label="Done">
          <DueChip due="2026-09-22" today={TODAY} done />
        </Row>
        <Row label="Today from the provider">
          <DueChip due="2026-09-29" />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'review-badge',
    title: 'ReviewBadge',
    group: 'HQ',
    summary: 'The review pill on wiki rows. A current page shows nothing: the pill only appears when there is something to do.',
    importLine: "import { ReviewBadge, ReviewStateBadge } from '@sole-ui/react/hq'",
    render: () => (
      <Stage>
        <Row label="From a date">
          <ReviewBadge reviewDue="2026-10-08" today={TODAY} />
          <ReviewBadge reviewDue="2026-09-26" today={TODAY} />
          <ReviewBadge reviewDue={null} today={TODAY} />
        </Row>
        <Row label="Current: nothing">
          <ReviewBadge reviewDue="2026-12-01" today={TODAY} />
          <span className="text-label text-subtle-foreground">no pill drawn</span>
        </Row>
        <Row label="From a state">
          <ReviewStateBadge state="due" />
          <ReviewStateBadge state="overdue" />
          <ReviewStateBadge state="unknown" />
          <ReviewStateBadge state="current" />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'group-header',
    title: 'GroupHeader',
    group: 'HQ',
    summary: 'A list group header: state icon, name, count, a toggle and a plus that appears on hover. GroupLabel is the small uppercase bucket header Home uses.',
    importLine: "import { GroupHeader, GroupLabel } from '@sole-ui/react/hq'",
    render: () => (
      <Stage width={560}>
        <Row label="Open">
          <div className="w-full">
            <GroupHeader name="In progress" count={4} group="started" onToggle={() => {}} onAdd={() => {}} />
          </div>
        </Row>
        <Row label="Closed">
          <div className="w-full">
            <GroupHeader name="Done" count={12} group="completed" collapsed onToggle={() => {}} />
          </div>
        </Row>
        <Row label="Name and count only">
          <div className="w-full">
            <GroupHeader name="Backlog" count={7} group="backlog" />
          </div>
        </Row>
        <Row label="Micro">
          <div className="w-full">
            <GroupHeader name="Overdue" variant="micro" tone="danger" count={1} />
            <GroupHeader name="Today" variant="micro" count={3} />
          </div>
        </Row>
        <Row label="GroupLabel">
          <div className="w-full">
            <GroupLabel count={2}>This week</GroupLabel>
          </div>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'work-item-row',
    title: 'WorkItemRow',
    group: 'HQ',
    summary: 'A work item as one 36px row, and the whole row is the link. The key, due and assignee slots have fixed widths so chips line up down a list.',
    importLine: "import { WorkItemRow } from '@sole-ui/react/hq'",
    render: () => (
      <Canvas width={760} className="p-0">
        <WorkItemRow item={ledger} />
        <WorkItemRow item={unassigned} />
        <WorkItemRow item={overdue} />
        <WorkItemRow item={finished} />
        <WorkItemRow item={{ ...finished, key: 'ENG-8', title: 'Cancel the duplicate ticket', state: { name: 'Cancelled', group: 'cancelled' } }} />
        <WorkItemRow item={ledger} selected />
        <WorkItemRow item={unassigned} assigneeSlot={false} />
      </Canvas>
    ),
  },
  {
    id: 'board-card',
    title: 'BoardCard',
    group: 'HQ',
    summary: 'A kanban card: key and priority, the title up to three lines, then labels, due date and assignees. Spread drag props onto it.',
    importLine: "import { BoardCard } from '@sole-ui/react/hq'",
    render: () => (
      <Canvas>
        <div className="grid grid-cols-[repeat(auto-fill,270px)] items-start gap-3">
          <BoardCard item={ledger} today={TODAY} />
          <BoardCard item={unassigned} today={TODAY} />
          <BoardCard item={overdue} today={TODAY} />
          <BoardCard item={finished} today={TODAY} />
          <BoardCard item={ledger} today={TODAY} dragging />
        </div>
      </Canvas>
    ),
  },
  {
    id: 'board-chip',
    title: 'BoardChip',
    group: 'HQ',
    summary: 'A board\'s emoji and name. The emoji is data, not copy. BoardEmoji alone is for menus and breadcrumbs.',
    importLine: "import { BoardChip, BoardEmoji } from '@sole-ui/react/hq'",
    render: () => (
      <Stage>
        <Row label="Chip">
          <BoardChip board={eng} />
          <BoardChip board={cs} />
        </Row>
        <Row label="Link">
          <BoardChip board={eng} href="#board-chip" />
        </Row>
        <Row label="No emoji">
          <BoardChip board={{ id: 'b-none', name: 'Unsorted', emoji: null }} />
        </Row>
        <Row label="Emoji alone">
          <BoardEmoji board={eng} />
          <BoardEmoji board={cs} />
          <BoardEmoji board={{ emoji: null }} />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'page-row',
    title: 'PageRow',
    group: 'HQ',
    summary: 'A wiki page as one 52px row: title and review pill, folder and tags, owner and collaborators, last updated. The whole row is the link.',
    importLine: "import { PageRow } from '@sole-ui/react/hq'",
    render: () => (
      <Canvas width={760} className="p-0">
        <PageRow
          href="#page-row"
          title="New starter checklist"
          reviewDue="2026-10-08"
          folderName="Onboarding"
          tags={[{ id: 't1', name: 'People' }]}
          commentCount={2}
          owner={ava}
          collaborators={[noah, mia, leo]}
          updatedAt="2026-09-22T01:00:00Z"
          today={TODAY}
        />
        <PageRow
          href="#page-row"
          title="Month-end close"
          reviewDue="2026-09-01"
          spaceName="Finance"
          folderName={null}
          owner={grace}
          updatedAt="2026-08-30T01:00:00Z"
          today={TODAY}
        />
        <PageRow href="#page-row" title="Draft pay run notes" isPrivate reviewDue={null} owner={ava} updatedAt="2026-09-28T04:00:00Z" today={TODAY} />
        <PageRow href="#page-row" title="Refund policy" reviewDue="2027-03-01" owner={null} updatedAt="2026-09-15T01:00:00Z" today={TODAY} />
      </Canvas>
    ),
  },
];
