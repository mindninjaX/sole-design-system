import { Button, Pill } from '@sole-ui/react';
import { WorkItemRow } from '@sole-ui/react/hq';
import type { WorkItemSummary } from '@sole-ui/react/hq';
import { ArrowRight } from 'lucide-react';
import { ava, grace, leo, mia, noah } from './demo/people.ts';
import { CodeBlock } from './ui.tsx';

const items: WorkItemSummary[] = [
  {
    key: 'ENG-14',
    href: '#/components/work-item-row',
    title: 'Reconcile the September ledger',
    priority: 'high',
    state: { name: 'In review', group: 'started' },
    labels: [
      { id: 'l-finance', name: 'Finance', hue: 'teal' },
      { id: 'l-month-end', name: 'Month end', hue: 'violet' },
    ],
    dueDate: '2026-10-02',
    assignees: [ava, noah, mia],
    isDone: false,
  },
  {
    key: 'ENG-11',
    href: '#/components/work-item-row',
    title: 'Chase the missing super statements',
    priority: 'urgent',
    state: { name: 'Todo', group: 'unstarted' },
    labels: [{ id: 'l-audit', name: 'Audit', hue: 'amber' }],
    dueDate: '2026-09-22',
    assignees: [grace],
    isDone: false,
  },
  {
    key: 'ENG-15',
    href: '#/components/work-item-row',
    title: 'Draft the payroll cut-off notice',
    priority: 'medium',
    state: { name: 'Backlog', group: 'backlog' },
    labels: [],
    dueDate: null,
    assignees: [],
    isDone: false,
  },
  {
    key: 'ENG-9',
    href: '#/components/work-item-row',
    title: 'Archive the August timesheets',
    priority: 'low',
    state: { name: 'Done', group: 'completed' },
    labels: [],
    dueDate: '2026-09-26',
    assignees: [leo],
    isDone: true,
  },
];

/** The home page's opening: what it is, where to start, and the parts doing the talking. */
export function Hero() {
  return (
    <section className="pb-2">
      <Pill tone="info">v0.2.1 · Sole HQ</Pill>
      <h1 className="mt-3 max-w-[640px] text-[34px] leading-[40px] font-bold tracking-[-0.02em]">The design system behind Sole HQ</h1>
      <p className="mt-3 max-w-[620px] text-[16px] leading-[26px] text-muted-foreground">
        One look, shipped as React parts. Install from npm, wrap the app once, and build screens that look and behave like Sole HQ.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button size="lg" asChild>
          <a href="#/quick-start">
            Quick start
            <ArrowRight aria-hidden="true" />
          </a>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <a href="#/components">Browse components</a>
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <a href="#/ai-agent">Use with an AI agent</a>
        </Button>
      </div>
      <div className="max-w-[460px]">
        <CodeBlock code="npm install @sole-ui/react radix-ui" lang="sh" />
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex h-9 items-center justify-between border-b border-hairline bg-background px-4 text-label text-muted-foreground">
          <span>Live preview: made from the parts in this system</span>
          <span className="font-mono text-label">@sole-ui/react/hq</span>
        </div>
        <div>
          {items.map((item) => (
            <WorkItemRow key={item.key} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
