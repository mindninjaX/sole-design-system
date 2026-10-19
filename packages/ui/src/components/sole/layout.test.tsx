import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mail } from 'lucide-react';
import { forwardRef, useState } from 'react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderUi } from '../../../test/render.tsx';
import type { SolePerson } from '../../lib/person.ts';
import type { SoleLinkProps } from '../../lib/sole-provider.tsx';
import { ColumnHeader } from './column-header.tsx';
import { FilterChip, RemovableChip, SearchField, ViewSwitch } from './filters.tsx';
import type { BoardView } from './filters.tsx';
import { ListCard, PageHeader, PropertyRow, SectionAction, SectionCard, SectionLabel, TableHeader } from './layout.tsx';
import { SubNav, SubNavItem } from './nav.tsx';
import { PersonCell, Table, TableCell, TableRow } from './table.tsx';

const ava: SolePerson = { id: 'p-ava', name: 'Ava Thompson' };
const noah: SolePerson = { id: 'p-noah', name: 'Noah Patel' };
const mia: SolePerson = { id: 'p-mia', name: 'Mia Rossi' };
const leo: SolePerson = { id: 'p-leo', name: 'Leo Nguyen' };

function ViewHarness() {
  const [view, setView] = useState<BoardView>('list');
  return <ViewSwitch value={view} onChange={setView} />;
}

describe('page parts', () => {
  it('draws the header, section label and cards with their words', () => {
    renderUi(
      <>
        <PageHeader title="People" description="Everyone who can sign in." actions={<button type="button">Invite someone</button>} />
        <SectionLabel count={2} action={<SectionAction>Show resolved</SectionAction>}>
          Comments
        </SectionLabel>
        <SectionCard title="Allowed domains" description="Anyone with one of these can sign in." actions={<button type="button">Add domain</button>}>
          <p>The body</p>
        </SectionCard>
        <ListCard title="My work" count="9 open" meta="Assigned to you, not done" footer={<a href="#all">See all work</a>}>
          <div>row</div>
        </ListCard>
        <TableHeader columns={['Person', 'Access', { id: 'menu' }]} />
      </>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'People' })).toBeInTheDocument();
    expect(screen.getByText('Everyone who can sign in.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invite someone' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Comments' })).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show resolved' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('heading', { name: 'Allowed domains' })).toBeInTheDocument();
    expect(screen.getByText('Anyone with one of these can sign in.')).toBeInTheDocument();
    expect(screen.getByText('The body')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'My work' })).toBeInTheDocument();
    expect(screen.getByText('9 open')).toBeInTheDocument();
    expect(screen.getByText('Assigned to you, not done')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See all work' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });

  it('lets the heading levels be chosen, and leaves empty slots out', () => {
    const { container } = renderUi(
      <>
        <PageHeader title="Settings" as="h2" />
        <SectionLabel as="h3">Folders</SectionLabel>
        <SectionLabel as="div">Spaces</SectionLabel>
        <SectionCard title="Empty card" />
      </>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Folders' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Spaces' })).toBeNull();
    // No description, actions, count or body: none of their wrappers are drawn.
    expect(container.querySelector('header p')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Empty card' }).closest('section')?.children).toHaveLength(1);
  });

  it('draws the property row with its label and value, and the whole label on hover', () => {
    renderUi(
      <PropertyRow label="Follow-up reminder" title="Follow-up reminder for the account owner">
        <span>Fri 2 Oct</span>
      </PropertyRow>,
    );
    expect(screen.getByText('Follow-up reminder')).toHaveAttribute('title', 'Follow-up reminder for the account owner');
    expect(screen.getByText('Fri 2 Oct')).toBeInTheDocument();
  });

  it('puts the property row icon before its label, decorative, in the label column', () => {
    renderUi(
      <>
        <PropertyRow label="Email" icon={<Mail data-testid="icon" />}>
          <span>ava@example.com</span>
        </PropertyRow>
        <PropertyRow label="Phone">
          <span>0400 000 000</span>
        </PropertyRow>
      </>,
    );
    const icon = screen.getByTestId('icon');
    const label = screen.getByText('Email');
    // The icon comes first in the document, inside the same cell as the label, and is hidden from screen readers.
    expect(icon.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(icon.closest('span[aria-hidden="true"]')).not.toBeNull();
    expect(label.parentElement).toContainElement(icon);
    expect(label.parentElement).toHaveClass('w-24');
    // Without an icon the label is the cell itself, cut to the column as before.
    expect(screen.getByText('Phone')).toHaveClass('w-24', 'truncate');
    expect(screen.getByText('Phone').querySelector('svg')).toBeNull();
  });
});

