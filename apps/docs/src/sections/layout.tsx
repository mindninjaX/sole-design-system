import {
  ColumnHeader,
  FilterChip,
  ListCard,
  PageHeader,
  PersonCell,
  PropertyRow,
  RemovableChip,
  SearchField,
  SectionAction,
  SectionCard,
  SectionLabel,
  SubNav,
  SubNavItem,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  ViewSwitch,
} from '@sole-ui/react';
import type { BoardView } from '@sole-ui/react';
import { Calendar, CircleDashed, CircleDot, Folder, KeyRound, Mail, Phone, User, Users } from 'lucide-react';
import { useState } from 'react';
import { Canvas, Row, Stage } from '../doc.tsx';
import type { DocSection } from '../doc.tsx';
import { ava, grace, leo, mia, noah } from '../demo/people.ts';

const GRID = 'grid-cols-[1fr_220px_90px]';

function ViewSwitchDemo() {
  const [view, setView] = useState<BoardView>('list');
  return (
    <>
      <Row label="live">
        <ViewSwitch value={view} onChange={setView} />
      </Row>
      <Row label="value list">
        <ViewSwitch value="list" onChange={() => {}} />
      </Row>
      <Row label="value kanban (board)">
        <ViewSwitch value="kanban" onChange={() => {}} />
      </Row>
    </>
  );
}

function SubNavDemo() {
  const [folder, setFolder] = useState('Payroll');
  return (
    <Canvas width={280}>
      <div className="flex flex-col gap-4">
        <SubNav label="Settings">
          <SubNavItem icon={<User />} label="Profile" href="#sub-nav" active />
          <SubNavItem icon={<KeyRound />} label="Password" href="#sub-nav" />
          <SubNavItem label="No icon" href="#sub-nav" />
        </SubNav>
        <SubNav label="Folders">
          <SubNavItem icon={<Folder />} label="Payroll" count={12} active={folder === 'Payroll'} onClick={() => setFolder('Payroll')} />
          <SubNavItem icon={<Folder />} label="Invoices" count={3} active={folder === 'Invoices'} onClick={() => setFolder('Invoices')} />
          <SubNavItem icon={<Folder />} label="Unfiled" active={folder === 'Unfiled'} onClick={() => setFolder('Unfiled')} />
        </SubNav>
      </div>
    </Canvas>
  );
}

