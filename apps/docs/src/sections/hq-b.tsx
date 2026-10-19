import { ListChecks, FileText, NotebookPen, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ActivityLine, ChecklistItem, CitationChip, Comment, InboxRow, LinkRow, MentionChip, RecentItem, Sticky, TemplateCard } from '@sole-ui/react/hq';
import type { StickyColour } from '@sole-ui/react/hq';
import { Canvas, Row, Stage } from '../doc.tsx';
import type { DocSection } from '../doc.tsx';
import { ava, bot, mia, noah } from '../demo/people.ts';

// Times are relative to the fixed now: Tuesday 29 Sep 2026, 3:00 PM in Sydney.
const TWO_HOURS_AGO = '2026-09-29T03:00:00Z';
const YESTERDAY = '2026-09-28T03:00:00Z';
const LAST_WEEK = '2026-09-21T03:00:00Z';

const IMPORT = (names: string) => `import { ${names} } from '@sole-ui/react/hq'`;

const STICKY_COLOURS: StickyColour[] = ['gray', 'peach', 'pink', 'orange', 'green', 'light-blue', 'dark-blue', 'purple'];

/** The links in the inbox demo go nowhere, so a click does not leave the page. */
const stay = (event: { preventDefault: () => void }) => event.preventDefault();

function ChecklistDemo() {
  const [checks, setChecks] = useState([false, true]);
  const set = (index: number) => (value: boolean) => setChecks((old) => old.map((c, i) => (i === index ? value : c)));
  return (
    <Stage width={480}>
      <Row label="Unchecked">
        <ChecklistItem checked={checks[0] ?? false} onCheckedChange={set(0)}>
          Update the comparison table
        </ChecklistItem>
      </Row>
      <Row label="Checked">
        <ChecklistItem checked={checks[1] ?? false} onCheckedChange={set(1)}>
          Send the draft to Noah
        </ChecklistItem>
      </Row>
      <Row label="Disabled">
        <ChecklistItem checked={false} disabled>
          Waiting on the new plan names
        </ChecklistItem>
        <ChecklistItem checked disabled>
          Plan names confirmed
        </ChecklistItem>
      </Row>
      <Row label="Body size">
        <ChecklistItem checked={false} size="body">
          A denser list uses 13/20
        </ChecklistItem>
      </Row>
    </Stage>
  );
}

const TEMPLATES = [
  { key: 'blank', icon: FileText, title: 'Blank', description: 'An empty page.' },
  { key: 'meeting', icon: NotebookPen, title: 'Meeting notes', description: 'Agenda, notes and actions.' },
  { key: 'checklist', icon: ListChecks, title: 'Checklist', description: 'Steps to tick off.' },
  { key: 'guide', icon: Sparkles, title: 'How-to guide', description: 'Steps with screenshots.' },
] as const;

function TemplateDemo() {
  const [picked, setPicked] = useState<string>('meeting');
  return (
    <Canvas width={680}>
      <div role="radiogroup" aria-label="Template" className="grid grid-cols-4 gap-3">
        {TEMPLATES.map((t) => (
          <TemplateCard key={t.key} icon={t.icon} title={t.title} description={t.description} selected={picked === t.key} onClick={() => setPicked(t.key)} />
        ))}
      </div>
    </Canvas>
  );
}

