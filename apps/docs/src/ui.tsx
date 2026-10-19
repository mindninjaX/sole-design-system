import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

// The small set of building blocks every docs page is written with. Pages import from here
// and from '@sole-ui/react'; nothing else is needed to write one.

/** A code block with a Copy button at its top right. `code` is shown exactly as written. */
export function CodeBlock({ code, title, lang }: { code: string; title?: string; lang?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copy = () => {
    const done = (next: 'copied' | 'failed') => {
      setState(next);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setState('idle'), 2000);
    };
    if (!navigator.clipboard) return done('failed');
    navigator.clipboard.writeText(code).then(
      () => done('copied'),
      () => done('failed'),
    );
  };
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {(title || lang) && (
        <div className="flex h-8 items-center justify-between border-b border-hairline bg-background px-3 text-label text-muted-foreground">
          <span>{title}</span>
          {lang && <span className="font-mono text-micro">{lang}</span>}
        </div>
      )}
      <div className="relative">
        <pre className={`px-4 py-3 pr-20 font-mono text-[12.5px] leading-5 text-foreground ${lang === 'text' ? 'max-h-[560px] overflow-y-auto whitespace-pre-wrap break-words' : 'overflow-x-auto whitespace-pre'}`}>{code}</pre>
        <button
          type="button"
          onClick={copy}
          aria-label={title ? `Copy ${title}` : 'Copy code'}
          className="absolute top-2 right-2 h-6 rounded-md border border-border bg-card px-2 text-label font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none"
        >
          {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

/** A note set apart from the text: tone `info` (blue) or `warning` (amber). */
export function Callout({ title, children, tone = 'info' }: { title?: string; children: ReactNode; tone?: 'info' | 'warning' }) {
  const colours = tone === 'warning' ? 'border-warning/40 bg-warning-soft text-warning-text' : 'border-border bg-accent text-accent-foreground';
  return (
    <div className={`my-4 rounded-lg border px-4 py-3 text-body ${colours}`}>
      {title && <div className="mb-0.5 text-strong">{title}</div>}
      <div>{children}</div>
    </div>
  );
}

export function H2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mt-10 mb-2 scroll-mt-20 text-title">
      {children}
    </h2>
  );
}

export function H3({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3 id={id} className="mt-6 mb-1 scroll-mt-20 text-strong">
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="my-2 max-w-[680px] text-read text-foreground">{children}</p>;
}

/** Inline code. */
export function Code({ children }: { children: ReactNode }) {
  return <code>{children}</code>;
}

/** Numbered steps: each child is a step's content, the title is the step's heading. */
export function Steps({ steps }: { steps: Array<{ title: string; body: ReactNode }> }) {
  return (
    <ol className="my-4 space-y-6">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-label font-semibold text-primary-foreground">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="text-strong">{step.title}</div>
            {step.body}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** A simple table: `head` is the column titles, `rows` the cells. */
export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full border-collapse text-left text-body">
        <thead className="bg-background text-label text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="h-8 border-b border-border px-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-hairline last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