export const sections: DocSection[] = [
  {
    id: 'page-header',
    title: 'PageHeader',
    group: 'Sole',
    summary: 'The title of a screen: a 20px heading, one line under it, and the page actions on the right.',
    importLine: "import { PageHeader } from '@sole-ui/react'",
    render: () => (
      <div className="flex flex-col gap-3">
        <Canvas>
          <PageHeader title="People" />
        </Canvas>
        <Canvas>
          <PageHeader title="People" description="Everyone who can sign in." />
        </Canvas>
        <Canvas>
          <PageHeader
            title="People"
            description="Everyone who can sign in."
            actions={
              <>
                <button type="button" className="h-8 rounded-lg border border-border px-3 text-body">
                  Export
                </button>
                <button type="button" className="h-8 rounded-lg bg-primary px-3 text-body text-primary-foreground">
                  Invite someone
                </button>
              </>
            }
          />
        </Canvas>
        <Canvas>
          <PageHeader as="h2" title="As an h2" description="For a screen that sits under another heading." />
        </Canvas>
      </div>
    ),
  },
  {
    id: 'section-label',
    title: 'SectionLabel',
    group: 'Sole',
    summary: 'The small uppercase label above a group, with an optional count and a quiet action on the right (SectionAction).',
    importLine: "import { SectionLabel, SectionAction } from '@sole-ui/react'",
    render: () => (
      <Stage width={480}>
        <Row label="label">
          <SectionLabel className="w-full">Recently viewed</SectionLabel>
        </Row>
        <Row label="count">
          <SectionLabel count={2} className="w-full">
            Comments
          </SectionLabel>
        </Row>
        <Row label="action">
          <SectionLabel count={2} action={<SectionAction>Show resolved</SectionAction>} className="w-full">
            Comments
          </SectionLabel>
        </Row>
        <Row label="disabled action">
          <SectionLabel action={<SectionAction disabled>New sticky</SectionAction>} className="w-full">
            Stickies
          </SectionLabel>
        </Row>
        <Row label="as h3 / div">
          <SectionLabel as="h3">Heading level 3</SectionLabel>
          <SectionLabel as="div">Not a heading</SectionLabel>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'section-card',
    title: 'SectionCard',
    group: 'Sole',
    summary: 'A bordered card for one group of settings or details: a title, a line of help, actions and the body.',
    importLine: "import { SectionCard } from '@sole-ui/react'",
    render: () => (
      <div className="flex max-w-[560px] flex-col gap-3">
        <SectionCard title="Title only" />
        <SectionCard title="Allowed domains" description="Anyone with an address at one of these can sign in." />
        <SectionCard
          title="Allowed domains"
          description="Anyone with an address at one of these can sign in."
          actions={
            <button type="button" className="h-7 rounded-lg border border-border px-2.5 text-label">
              Add domain
            </button>
          }
        >
          <div className="flex flex-wrap gap-2">
            <RemovableChip onRemove={() => {}} removeLabel="Remove @example.com">
              @example.com
            </RemovableChip>
            <RemovableChip onRemove={() => {}} removeLabel="Remove @harbour.example">
              @harbour.example
            </RemovableChip>
          </div>
        </SectionCard>
      </div>
    ),
  },
  {
    id: 'list-card',
    title: 'ListCard',
    group: 'Sole',
    summary: 'A card with a header (title, count, a note on the right) and rows underneath, with an optional footer.',
    importLine: "import { ListCard } from '@sole-ui/react'",
    render: () => {
      const rows = ['Fix the pricing copy', 'Reply to Harbour Accounting', 'Check the payroll export'];
      const body = rows.map((r) => (
        <div key={r} className="flex h-10 items-center border-b border-hairline px-4 text-body">
          {r}
        </div>
      ));
      return (
        <div className="flex max-w-[560px] flex-col gap-3">
          <ListCard title="Title only">{body}</ListCard>
          <ListCard title="My work" count="9 open" meta="Assigned to you, not done">
            {body}
          </ListCard>
          <ListCard title="Open work" count={3} footer={<span className="text-label text-link">See all work</span>}>
            {body}
          </ListCard>
        </div>
      );
    },
  },
  {
    id: 'property-row',
    title: 'PropertyRow',
    group: 'Sole',
    summary: 'A label and its value on one 36px line, for a side panel of properties. The label can carry an icon.',
    importLine: "import { PropertyRow } from '@sole-ui/react'",
    render: () => (
      <div className="flex flex-wrap gap-4">
        <Canvas width={320} className="flex-1">
          <div className="mb-1 text-label text-muted-foreground">Without icon</div>
          <PropertyRow label="State">
            <span className="text-body">In progress</span>
          </PropertyRow>
          <PropertyRow label="Due">
            <span className="text-body">Fri 2 Oct</span>
          </PropertyRow>
          <PropertyRow label="A very long property name" title="A very long property name, shown whole on hover">
            <span className="text-body">Cut to the column</span>
          </PropertyRow>
        </Canvas>
        <Canvas width={320} className="flex-1">
          <div className="mb-1 text-label text-muted-foreground">With icon</div>
          <PropertyRow label="Email" icon={<Mail />}>
            <span className="text-body">ava@example.com</span>
          </PropertyRow>
          <PropertyRow label="Phone" icon={<Phone />}>
            <span className="text-body">0400 000 000</span>
          </PropertyRow>
          <PropertyRow label="Close date" icon={<Calendar />}>
            <span className="text-body">Fri 2 Oct</span>
          </PropertyRow>
          <PropertyRow label="Owner" icon={<Users />}>
            <span className="text-body">Ava Thompson</span>
          </PropertyRow>
        </Canvas>
      </div>
    ),
  },
  {
    id: 'table',
    title: 'Table',
    group: 'Sole',
    summary: 'A card with a header row and rows below it. TableHeader, TableRow and TableCell share one grid template; PersonCell shows who the row is about.',
    importLine: "import { Table, TableHeader, TableRow, TableCell, PersonCell } from '@sole-ui/react'",
    render: () => (
      <div className="flex max-w-[720px] flex-col gap-4">
        <Table label="People">
          <TableHeader columns={['Name', 'Email', 'Open work']} className={GRID} />
          <TableRow className={GRID}>
            <TableCell>
              <PersonCell person={ava} admin detail="Founder" />
            </TableCell>
            <TableCell>ava@example.com</TableCell>
            <TableCell>9</TableCell>
          </TableRow>
          <TableRow className={GRID}>
            <TableCell>
              <PersonCell person={noah} detail="Engineering" />
            </TableCell>
            <TableCell>noah@example.com</TableCell>
            <TableCell>4</TableCell>
          </TableRow>
          <TableRow className={`${GRID} min-h-14`}>
            <TableCell>
              <PersonCell person={mia} muted detail="Switched off" />
            </TableCell>
            <TableCell>mia@example.com</TableCell>
            <TableCell>0</TableCell>
          </TableRow>
          <TableRow className={`${GRID} hover:bg-row-hover`}>
            <TableCell>
              <PersonCell person={leo} name={<a href="#table" className="rounded-sm hover:underline">Leo Nguyen (linked)</a>} detail="leo@example.com" />
            </TableCell>
            <TableCell>leo@example.com</TableCell>
            <TableCell>2</TableCell>
          </TableRow>
        </Table>
        <Table label="Access">
          <TableHeader columns={['Person', { id: 'menu' }]} className="grid-cols-[1fr_40px]" />
          <TableRow className="grid-cols-[1fr_40px]">
            <TableCell>
              <PersonCell person={grace} detail="Ask Sole" />
            </TableCell>
            <TableCell />
          </TableRow>
        </Table>
      </div>
    ),
  },
  {
    id: 'filter-chip',
    title: 'FilterChip',
    group: 'Sole',
    summary: 'A pill that opens a filter picker. When the filter is on it turns blue and shows an x that clears it.',
    importLine: "import { FilterChip } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="default">
          <FilterChip label="Assignee" icon={<User />} />
          <FilterChip label="State" />
        </Row>
        <Row label="active">
          <FilterChip label="Assignee: Ava" icon={<User />} active />
        </Row>
        <Row label="active, clearable">
          <FilterChip label="Assignee: Ava" icon={<User />} active onClear={() => {}} />
          <FilterChip label="State: In progress" icon={<CircleDot />} active onClear={() => {}} clearLabel="Clear the state filter" />
        </Row>
        <Row label="disabled">
          <FilterChip label="Label" disabled />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'removable-chip',
    title: 'RemovableChip',
    group: 'Sole',
    summary: 'A small neutral chip for a value the person added, with an x to take it away.',
    importLine: "import { RemovableChip } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="default">
          <RemovableChip onRemove={() => {}} removeLabel="Remove @example.com">
            @example.com
          </RemovableChip>
          <RemovableChip onRemove={() => {}} removeLabel="Remove @harbour.example">
            @harbour.example
          </RemovableChip>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'search-field',
    title: 'SearchField',
    group: 'Sole',
    summary: 'A 32px search box with a magnifier and a shortcut hint. The screen wires the key through the forwarded ref.',
    importLine: "import { SearchField } from '@sole-ui/react'",
    render: () => (
      <Stage width={420}>
        <Row label="default (/ hint)">
          <SearchField placeholder="Search pages" aria-label="Search pages" wrapperClassName="w-72" />
        </Row>
        <Row label="mod hint">
          <SearchField placeholder="Search people" aria-label="Search people" shortcut="mod" wrapperClassName="w-72" />
        </Row>
        <Row label="no hint">
          <SearchField placeholder="Search" aria-label="Search" shortcut={null} wrapperClassName="w-72" />
        </Row>
        <Row label="with a value">
          <SearchField defaultValue="payroll" aria-label="Search" wrapperClassName="w-72" />
        </Row>
        <Row label="disabled">
          <SearchField placeholder="Search" aria-label="Search" disabled wrapperClassName="w-72" />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'view-switch',
    title: 'ViewSwitch',
    group: 'Sole',
    summary: 'Switches a board between List and Kanban. The arrow keys move the choice, as in any radio group.',
    importLine: "import { ViewSwitch, type BoardView } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <ViewSwitchDemo />
      </Stage>
    ),
  },
  {
    id: 'sub-nav',
    title: 'SubNav',
    group: 'Sole',
    summary: 'A column of sub-navigation items with an optional heading. An item with an href is a link; without one it is a button.',
    importLine: "import { SubNav, SubNavItem } from '@sole-ui/react'",
    render: () => <SubNavDemo />,
  },
  {
    id: 'column-header',
    title: 'ColumnHeader',
    group: 'Sole',
    summary: 'The head of a kanban column: an icon you pass in, the name, a count and a + button.',
    importLine: "import { ColumnHeader } from '@sole-ui/react'",
    render: () => (
      <Stage width={320}>
        <Row label="name only">
          <ColumnHeader name="Backlog" className="w-full" />
        </Row>
        <Row label="icon and count">
          <ColumnHeader name="Todo" count={3} icon={<CircleDashed className="size-4 text-muted-foreground" aria-hidden="true" />} className="w-full" />
        </Row>
        <Row label="add button">
          <ColumnHeader name="In progress" count={2} icon={<CircleDot className="size-4 text-brand" aria-hidden="true" />} onAdd={() => {}} className="w-full" />
        </Row>
        <Row label="custom add label">
          <ColumnHeader name="Done" count={8} onAdd={() => {}} addLabel="New work item in Done" className="w-full" />
        </Row>
      </Stage>
    ),
  },
];