describe('table', () => {
  it('lays out a table of people as a table, header and rows alike', () => {
    renderUi(
      <Table label="People">
        <TableHeader columns={['Name', 'Email', 'Open work']} className="grid-cols-[1fr_236px_90px]" />
        <TableRow className="grid-cols-[1fr_236px_90px]">
          <TableCell>
            <PersonCell person={ava} admin detail="Founder" />
          </TableCell>
          <TableCell>ava@example.com</TableCell>
          <TableCell>9</TableCell>
        </TableRow>
        <TableRow className="grid-cols-[1fr_236px_90px]">
          <TableCell>
            <PersonCell person={noah} detail="noah@example.com" />
          </TableCell>
          <TableCell>noah@example.com</TableCell>
          <TableCell>3</TableCell>
        </TableRow>
      </Table>,
    );
    const table = screen.getByRole('table', { name: 'People' });
    expect(table).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Name', 'Email', 'Open work']);
    const [first] = screen.getAllByRole('cell');
    expect(first).toHaveTextContent('Ava Thompson');
    expect(first).toHaveTextContent('Admin');
    expect(first).toHaveTextContent('Founder');
  });

  it('draws the person cell: name, admin pill, detail, muted and a replaced name', () => {
    const { container } = renderUi(
      <>
        <PersonCell person={ava} admin detail="Founder" />
        <PersonCell person={mia} muted detail="mia@example.com" />
        <PersonCell person={leo} name={<a href="/people/p-leo">Leo N.</a>} />
      </>,
    );
    expect(screen.getByText('Admin').closest('[data-pill]')).toHaveAttribute('data-pill', 'neutral');
    expect(screen.getAllByText('Admin')).toHaveLength(1);
    expect(screen.getByText('Mia Rossi')).toHaveClass('text-subtle-foreground');
    expect(screen.getByText('Ava Thompson')).toHaveClass('text-foreground');
    expect(screen.getByText('mia@example.com')).toBeInTheDocument();
    // The name prop stands in for the plain name.
    expect(screen.getByRole('link', { name: 'Leo N.' })).toHaveAttribute('href', '/people/p-leo');
    expect(screen.queryByText('Leo Nguyen')).toBeNull();
    // One avatar each.
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(3);
  });

  it('keeps the attributes a screen gives a row, and names the table from its label', () => {
    renderUi(
      <Table label="People" data-testid="people-table">
        <TableRow data-person-row="p-ava" className="min-h-14">
          <TableCell>Ava Thompson</TableCell>
        </TableRow>
      </Table>,
    );
    expect(screen.getByRole('table', { name: 'People' })).toHaveAttribute('data-testid', 'people-table');
    expect(screen.getByRole('row')).toHaveAttribute('data-person-row', 'p-ava');
    expect(screen.getByRole('row')).toHaveClass('min-h-14');
    expect(screen.getByRole('row')).not.toHaveClass('min-h-[52px]');
  });
});