export const sections: DocSection[] = [
  {
    id: 'inbox-row',
    title: 'InboxRow',
    group: 'HQ',
    summary: 'One row in the Inbox: an unread dot, who did it, the sentence, the item and when. The whole row is a link; mark it read in onClick.',
    importLine: IMPORT('InboxRow'),
    render: () => (
      <Canvas width={700} className="!p-0">
        <InboxRow href="#unread" onClick={stay} notificationId="n1" actor={ava} summary="Ava Thompson assigned this to you" detail="ENG-14 Fix the pricing copy on the plans page" at={TWO_HOURS_AGO} unread />
        <InboxRow href="#read" onClick={stay} notificationId="n2" actor={noah} summary="Noah Patel commented" detail="Can we confirm the plan names before this goes out?" at={YESTERDAY} />
        <InboxRow href="#selected" onClick={stay} notificationId="n3" actor={bot} summary="Taskmate filed this from Slack" detail="CS-9 Refund request from a bookkeeper" at={LAST_WEEK} selected />
        <InboxRow href="#nobody" onClick={stay} notificationId="n4" actor={null} summary="A page you own is due for review" detail="Refund policy" at={LAST_WEEK} unread />
      </Canvas>
    ),
  },
  {
    id: 'activity-line',
    title: 'ActivityLine',
    group: 'HQ',
    summary: 'One line of a work item timeline: an icon for the kind of change, the sentence your app builds, and when. Pick the icon with kind.',
    importLine: IMPORT('ActivityLine'),
    render: () => (
      <Stage width={480}>
        <Row label="created">
          <ActivityLine actor={bot} kind="created" at={TWO_HOURS_AGO} className="w-full">
            Taskmate created this from Slack
          </ActivityLine>
        </Row>
        <Row label="state">
          <ActivityLine actor={ava} kind="state" at={TWO_HOURS_AGO} className="w-full">
            Ava moved this from Todo to Done
          </ActivityLine>
        </Row>
        <Row label="assignee">
          <ActivityLine actor={noah} kind="assignee" at={YESTERDAY} className="w-full">
            Noah assigned Mia
          </ActivityLine>
        </Row>
        <Row label="label">
          <ActivityLine actor={ava} kind="label" at={YESTERDAY} className="w-full">
            Ava added the label Website
          </ActivityLine>
        </Row>
        <Row label="due">
          <ActivityLine actor={mia} kind="due" at={LAST_WEEK} className="w-full">
            Mia set the due date to 2 Oct
          </ActivityLine>
        </Row>
        <Row label="comment">
          <ActivityLine actor={noah} kind="comment" at={LAST_WEEK} className="w-full">
            Noah commented
          </ActivityLine>
        </Row>
        <Row label="link">
          <ActivityLine actor={ava} kind="link" at={LAST_WEEK} className="w-full">
            Ava added a link
          </ActivityLine>
        </Row>
        <Row label="delete">
          <ActivityLine actor={null} kind="delete" at={LAST_WEEK} className="w-full">
            Former member deleted a comment
          </ActivityLine>
        </Row>
        <Row label="edit">
          <ActivityLine actor={ava} kind="edit" at={LAST_WEEK} className="w-full">
            Ava edited the description
          </ActivityLine>
        </Row>
        <Row label="property">
          <ActivityLine actor={mia} kind="property" at={LAST_WEEK} className="w-full">
            Mia set Firm to Harbour Accounting
          </ActivityLine>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'comment',
    title: 'Comment',
    group: 'HQ',
    summary: 'A comment: the author, when, then the body you give it as children. Actions show on hover. A bot, a label and a former member each read plainly.',
    importLine: IMPORT('Comment'),
    render: () => (
      <Canvas width={560} className="flex flex-col gap-4">
        <Comment author={ava} createdAt={TWO_HOURS_AGO}>
          Can we confirm the plan names before this goes out?
        </Comment>
        <Comment
          author={noah}
          createdAt={YESTERDAY}
          edited
          actions={
            <>
              <button type="button" className="text-label text-link hover:underline">
                Edit
              </button>
              <button type="button" className="text-label text-link hover:underline">
                Delete
              </button>
            </>
          }
        >
          Hover for Edit and Delete. Confirmed with the team, the names stand.
        </Comment>
        <Comment author={mia} createdAt={LAST_WEEK} resolved>
          Resolved comments fade.
        </Comment>
        <Comment author={bot} createdAt={YESTERDAY}>
          A bot comments under its own name.
        </Comment>
        <Comment author={bot} label="Leo (from the Dialer)" createdAt={YESTERDAY}>
          A bot posting for someone reads as their label, with the bot avatar.
        </Comment>
        <Comment author={null} createdAt={LAST_WEEK}>
          A former member reads as Former member.
        </Comment>
        <Comment author={ava} createdAt={TWO_HOURS_AGO} reading>
          Page comments use the reading size, 14/20.
        </Comment>
      </Canvas>
    ),
  },
  {
    id: 'sticky',
    title: 'Sticky',
    group: 'HQ',
    summary: 'A note on Home in one of eight colours, with an optional title. The body keeps its line breaks.',
    importLine: IMPORT('Sticky') + `\nimport type { StickyColour } from '@sole-ui/react/hq'`,
    render: () => (
      <Canvas>
        <div className="grid grid-cols-4 gap-3">
          {STICKY_COLOURS.map((colour) => (
            <Sticky key={colour} colour={colour} title={colour}>
              {'Ask Sole should read the\nrefund policy page first'}
            </Sticky>
          ))}
          <Sticky>A note with no title.</Sticky>
          <Sticky title="A title with no note" />
        </div>
      </Canvas>
    ),
  },
  {
    id: 'template-card',
    title: 'TemplateCard',
    group: 'HQ',
    summary: 'A choice in the New page dialog: an icon, a name and a hint. It is a radio, so put cards in a radiogroup. The chosen one is blue.',
    importLine: IMPORT('TemplateCard'),
    render: () => (
      <>
        <TemplateDemo />
        <Canvas width={680} className="mt-3">
          <div className="grid grid-cols-4 gap-3">
            <TemplateCard icon={FileText} title="Unselected" description="The resting card." />
            <TemplateCard icon={FileText} title="Selected" description="Blue border and fill." selected />
            <TemplateCard icon={FileText} title="Disabled" description="Cannot be chosen." disabled className="opacity-50" />
          </div>
        </Canvas>
      </>
    ),
  },
  {
    id: 'mention-chip',
    title: 'MentionChip and CitationChip',
    group: 'HQ',
    summary: 'The two inline chips. MentionChip is how an @mention reads in any text. CitationChip is the numbered source marker in an Ask answer.',
    importLine: IMPORT('MentionChip, CitationChip'),
    render: () => (
      <Stage>
        <Row label="MentionChip: person">
          <p className="text-body">
            Thanks <MentionChip person={ava} />, that fixes it.
          </p>
        </Row>
        <Row label="MentionChip: bot">
          <MentionChip person={bot} />
        </Row>
        <Row label="MentionChip: not loaded">
          <MentionChip person={null} label="Mia Rossi" />
        </Row>
        <Row label="MentionChip: former member">
          <MentionChip />
        </Row>
        <Row label="CitationChip: plain">
          <p className="text-body">
            Refunds take 5 working days <CitationChip n={1} />
          </p>
        </Row>
        <Row label="CitationChip: link">
          <CitationChip n={2} href="#mention-chip" />
        </Row>
        <Row label="CitationChip: button">
          <CitationChip n={3} onClick={() => {}} />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'checklist-item',
    title: 'ChecklistItem',
    group: 'HQ',
    summary: 'A checkbox and a line of text, as in a description or the Home list. A done line turns the subtle grey.',
    importLine: IMPORT('ChecklistItem'),
    render: () => <ChecklistDemo />,
  },
  {
    id: 'link-row',
    title: 'LinkRow',
    group: 'HQ',
    summary: 'A link on a work item: an icon, the title as a link, then the meta. An address starting http opens in a new tab; any other goes through your router.',
    importLine: IMPORT('LinkRow'),
    render: () => (
      <Stage width={560}>
        <Row label="Outside link">
          <LinkRow href="https://example.com/archives/p1" title="The original message in Slack" meta="#pricing · Noah Patel · 24 Sep" className="w-full" />
        </Row>
        <Row label="Inside link">
          <LinkRow href="#link-row" title="ENG-14 Fix the pricing copy" meta="Work item" className="w-full" />
        </Row>
        <Row label="Actions on hover">
          <LinkRow
            href="https://example.com/brief"
            title="Pricing brief"
            meta="Ava Thompson · 21 Sep"
            actions={
              <button type="button" className="text-label text-link hover:underline">
                Remove
              </button>
            }
            className="w-full"
          />
        </Row>
        <Row label="Title only">
          <LinkRow href="https://example.com" title="example.com" className="w-full" />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'recent-item',
    title: 'RecentItem',
    group: 'HQ',
    summary: 'An entry in Home\'s Recently viewed: a page or work item icon, the title and where it lives.',
    importLine: IMPORT('RecentItem'),
    render: () => (
      <Stage width={420}>
        <Row label="Page">
          <RecentItem kind="page" href="#recent-item" title="How we run payroll month end" where="Knowledge" className="w-full" />
        </Row>
        <Row label="Work item">
          <RecentItem kind="work_item" href="#recent-item" title="ENG-14 Fix the pricing copy on the plans page" where="Engineering" className="w-full" />
        </Row>
        <Row label="No place">
          <RecentItem kind="page" href="#recent-item" title="Untitled" className="w-full" />
        </Row>
      </Stage>
    ),
  },
];
