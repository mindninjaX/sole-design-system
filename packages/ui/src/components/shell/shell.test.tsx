import * as React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home, Inbox } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import type { SoleLinkProps } from '../../lib/sole-provider.tsx';
import { renderUi } from '../../../test/render.tsx';
import { DropdownMenuItem } from '../ui/dropdown-menu.tsx';
import { AppFrame } from './app-frame.tsx';
import { CommandPalette, type CommandPaletteGroup } from './command-palette.tsx';
import { Breadcrumbs, Page, TopBar } from './page.tsx';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem, SidebarSearch, SidebarSection, SidebarUser } from './sidebar.tsx';

// The shell parts: the sidebar and its rail (20.1), the user menu (20.4), Cmd K (20.2),
// the app frame and the page's top bar, with made-up people and nav.

const ava = { id: 'p-ava', name: 'Ava Thompson' };

/** A router's link: records where it was asked to go, so a test can tell it was used. */
const TestLink = React.forwardRef<HTMLAnchorElement, SoleLinkProps>(function TestLink(props, ref) {
  return <a ref={ref} data-router-link="true" {...props} />;
});
const withRouterLink = { provider: { linkComponent: TestLink } };

describe('SidebarItem', () => {
  it('renders a link through the provider link component and marks the current page', () => {
    renderUi(
      <Sidebar>
        <SidebarItem href="/inbox" icon={<Inbox />} label="Inbox" active />
        <SidebarItem href="/" icon={<Home />} label="Home" />
      </Sidebar>,
      withRouterLink,
    );
    const inbox = screen.getByRole('link', { name: 'Inbox' });
    expect(inbox).toHaveAttribute('href', '/inbox');
    expect(inbox).toHaveAttribute('data-router-link', 'true');
    expect(inbox).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('is a button without an href, and calls onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();
    renderUi(<SidebarItem icon={<Inbox />} label="New message" onClick={onClick} />);
    await user.click(screen.getByRole('button', { name: 'New message' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows the badge as a count with its words, and keeps the shortcut for rows without one', () => {
    renderUi(
      <>
        <SidebarItem href="/inbox" icon={<Inbox />} label="Inbox" badge={{ text: '3', label: '3 unread' }} shortcut={['G', 'I']} />
        <SidebarItem href="/" icon={<Home />} label="Home" shortcut={['G', 'H']} />
      </>,
    );
    expect(screen.getByLabelText('3 unread')).toHaveTextContent('3');
    expect(screen.queryByText('G I')).not.toBeInTheDocument();
    expect(screen.getByText('G H')).toBeInTheDocument();
  });

  it('in the rail drops the text, names the link with the count and shows the tooltip on focus', async () => {
    const user = userEvent.setup();
    renderUi(
      <Sidebar rail>
        <SidebarItem href="/inbox" icon={<Inbox />} label="Inbox" badge={{ text: '3', label: '3 unread' }} hint="1 mention, 3 unread" />
      </Sidebar>,
    );
    const link = screen.getByRole('link', { name: 'Inbox, 3 unread' });
    expect(link).not.toHaveTextContent('Inbox');
    expect(screen.getByRole('navigation', { name: 'Main' })).toHaveAttribute('data-rail', 'true');
    await user.tab();
    expect(link).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Inbox · 1 mention, 3 unread');
  });

  it('a part can be told it is a rail without its Sidebar saying so', () => {
    renderUi(<SidebarItem href="/" icon={<Home />} label="Home" rail />);
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveTextContent('Home');
  });
});

describe('SidebarGroup', () => {
  it('collapses and opens its rows, and says which with aria-expanded', async () => {
    const user = userEvent.setup();
    renderUi(
      <SidebarGroup label="Boards">
        <SidebarItem href="/b/eng" icon="💻" label="Engineering" />
      </SidebarGroup>,
    );
    const toggle = screen.getByRole('button', { name: 'Boards' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Engineering' })).toBeInTheDocument();
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Engineering' })).not.toBeInTheDocument();
    await user.click(toggle);
    expect(screen.getByRole('link', { name: 'Engineering' })).toBeInTheDocument();
  });

  it('can be controlled, and tells the caller what was asked for', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn<(open: boolean) => void>();
    renderUi(
      <SidebarGroup label="Boards" open={false} onOpenChange={onOpenChange}>
        <SidebarItem href="/b/eng" icon="💻" label="Engineering" />
      </SidebarGroup>,
    );
    await user.click(screen.getByRole('button', { name: 'Boards' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('link', { name: 'Engineering' })).not.toBeInTheDocument();
  });

  it('in the rail shows the rows with no heading to collapse', () => {
    renderUi(
      <SidebarGroup label="Boards" open={false} rail>
        <SidebarItem href="/b/eng" icon="💻" label="Engineering" rail />
      </SidebarGroup>,
    );
    expect(screen.queryByRole('button', { name: 'Boards' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Engineering' })).toBeInTheDocument();
  });
});

describe('SidebarHeader and SidebarSearch', () => {
  it('links the logo and toggles the sidebar', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn<() => void>();
    renderUi(<SidebarHeader href="/" label="Sole, go to Home" onToggle={onToggle} />, withRouterLink);
    expect(screen.getByRole('link', { name: 'Sole, go to Home' })).toHaveAttribute('data-router-link', 'true');
    await user.click(screen.getByRole('button', { name: 'Collapse the sidebar' }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('in the rail the mark is the expand button', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn<() => void>();
    renderUi(<SidebarHeader rail onToggle={onToggle} />);
    await user.click(screen.getByRole('button', { name: 'Expand the sidebar' }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('search is a button that names its keys', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();
    renderUi(<SidebarSearch onClick={onClick} />);
    const button = screen.getByRole('button', { name: /Search/ });
    expect(button).toHaveAttribute('aria-keyshortcuts', 'Meta+K Control+K');
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('SidebarUser', () => {
  it('opens a menu headed by the name, with the rows it was given', async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn<() => void>();
    renderUi(
      <Sidebar>
        <SidebarUser person={ava} meta="Member">
          <DropdownMenuItem>Your profile</DropdownMenuItem>
          <DropdownMenuItem onSelect={onSignOut}>Sign out</DropdownMenuItem>
        </SidebarUser>
      </Sidebar>,
    );
    const trigger = screen.getByRole('button', { name: 'Ava Thompson, open the menu' });
    expect(within(trigger).getByText('Member')).toBeInTheDocument();
    await user.click(trigger);
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('Ava Thompson')).toBeInTheDocument();
    expect(within(menu).getAllByRole('menuitem').map((m) => m.textContent)).toEqual(['Your profile', 'Sign out']);
    await user.click(within(menu).getByRole('menuitem', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });
});

describe('AppFrame', () => {
  it('draws the sidebar, the content panel and the aside beside it', () => {
    renderUi(
      <AppFrame sidebar={<Sidebar>sidebar</Sidebar>} aside={<aside aria-label="Helper">helper</aside>}>
        <p>the screen</p>
      </AppFrame>,
    );
    const content = screen.getByRole('main');
    expect(content).toHaveTextContent('the screen');
    expect(content).toHaveAttribute('data-pane', 'content');
    expect(content).toHaveAttribute('data-has-aside', 'true');
    expect(screen.getByRole('navigation', { name: 'Main' })).toHaveTextContent('sidebar');
    expect(screen.getByRole('complementary', { name: 'Helper' })).toBeInTheDocument();
    expect(content.parentElement?.className).toContain('pt-2');
    expect(content.closest('[data-app-shell]')?.className).toContain('min-w-[1024px]');
  });

  it('puts a banner above the panel and takes the panel own top gap away', () => {
    renderUi(
      <AppFrame sidebar={<Sidebar>sidebar</Sidebar>} banner={<div role="status">Demo data</div>}>
        <p>the screen</p>
      </AppFrame>,
    );
    const content = screen.getByRole('main');
    expect(screen.getByRole('status')).toHaveTextContent('Demo data');
    expect(content.parentElement?.className).not.toContain('pt-2');
    expect(content).not.toHaveAttribute('data-has-aside');
  });
});

describe('Breadcrumbs, TopBar and Page', () => {
  const crumbs = [{ label: 'Settings', href: '/settings' }, { label: 'Profile' }];

  it('links every crumb but the last, which is the current page', () => {
    renderUi(<Breadcrumbs crumbs={crumbs} />, withRouterLink);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link).toHaveAttribute('href', '/settings');
    expect(link).toHaveAttribute('data-router-link', 'true');
    expect(screen.queryByRole('link', { name: 'Profile' })).not.toBeInTheDocument();
    expect(screen.getByText('Profile').closest('li')).toHaveAttribute('aria-current', 'page');
  });

  it('puts the actions in the top bar, and the screen in the page body', () => {
    renderUi(
      <Page crumbs={crumbs} actions={<button type="button">Share</button>} className="p-4">
        <p>the screen</p>
      </Page>,
    );
    const bar = document.querySelector<HTMLElement>('[data-topbar]');
    expect(bar).not.toBeNull();
    expect(within(bar as HTMLElement).getByRole('button', { name: 'Share' })).toBeInTheDocument();
    const body = document.querySelector('[data-page-body]');
    expect(body).toHaveTextContent('the screen');
    expect(body).toHaveClass('p-4');
  });
});

describe('CommandPalette', () => {
  const run = vi.fn<(id: string) => void>();
  const groups: CommandPaletteGroup[] = [
    {
      heading: 'Go to',
      items: [
        { id: 'home', label: 'Home', icon: <Home />, onSelect: () => run('home') },
        { id: 'inbox', label: 'Inbox', icon: <Inbox />, onSelect: () => run('inbox') },
      ],
    },
    { heading: 'Actions', items: [{ id: 'new', label: 'New task', shortcut: 'C', onSelect: () => run('new') }] },
  ];

  function Harness() {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Open the palette
        </button>
        <CommandPalette groups={groups} open={open} onOpenChange={setOpen} />
      </>
    );
  }

  async function openPalette(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: 'Open the palette' }));
    return screen.findByRole('dialog');
  }

  it('lists every group before anything is typed, with the first row highlighted', async () => {
    const user = userEvent.setup();
    renderUi(<Harness />);
    const dialog = await openPalette(user);
    expect(within(dialog).getByPlaceholderText('Search or jump to')).toHaveFocus();
    expect(within(dialog).getByRole('group', { name: 'Go to' })).toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: 'Actions' })).toBeInTheDocument();
    expect(within(dialog).getByRole('option', { name: 'Home' })).toHaveAttribute('aria-selected', 'true');
    expect(within(dialog).getByRole('option', { name: /New task/ })).toHaveTextContent('C');
  });

  it('filters the rows by label, drops a group with none left, and says when nothing matches', async () => {
    const user = userEvent.setup();
    renderUi(<Harness />);
    const dialog = await openPalette(user);
    const input = within(dialog).getByPlaceholderText('Search or jump to');
    await user.type(input, 'inb');
    expect(within(dialog).getAllByRole('option').map((o) => o.textContent)).toEqual(['Inbox']);
    expect(within(dialog).queryByRole('group', { name: 'Actions' })).not.toBeInTheDocument();
    await user.clear(input);
    await user.type(input, 'zzz');
    expect(await within(dialog).findByText('Nothing matches that.')).toBeInTheDocument();
  });

  it('selects the row on Enter, closes first, then runs it', async () => {
    run.mockClear();
    const user = userEvent.setup();
    renderUi(<Harness />);
    const dialog = await openPalette(user);
    await user.type(within(dialog).getByPlaceholderText('Search or jump to'), 'new');
    await user.keyboard('{Enter}');
    expect(run).toHaveBeenCalledExactlyOnceWith('new');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('selects a row by click, and forgets what was typed after Esc', async () => {
    run.mockClear();
    const user = userEvent.setup();
    renderUi(<Harness />);
    let dialog = await openPalette(user);
    await user.click(within(dialog).getByRole('option', { name: 'Inbox' }));
    expect(run).toHaveBeenCalledExactlyOnceWith('inbox');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    dialog = await openPalette(user);
    await user.type(within(dialog).getByPlaceholderText('Search or jump to'), 'pay');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    dialog = await openPalette(user);
    expect(within(dialog).getByPlaceholderText('Search or jump to')).toHaveValue('');
  });

  it('leaves the filtering to the caller when filter is false', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn<(query: string) => void>();
    renderUi(<CommandPalette groups={groups} open onOpenChange={() => {}} filter={false} onQueryChange={onQueryChange} />);
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('Search or jump to'), 'zzz');
    expect(onQueryChange).toHaveBeenLastCalledWith('zzz');
    expect(within(dialog).getAllByRole('option')).toHaveLength(3);
  });
});

describe('refs', () => {
  it.each([
    ['Sidebar', () => (ref: React.RefObject<HTMLDivElement | null>) => <Sidebar ref={ref}>x</Sidebar>],
    ['SidebarItem', () => (ref: React.RefObject<HTMLDivElement | null>) => <SidebarItem ref={ref} href="/" icon={<Home />} label="Home" />],
    ['SidebarHeader', () => (ref: React.RefObject<HTMLDivElement | null>) => <SidebarHeader ref={ref} />],
    ['SidebarSection', () => (ref: React.RefObject<HTMLDivElement | null>) => <SidebarSection ref={ref}>x</SidebarSection>],
    ['SidebarContent', () => (ref: React.RefObject<HTMLDivElement | null>) => <SidebarContent ref={ref}>x</SidebarContent>],
    ['SidebarFooter', () => (ref: React.RefObject<HTMLDivElement | null>) => <SidebarFooter ref={ref}>x</SidebarFooter>],
    ['TopBar', () => (ref: React.RefObject<HTMLDivElement | null>) => <TopBar ref={ref} crumbs={[{ label: 'Home' }]} />],
    ['Page', () => (ref: React.RefObject<HTMLDivElement | null>) => <Page ref={ref} crumbs={[{ label: 'Home' }]}>x</Page>],
    ['AppFrame', () => (ref: React.RefObject<HTMLDivElement | null>) => <AppFrame ref={ref} sidebar={<Sidebar>x</Sidebar>}>x</AppFrame>],
  ] as const)('%s forwards its ref', (_name, make) => {
    const ref = React.createRef<HTMLDivElement>();
    renderUi(make()(ref));
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