describe('filters and switches', () => {
  it('clears an active filter chip with its x, and the chip itself opens the picker', async () => {
    const onClear = vi.fn<() => void>();
    const onClick = vi.fn<() => void>();
    renderUi(<FilterChip label="Assignee: Ava" active onClear={onClear} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'Assignee: Ava' }));
    expect(onClick).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Clear Assignee: Ava' }));
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Assignee: Ava' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows no x on a chip that is not active, and names the x from clearLabel', () => {
    const { container, rerender } = renderUi(<FilterChip label="State" onClear={() => {}} />);
    expect(screen.getByRole('button', { name: 'State' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(container.querySelector('[data-filter-chip]')).toHaveAttribute('data-filter-chip', 'default');
    rerender(<FilterChip label={<em>State</em>} active onClear={() => {}} clearLabel="Clear the state filter" />);
    expect(screen.getByRole('button', { name: 'Clear the state filter' })).toBeInTheDocument();
  });

  it('switches between List and Kanban by click and with the arrow keys', async () => {
    renderUi(<ViewHarness />);
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(screen.getByRole('radio', { name: 'Kanban' }));
    expect(screen.getByRole('radio', { name: 'Kanban' })).toHaveAttribute('aria-checked', 'true');
    screen.getByRole('radio', { name: 'Kanban' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
    // The keyboard goes with the choice, as in any radio group.
    expect(screen.getByRole('radio', { name: 'List' })).toHaveFocus();
  });

  it('does not call onChange for the view that is already chosen', async () => {
    const onChange = vi.fn<(view: BoardView) => void>();
    renderUi(<ViewSwitch value="kanban" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Kanban' }));
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('radio', { name: 'List' }));
    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('removes a removable chip', async () => {
    const onRemove = vi.fn<() => void>();
    renderUi(
      <RemovableChip onRemove={onRemove} removeLabel="Remove @example.com">
        @example.com
      </RemovableChip>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove @example.com' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('shows the / hint in the search field and forwards the ref', () => {
    let input: HTMLInputElement | null = null;
    renderUi(<SearchField placeholder="Search pages" ref={(el) => void (input = el)} />);
    expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Search pages');
    expect(screen.getByText('/')).toBeInTheDocument();
    act(() => input?.focus());
    expect(screen.getByRole('searchbox')).toHaveFocus();
  });

  it('can show another hint or none in the search field', () => {
    const { rerender } = renderUi(<SearchField aria-label="Search people" shortcut="mod" />);
    expect(screen.getByText(/Cmd|Ctrl/)).toBeInTheDocument();
    rerender(<SearchField aria-label="Search people" shortcut={null} />);
    expect(screen.queryByText('/')).toBeNull();
    expect(screen.queryByText(/Cmd|Ctrl/)).toBeNull();
  });
});

describe('sub-navigation', () => {
  it('marks the active button item with aria-pressed, and shows its count', async () => {
    const pick = vi.fn<() => void>();
    renderUi(
      <SubNav label="Folders">
        <SubNavItem label="Payroll" count={12} active onClick={pick} />
        <SubNavItem label="Invoices" count={3} active={false} />
        <SubNavItem label="Unfiled" />
      </SubNav>,
    );
    expect(screen.getByRole('navigation', { name: 'Folders' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Payroll/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Invoices/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Unfiled' })).not.toHaveAttribute('aria-pressed');
    expect(screen.getByRole('button', { name: /Payroll/ })).toHaveTextContent('12');
    await userEvent.click(screen.getByRole('button', { name: /Payroll/ }));
    expect(pick).toHaveBeenCalledOnce();
  });

  it('marks the current link with aria-current, and only when the caller says so', () => {
    renderUi(
      <SubNav>
        <SubNavItem label="Profile" href="/settings/profile" active />
        <SubNavItem label="Password" href="/settings/password" active={false} />
        <SubNavItem label="Access" href="/settings/access" />
      </SubNav>,
    );
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/settings/profile');
    expect(screen.getByRole('link', { name: 'Password' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Access' })).not.toHaveAttribute('aria-current');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('draws a link through the provider\'s link component', async () => {
    const RouterLink = forwardRef<HTMLAnchorElement, SoleLinkProps>(function RouterLink({ href, ...props }, ref) {
      return <a ref={ref} data-router-link="" href={`/app${href}`} {...props} />;
    });
    const onClick = vi.fn<() => void>();
    renderUi(<SubNavItem label="Profile" icon={<Mail />} count={2} href="/settings/profile" active onClick={onClick} />, { provider: { linkComponent: RouterLink } });
    const link = screen.getByRole('link', { name: /Profile/ });
    expect(link).toHaveAttribute('data-router-link');
    expect(link).toHaveAttribute('href', '/app/settings/profile');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveTextContent('2');
    expect(link.querySelector('svg')).not.toBeNull();
    link.addEventListener('click', (e) => e.preventDefault());
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('column header', () => {
  it('shows the icon, name and count, and names the + button "Add to <name>" by default', async () => {
    const onAdd = vi.fn<() => void>();
    renderUi(<ColumnHeader name="Todo" count={3} icon={<Mail data-testid="column-icon" />} onAdd={onAdd} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Todo' })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByTestId('column-icon')).toBeInTheDocument();
    const add = screen.getByRole('button', { name: 'Add to Todo' });
    expect(add).toHaveAttribute('title', 'Add to Todo');
    await userEvent.click(add);
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('takes its own add label', () => {
    renderUi(<ColumnHeader name="In progress" addLabel="New work item in In progress" onAdd={() => {}} />);
    const add = screen.getByRole('button', { name: 'New work item in In progress' });
    expect(add).toHaveAttribute('title', 'New work item in In progress');
    expect(screen.queryByRole('button', { name: 'Add to In progress' })).toBeNull();
  });

  it('has no add button without onAdd, and no count without a count', () => {
    renderUi(<ColumnHeader name="Done" addLabel="Add a thing" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Done' }).parentElement?.children).toHaveLength(1);
  });
});

type RefCallback = (el: HTMLElement | null) => void;

const REF_PARTS: Array<[name: string, make: (ref: RefCallback) => ReactElement, tag: string]> = [
  ['PageHeader', (ref) => <PageHeader ref={ref} title="People" />, 'HEADER'],
  ['SectionLabel', (ref) => <SectionLabel ref={ref}>Comments</SectionLabel>, 'DIV'],
  ['SectionAction', (ref) => <SectionAction ref={ref}>Show resolved</SectionAction>, 'BUTTON'],
  ['SectionCard', (ref) => <SectionCard ref={ref} title="Allowed domains" />, 'SECTION'],
  ['ListCard', (ref) => <ListCard ref={ref} title="My work"><div>row</div></ListCard>, 'SECTION'],
  ['PropertyRow', (ref) => <PropertyRow ref={ref} label="Email"><span>ava@example.com</span></PropertyRow>, 'DIV'],
  ['TableHeader', (ref) => <TableHeader ref={ref} columns={['Name']} />, 'DIV'],
  ['Table', (ref) => <Table ref={ref} label="People" />, 'DIV'],
  ['TableRow', (ref) => <TableRow ref={ref} />, 'DIV'],
  ['TableCell', (ref) => <TableCell ref={ref} />, 'DIV'],
  ['PersonCell', (ref) => <PersonCell ref={ref} person={ava} />, 'DIV'],
  ['FilterChip', (ref) => <FilterChip ref={ref} label="State" />, 'BUTTON'],
  ['RemovableChip', (ref) => <RemovableChip ref={ref} onRemove={() => {}} removeLabel="Remove">@example.com</RemovableChip>, 'SPAN'],
  ['SearchField', (ref) => <SearchField ref={ref} aria-label="Search" />, 'INPUT'],
  ['ViewSwitch', (ref) => <ViewSwitch ref={ref} value="list" onChange={() => {}} />, 'DIV'],
  ['SubNav', (ref) => <SubNav ref={ref}><SubNavItem label="Profile" /></SubNav>, 'NAV'],
  ['SubNavItem (link)', (ref) => <SubNavItem ref={ref} label="Profile" href="/settings/profile" />, 'A'],
  ['SubNavItem (button)', (ref) => <SubNavItem ref={ref} label="Profile" />, 'BUTTON'],
  ['ColumnHeader', (ref) => <ColumnHeader ref={ref} name="Todo" />, 'DIV'],
];

describe('refs', () => {
  it.each(REF_PARTS)('%s forwards its ref', (_name, make, tag) => {
    let node: HTMLElement | null = null;
    renderUi(
      make((el) => {
        node = el;
      }),
    );
    expect(node).toBeInstanceOf(HTMLElement);
    expect((node as HTMLElement | null)?.tagName).toBe(tag);
  });
});
