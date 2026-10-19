import {
  AppFrame,
  Breadcrumbs,
  Button,
  CommandPalette,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Page,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarSearch,
  SidebarSection,
  SidebarUser,
  TopBar,
} from '@sole-ui/react';
import { Home, Inbox, KeyRound, ListChecks, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { Canvas, Row, Stage } from '../doc.tsx';
import type { DocSection } from '../doc.tsx';
import { ava, boards } from '../demo/people.ts';

const emoji = (e: string) => <span className="inline-flex w-4 justify-center text-[14px] leading-none">{e}</span>;

const userMenu = (
  <>
    <DropdownMenuItem>
      <User aria-hidden="true" />
      Your profile
    </DropdownMenuItem>
    <DropdownMenuItem>
      <KeyRound aria-hidden="true" />
      Password
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <LogOut aria-hidden="true" />
      Sign out
    </DropdownMenuItem>
  </>
);

/** The made-up nav, as one sidebar. `rail` draws the 52px rail. */
function DemoSidebar({ rail, active, onActive, onToggle }: { rail: boolean; active: string; onActive: (id: string) => void; onToggle: () => void }) {
  const go = (id: string) => ({ onClick: () => onActive(id), active: active === id });
  return (
    <Sidebar rail={rail}>
      <SidebarHeader onToggle={onToggle} label="Sole, go to Home" />
      <SidebarSection>
        <SidebarSearch onClick={() => {}} />
      </SidebarSection>
      <SidebarContent>
        <SidebarSection>
          <SidebarItem icon={<Home />} label="Home" {...go('home')} />
          <SidebarItem icon={<Inbox />} label="Inbox" badge={{ text: '3', label: '3 unread' }} hint="3 unread" {...go('inbox')} />
          <SidebarItem icon={<ListChecks />} label="My work" shortcut={['G', 'W']} {...go('work')} />
        </SidebarSection>
        <SidebarGroup label="Boards">
          {boards.map((b) => (
            <SidebarItem key={b.id} icon={emoji(b.emoji)} label={b.name} {...go(b.id)} />
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser person={ava} meta="Member">
          {userMenu}
        </SidebarUser>
      </SidebarFooter>
    </Sidebar>
  );
}

function AppFrameDemo() {
  const [rail, setRail] = useState(false);
  const [active, setActive] = useState('home');
  const board = boards.find((b) => b.id === active);
  const title = board?.name ?? { home: 'Home', inbox: 'Inbox', work: 'My work' }[active] ?? 'Home';
  return (
    // The frame is at least 1024px wide, so the box scrolls sideways on a narrow window.
    <div className="h-[520px] overflow-x-auto rounded-xl border border-border">
      <AppFrame
        className="h-full"
        sidebar={<DemoSidebar rail={rail} active={active} onActive={setActive} onToggle={() => setRail(!rail)} />}
        aside={
          <aside aria-label="Helper" className="flex w-[280px] shrink-0 items-start rounded-xl border border-border bg-card p-4 text-body text-muted-foreground">
            An aside sits beside the panel and pushes it.
          </aside>
        }
      >
        <Page crumbs={[{ label: 'Workspace', href: '#app-frame' }, { label: title }]} actions={<Button size="sm">New task</Button>}>
          <div className="p-6 text-body text-muted-foreground">{title}</div>
        </Page>
      </AppFrame>
    </div>
  );
}

function PaletteDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open the palette
      </Button>
      {last && <span className="text-label text-muted-foreground">Chose {last}</span>}
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        placeholder="Search or jump to"
        groups={[
          {
            heading: 'Go to',
            items: [
              { id: 'home', label: 'Home', icon: <Home />, onSelect: () => setLast('Home') },
              { id: 'inbox', label: 'Inbox', icon: <Inbox />, onSelect: () => setLast('Inbox') },
              { id: 'work', label: 'My work', icon: <ListChecks />, onSelect: () => setLast('My work') },
            ],
          },
          { heading: 'Boards', items: boards.map((b) => ({ id: b.id, label: b.name, icon: emoji(b.emoji), shortcut: b.key, onSelect: () => setLast(b.name) })) },
        ]}
      />
    </>
  );
}

/** A 240px box for a sidebar part, with the sidebar's own background. */
function Rail({ rail, children }: { rail?: boolean; children: React.ReactNode }) {
  return (
    <Sidebar rail={rail} className="h-auto rounded-lg border border-border py-2">
      <SidebarSection>{children}</SidebarSection>
    </Sidebar>
  );
}

export const sections: DocSection[] = [
  {
    id: 'app-frame',
    title: 'AppFrame',
    group: 'Shell',
    summary: 'The frame every screen sits in: a sidebar on the canvas, the content panel inset 8px with a 12px radius, and an optional aside and banner. It holds from 1024px wide.',
    importLine: "import { AppFrame, Sidebar, Page } from '@sole-ui/react'",
    render: () => <AppFrameDemo />,
  },
  {
    id: 'sidebar',
    title: 'Sidebar',
    group: 'Shell',
    summary: 'The 240px sidebar, or a 52px rail of icons whose tooltips carry the label and a hint. Its parts arrive as children; the app owns the nav list.',
    importLine: "import { Sidebar, SidebarItem, SidebarGroup, SidebarUser, SidebarSearch } from '@sole-ui/react'",
    render: () => (
      <>
        <Stage>
          <Row label="Item states">
            <div className="w-60">
              <Rail>
                <SidebarItem icon={<Home />} label="Default" href="#sidebar" />
                <SidebarItem icon={<Home />} label="Active" href="#sidebar" active />
                <SidebarItem icon={<Inbox />} label="With a badge" href="#sidebar" badge={{ text: '3', label: '3 unread' }} />
                <SidebarItem icon={<ListChecks />} label="With a shortcut (hover)" href="#sidebar" shortcut={['mod', 'K']} />
              </Rail>
            </div>
          </Row>
          <Row label="Rail">
            <Rail rail>
              <SidebarItem icon={<Home />} label="Home" href="#sidebar" active />
              <SidebarItem icon={<Inbox />} label="Inbox" href="#sidebar" badge={{ text: '3', label: '3 unread' }} hint="3 unread" />
              <SidebarItem icon={<ListChecks />} label="My work" href="#sidebar" shortcut={['G', 'W']} />
            </Rail>
          </Row>
          <Row label="Group, open">
            <div className="w-60">
              <Rail>
                <SidebarGroup label="Boards">
                  {boards.map((b) => (
                    <SidebarItem key={b.id} icon={emoji(b.emoji)} label={b.name} href="#sidebar" />
                  ))}
                </SidebarGroup>
              </Rail>
            </div>
          </Row>
          <Row label="Group, closed">
            <div className="w-60">
              <Rail>
                <SidebarGroup label="Boards" defaultOpen={false}>
                  {boards.map((b) => (
                    <SidebarItem key={b.id} icon={emoji(b.emoji)} label={b.name} href="#sidebar" />
                  ))}
                </SidebarGroup>
              </Rail>
            </div>
          </Row>
          <Row label="User">
            <div className="w-60">
              <Rail>
                <SidebarUser person={ava} meta="Member">
                  {userMenu}
                </SidebarUser>
              </Rail>
            </div>
            <Rail rail>
              <SidebarUser person={ava}>{userMenu}</SidebarUser>
            </Rail>
          </Row>
          <Row label="Search">
            <div className="w-60">
              <Rail>
                <SidebarSearch onClick={() => {}} />
              </Rail>
            </div>
            <Rail rail>
              <SidebarSearch onClick={() => {}} />
            </Rail>
          </Row>
        </Stage>
      </>
    ),
  },
  {
    id: 'top-bar',
    title: 'TopBar',
    group: 'Shell',
    summary: 'The 48px bar at the top of a screen: breadcrumbs on the left, the screen\'s actions on the right. Page draws one above a scrolling body; Breadcrumbs also stands alone.',
    importLine: "import { TopBar, Breadcrumbs, Page } from '@sole-ui/react'",
    render: () => (
      <>
        <Canvas className="p-0">
          <TopBar crumbs={[{ label: 'Workspace', href: '#top-bar' }, { label: 'Engineering', icon: emoji('💻'), href: '#top-bar' }, { label: 'Fix the bank feed' }]} actions={<Button size="sm">Share</Button>} />
        </Canvas>
        <Stage>
          <Row label="One crumb">
            <Breadcrumbs crumbs={[{ label: 'Home' }]} />
          </Row>
          <Row label="Linked crumbs">
            <Breadcrumbs crumbs={[{ label: 'Settings', href: '#top-bar' }, { label: 'Profile' }]} />
          </Row>
        </Stage>
      </>
    ),
  },
  {
    id: 'command-palette',
    title: 'CommandPalette',
    group: 'Shell',
    summary: 'Cmd K: groups of rows in a 640px dialog near the top. Typing filters by label; selecting closes it and runs the row. It has no search backend, so the app passes the rows.',
    importLine: "import { CommandPalette } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="Opened by a button">
          <PaletteDemo />
        </Row>
      </Stage>
    ),
  },
];
