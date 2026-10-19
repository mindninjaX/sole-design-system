import { CommandPalette, Kbd, Pill, SoleMark, SoleProvider, Toaster } from '@sole-ui/react';
import { ArrowRight, GitBranch, Package } from 'lucide-react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { NOW } from './demo/people.ts';
import type { DocSection } from './doc.tsx';
import { Colour, Motion, RadiusElevation, Typography } from './pages/foundations.tsx';
import { AiAgent, Overview, QuickStart } from './pages/get-started.tsx';
import { Hero } from './hero.tsx';
import { DEFAULT_ICON, PAGE_ICONS } from './nav-icons.ts';
import { CodeBlock, H2 } from './ui.tsx';

const VERSION = '0.2.0';
const REPO = 'https://github.com/mindninjaX/sole-design-system';
const NPM = 'https://www.npmjs.com/package/@sole-ui/react';

// Every file in sections/ exports `sections`. Adding a part to the site is adding it there.
const modules = import.meta.glob<{ sections: DocSection[] }>('./sections/*.tsx', { eager: true });
const sections = Object.values(modules)
  .flatMap((m) => m.sections)
  .sort((a, b) => a.title.localeCompare(b.title));

type NavGroup = 'Get started' | 'Foundations' | 'Shared' | 'Sole' | 'Shell' | 'HQ';

interface PageDef {
  path: string;
  title: string;
  summary: string;
  nav: NavGroup;
  /** The sidebar's top-level heading this page sits under. */
  area: 'Get started' | 'Foundations' | 'Components';
  body: () => ReactNode;
}

const GROUP_NOTE: Record<DocSection['group'], string> = {
  Shared: "shadcn parts with Sole HQ's look: buttons, inputs, dialogs, menus, tabs and toasts.",
  Sole: "Sole's own parts, used across the app: avatars, pills, tables, filters, fields and states.",
  Shell: 'The app frame: sidebar, top bar, breadcrumbs and the command palette.',
  HQ: 'Parts only Sole HQ uses: work items, states, priorities, boards, comments and the inbox.',
};

const staticPages: PageDef[] = [
  {
    path: '/',
    title: 'Overview',
    summary: 'The design system behind Sole HQ: one look, as parts you install from npm.',
    nav: 'Get started',
    area: 'Get started',
    body: () => <Overview />,
  },
  {
    path: '/quick-start',
    title: 'Quick start',
    summary: 'Install the package, add the styles and render your first part in five minutes.',
    nav: 'Get started',
    area: 'Get started',
    body: () => <QuickStart />,
  },
  {
    path: '/ai-agent',
    title: 'Use with an AI agent',
    summary: 'One prompt that lets any AI agent set up the package and build with the right parts.',
    nav: 'Get started',
    area: 'Get started',
    body: () => <AiAgent />,
  },
  {
    path: '/foundations/colour',
    title: 'Colour',
    summary: 'Every colour token, the label hues and the rules for using them.',
    nav: 'Foundations',
    area: 'Foundations',
    body: () => <Colour />,
  },
  {
    path: '/foundations/typography',
    title: 'Typography',
    summary: 'Inter Variable and the nine text styles, from 11px labels to the page title.',
    nav: 'Foundations',
    area: 'Foundations',
    body: () => <Typography />,
  },
  {
    path: '/foundations/radius-and-elevation',
    title: 'Radius and elevation',
    summary: 'One base radius, two elevations and a focus ring.',
    nav: 'Foundations',
    area: 'Foundations',
    body: () => <RadiusElevation />,
  },
  {
    path: '/foundations/motion',
    title: 'Motion',
    summary: 'Quick colour changes, softly settling panels, and nothing for people who ask for less.',
    nav: 'Foundations',
    area: 'Foundations',
    body: () => <Motion />,
  },
];

function ComponentsIndex() {
  const groups: DocSection['group'][] = ['Shared', 'Sole', 'Shell', 'HQ'];
  return (
    <div>
      {groups.map((group) => {
        const items = sections.filter((s) => s.group === group);
        return (
          <div key={group}>
            <H2>{group === 'HQ' ? 'Sole HQ' : group}</H2>
            <p className="mb-3 max-w-[640px] text-body text-muted-foreground">{GROUP_NOTE[group]}</p>
            <div className="grid grid-cols-2 gap-3">
              {items.map((s) => (
                <a
                  key={s.id}
                  href={`#/components/${s.id}`}
                  className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none"
                >
                  <div className="flex items-center gap-2 text-strong">
                    {(() => {
                      const Icon = PAGE_ICONS[s.id] ?? DEFAULT_ICON;
                      return <Icon aria-hidden="true" size={15} strokeWidth={1.8} className="shrink-0 text-muted-foreground" />;
                    })()}
                    {s.title}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-label text-muted-foreground">{s.summary}</div>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const componentPages: PageDef[] = sections.map((s) => ({
  path: `/components/${s.id}`,
  title: s.title,
  summary: s.summary,
  nav: s.group,
  area: 'Components' as const,
  body: () => (
    <div>
      {s.importLine && <CodeBlock code={s.importLine} title="Import" lang="tsx" />}
      <H2>Examples</H2>
      {s.render()}
    </div>
  ),
}));

const indexPage: PageDef = {
  path: '/components',
  title: 'Components',
  summary: `${sections.length} parts, each with every variant and state live. Pick one from the sidebar or here.`,
  nav: 'Shared',
  area: 'Components',
  body: () => <ComponentsIndex />,
};

const pages: PageDef[] = [...staticPages, indexPage, ...componentPages];

/** A page's icon: by path for the fixed pages, by part id for the components. */
const iconFor = (p: PageDef) => PAGE_ICONS[p.path] ?? PAGE_ICONS[p.path.replace('/components/', '')] ?? DEFAULT_ICON;
/** Prev and next follow the sidebar's order. */
const ordered: PageDef[] = [...staticPages, ...componentPages];

// ---------------------------------------------------------------- hash routing
// GitHub Pages cannot rewrite deep links, so pages live after the #.

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}
const currentPath = () => window.location.hash.replace(/^#/, '') || '/';

function usePath(): string {
  return useSyncExternalStore(subscribe, currentPath, () => '/');
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// ---------------------------------------------------------------- shell

function Sidebar({ path, filter, onFilter }: { path: string; filter: string; onFilter: (value: string) => void }) {
  const term = filter.trim().toLowerCase();
  const visible = (p: PageDef) => term === '' || p.title.toLowerCase().includes(term);
  const link = (p: PageDef) => {
    const active = p.path === path;
    const Icon = iconFor(p);
    return (
      <a
        key={p.path}
        href={`#${p.path}`}
        aria-current={active ? 'page' : undefined}
        className={`flex h-7 items-center gap-2 rounded-md px-2.5 text-body transition-colors duration-[120ms] hover:bg-sidebar-hover focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none ${
          active ? 'bg-accent font-medium text-accent-foreground hover:bg-accent' : 'text-sidebar-foreground'
        }`}
      >
        <Icon aria-hidden="true" size={15} strokeWidth={1.8} className={`shrink-0 ${active ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
        <span className="truncate">{p.title}</span>
      </a>
    );
  };
  const heading = (text: string) => <div className="px-2.5 pt-4 pb-1 text-micro text-subtle-foreground">{text}</div>;
  const subHeading = (text: string) => (
    <div className="mt-3 mb-1 flex items-center gap-2 px-2.5 text-label font-semibold text-foreground">
      {text}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
  const areas: Array<{ area: PageDef['area']; groups: NavGroup[] }> = [
    { area: 'Get started', groups: ['Get started'] },
    { area: 'Foundations', groups: ['Foundations'] },
    { area: 'Components', groups: ['Shared', 'Sole', 'Shell', 'HQ'] },
  ];
  return (
    <nav aria-label="Documentation" className="sticky top-12 h-[calc(100vh-3rem)] w-64 shrink-0 overflow-y-auto border-r border-border bg-sidebar px-3 pb-8">
      <div className="pt-3">
        <input
          type="search"
          value={filter}
          onChange={(e) => onFilter(e.target.value)}
          placeholder="Filter pages"
          aria-label="Filter pages"
          className="h-8 w-full rounded-lg border border-border bg-card px-2.5 text-body outline-none placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:shadow-[var(--focus-ring)]"
        />
      </div>
      {areas.map(({ area, groups }) => {
        const blocks = groups
          .map((g) => ({ g, items: pages.filter((p) => p.nav === g && p.area === area && p.path !== '/components' && visible(p)) }))
          .filter((b) => b.items.length > 0);
        if (blocks.length === 0) return null;
        return (
          <div key={area}>
            {area === 'Components' ? (
              <a href="#/components" className="block px-2.5 pt-4 pb-1 text-micro text-subtle-foreground hover:text-foreground">
                {area}
              </a>
            ) : (
              heading(area)
            )}
            {blocks.map(({ g, items }) => (
              <div key={g}>
                {area === 'Components' && subHeading(g === 'HQ' ? 'Sole HQ' : g)}
                {items.map(link)}
              </div>
            ))}
          </div>
        );
      })}
    </nav>
  );
}

function TopBar({ onSearch }: { onSearch: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-card px-4">
      <a href="#/" className="flex items-center gap-2 rounded-md text-strong focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none">
        <SoleMark size={20} alt="" />
        Sole design system
      </a>
      <Pill tone="neutral">v{VERSION}</Pill>
      <div className="flex-1" />
      <button
        type="button"
        onClick={onSearch}
        className="flex h-8 w-72 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-body text-subtle-foreground transition-colors hover:border-primary focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none"
      >
        <span className="flex-1 text-left">Search the docs</span>
        <Kbd keys={['Cmd', 'K']} />
      </button>
      <a href={NPM} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-body text-muted-foreground transition-colors hover:text-foreground">
        <Package aria-hidden="true" size={15} strokeWidth={1.8} />
        npm
      </a>
      <a href={REPO} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-body text-muted-foreground transition-colors hover:text-foreground">
        <GitBranch aria-hidden="true" size={15} strokeWidth={1.8} />
        GitHub
      </a>
    </header>
  );
}

function OnThisPage({ items }: { items: Array<{ id: string; text: string }> }) {
  if (items.length < 2) return <div className="hidden w-52 shrink-0 xl:block" />;
  return (
    <aside aria-label="On this page" className="sticky top-12 hidden h-fit w-52 shrink-0 self-start px-4 pt-10 xl:block">
      <div className="mb-2 text-micro text-subtle-foreground">On this page</div>
      <ul className="space-y-1.5 border-l border-border">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="-ml-px block w-full border-l border-transparent pl-3 text-left text-label text-muted-foreground hover:border-primary hover:text-foreground"
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function PageView({ page }: { page: PageDef }) {
  const index = ordered.findIndex((p) => p.path === page.path);
  const prev = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 ? ordered[index + 1] : undefined;
  const [toc, setToc] = useState<Array<{ id: string; text: string }>>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      page.path === '/'
        ? 'Sole design system · Components for Sole HQ'
        : page.path === '/components'
          ? 'Components · Sole design system'
          : `${page.title} · ${page.area === 'Get started' ? 'Get started' : page.area} · Sole design system`;
    const headings = [...document.querySelectorAll<HTMLElement>('article h2')];
    setToc(
      headings.map((h) => {
        if (!h.id) h.id = slug(h.textContent ?? '');
        return { id: h.id, text: h.textContent ?? '' };
      }),
    );
  }, [page]);

  const crumb = page.area === 'Components' && page.path !== '/components' ? ['Components', page.nav === 'HQ' ? 'Sole HQ' : page.nav] : [page.area];
  return (
    <div className="flex min-w-0 flex-1">
      <main className="min-w-0 flex-1 px-10 pt-8 pb-16">
        <article className="mx-auto max-w-[820px]">
          {page.path === '/' ? (
            <Hero />
          ) : (
            <>
              <div className="mb-2 flex items-center gap-1.5 text-label text-subtle-foreground">
                {crumb.map((c, i) => (
                  <span key={c} className="flex items-center gap-1.5">
                    {i > 0 && <span aria-hidden="true">/</span>}
                    {c}
                  </span>
                ))}
              </div>
              <h1 className="text-[26px] leading-8 font-bold tracking-[-0.02em]">{page.title}</h1>
              <p className="mt-1.5 mb-8 max-w-[640px] text-read text-muted-foreground">{page.summary}</p>
            </>
          )}
          {page.body()}
        </article>
        <nav aria-label="Previous and next" className="mx-auto mt-16 flex max-w-[820px] justify-between gap-4 border-t border-border pt-6">
          {prev ? (
            <a href={`#${prev.path}`} className="rounded-lg border border-border bg-card px-4 py-3 hover:border-primary">
              <div className="text-label text-subtle-foreground">Previous</div>
              <div className="text-strong">{prev.title}</div>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a href={`#${next.path}`} className="rounded-lg border border-border bg-card px-4 py-3 text-right hover:border-primary">
              <div className="text-label text-subtle-foreground">Next</div>
              <div className="flex items-center justify-end gap-1.5 text-strong">
                {next.title}
                <ArrowRight aria-hidden="true" size={14} strokeWidth={1.8} />
              </div>
            </a>
          ) : (
            <span />
          )}
        </nav>
        <footer className="mx-auto mt-10 max-w-[820px] text-label text-subtle-foreground">
          @sole-ui/react {VERSION} · Light mode and desktop only ·{' '}
          <a href={REPO} className="text-link hover:underline">
            Source on GitHub
          </a>
          {' · '}
          <a href="tokens.css" download className="text-link hover:underline">
            tokens.css
          </a>
          {' · '}
          <a href="tokens.json" download className="text-link hover:underline">
            tokens.json
          </a>
          {' · '}
          <a href="llms.txt" className="text-link hover:underline">
            llms.txt
          </a>
        </footer>
      </main>
      <OnThisPage items={toc} />
    </div>
  );
}

export function App() {
  const path = usePath();
  const [filter, setFilter] = useState('');
  const [searching, setSearching] = useState(false);
  const page = pages.find((p) => p.path === path) ?? pages[0]!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearching((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const groups = useMemo(
    () =>
      [
        { heading: 'Get started', items: staticPages.filter((p) => p.area === 'Get started') },
        { heading: 'Foundations', items: staticPages.filter((p) => p.area === 'Foundations') },
        { heading: 'Components', items: [indexPage, ...componentPages] },
      ].map((g) => ({
        heading: g.heading,
        items: g.items.map((p) => ({
          id: p.path,
          label: p.title,
          onSelect: () => {
            window.location.hash = p.path;
          },
        })),
      })),
    [],
  );

  return (
    <SoleProvider now={() => NOW} timeZone="Australia/Sydney">
      <TopBar onSearch={() => setSearching(true)} />
      <div className="flex min-h-[calc(100vh-3rem)]">
        <Sidebar path={path} filter={filter} onFilter={setFilter} />
        <PageView key={page.path} page={page} />
      </div>
      <CommandPalette groups={groups} open={searching} onOpenChange={setSearching} placeholder="Search pages and components" title="Search the docs" />
      <Toaster />
    </SoleProvider>
  );
}
