import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { tokens } from '@sole-ui/react';
import { Callout, CodeBlock, Code, H2, H3, P, Table } from '../ui.tsx';

// Foundations pages: colour, type, radius and elevation, motion. Every value shown here is read from
// the token tree, so the page cannot drift from the package.

interface Value {
  readonly $value: string;
}

/** A small label above a value, shared by every spec grid on these pages. */
function Spec({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-baseline gap-2 text-label">
      <span className="w-12 shrink-0 text-subtle-foreground">{label}</span>
      <span className="min-w-0 break-words font-mono text-[11.5px] text-muted-foreground">{children}</span>
    </div>
  );
}

const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3';

// ---------------------------------------------------------------------------------------------
// Colour
// ---------------------------------------------------------------------------------------------

interface ColourGroup {
  title: string;
  note: string;
  test: (name: string) => boolean;
}

// Order matters: the first group that matches a name takes it, so `sidebar-accent` lands in
// Sidebar and not in Action and focus.
const COLOUR_GROUPS: ColourGroup[] = [
  { title: 'Sidebar', note: 'The navigation rail. It has its own hover and selected colours so it can sit on a different surface.', test: (n) => n.startsWith('sidebar') },
  { title: 'Tooltip and mark', note: 'The inverted tooltip surface, and the brand mark colour.', test: (n) => n.startsWith('tooltip') || n === 'mark' },
  { title: 'State icons', note: 'One colour for each work state group.', test: (n) => n.startsWith('state-') },
  { title: 'Sticky notes', note: 'Pastel fills for sticky notes, with one dark text colour for all of them.', test: (n) => n.startsWith('sticky-') },
  { title: 'Action and focus', note: 'Buttons, links, selection and the focus ring.', test: (n) => /^(primary|brand|link|accent|ring)/.test(n) },
  { title: 'Status', note: 'Danger, warning, success and overdue. Each has a solid colour, a text colour, a soft fill and a border.', test: (n) => /^(destructive|danger|warning|success|overdue)/.test(n) },
];

const SURFACE: ColourGroup = {
  title: 'Surface and text',
  note: 'Page, card and popover surfaces, borders, and the three text strengths.',
  test: () => true,
};

// Sticky fills are plain variables; every other colour is also a Tailwind theme colour.
const hasUtility = (name: string) => !/^sticky-(?!foreground)/.test(name);

function Swatch({ name, value }: { name: string; value: string }) {
  const utility = hasUtility(name) ? `bg-${name}` : `bg-[var(--${name})]`;
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="h-14 border-b border-border" style={{ background: `var(--${name})` }} />
      <div className="space-y-1 px-3 py-2.5">
        <div className="truncate text-body font-medium" title={name}>
          {name}
        </div>
        <Spec label="Value">{value}</Spec>
        <Spec label="Variable">{`--${name}`}</Spec>
        <Spec label="Class">{utility}</Spec>
      </div>
    </div>
  );
}

function HueCard({ hue, spec }: { hue: string; spec: { bg: Value; border: Value; fg: Value; dot: Value } }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <span
        className="inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-label"
        style={{ background: spec.bg.$value, borderColor: spec.border.$value, color: spec.fg.$value }}
      >
        <span className="size-1.5 rounded-full" style={{ background: spec.dot.$value }} />
        {hue}
      </span>
      <div className="mt-3 space-y-1">
        <Spec label="Fill">{spec.bg.$value}</Spec>
        <Spec label="Border">{spec.border.$value}</Spec>
        <Spec label="Text">{spec.fg.$value}</Spec>
        <Spec label="Dot">{spec.dot.$value}</Spec>
      </div>
    </div>
  );
}

export function Colour() {
  const entries = Object.entries(tokens.color) as Array<[string, Value]>;
  const taken = new Set<string>();
  const groups = [...COLOUR_GROUPS, SURFACE].map((group) => {
    const items = entries.filter(([name]) => !taken.has(name) && group.test(name));
    items.forEach(([name]) => taken.add(name));
    return { ...group, items };
  });
  // Present the groups in reading order, not matching order.
  const order = ['Surface and text', 'Action and focus', 'Status', 'Sidebar', 'Tooltip and mark', 'State icons', 'Sticky notes'];
  groups.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));

  return (
    <div className="max-w-[880px]">
      <P>
        Colour comes from tokens, never from a hex in a component. Each swatch shows the token, the CSS variable that carries it
        and the Tailwind class that uses it. Everything here is for the light theme.
      </P>
      <Callout title="Rules">
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          <li>Use the token classes, such as <Code>bg-primary</Code> and <Code>text-muted-foreground</Code>. Never write a hex.</li>
          <li>
            The faint colour is for dots and dividers. Never use it for words, because it does not clear the contrast needed to read.
          </li>
          <li>Pair a fill with its own text colour: <Code>primary</Code> with <Code>primary-foreground</Code>, and so on.</li>
        </ul>
      </Callout>

      {groups.map((group) => (
        <section key={group.title}>
          <H2 id={group.title.toLowerCase().replace(/[^a-z]+/g, '-')}>{group.title}</H2>
          <P>{group.note}</P>
          <div className={`${GRID} mt-4`}>
            {group.items.map(([name, token]) => (
              <Swatch key={name} name={name} value={token.$value} />
            ))}
          </div>
        </section>
      ))}

      <H2 id="label-hues">Label hues</H2>
      <P>
        Labels use twelve hues. People pick a hue name, never a hex, so a label looks the same everywhere and every pair of fill
        and text clears 7:1 contrast. Each tag takes four values from one ramp: a light fill, a border, dark text and a dot.
      </P>
      <CodeBlock lang="tsx" code={'<LabelTag hue="blue">Finance</LabelTag>'} />
      <div className={`${GRID} mt-4`}>
        {(Object.entries(tokens.hue) as Array<[string, { bg: Value; border: Value; fg: Value; dot: Value }]>).map(([hue, spec]) => (
          <HueCard key={hue} hue={hue} spec={spec} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------------------------

interface TextSpec {
  size: Value;
  'line-height': Value;
  weight?: Value;
  'letter-spacing'?: Value;
}

const TEXT_COPY: Record<string, { sample: string; use: string }> = {
  label: { sample: 'Assigned to Grace Hopper', use: 'Field labels, table headers, buttons and captions.' },
  body: { sample: 'Reconcile the September ledger before month end.', use: 'The default. Rows, forms and most interface text.' },
  strong: { sample: 'Reconcile the September ledger', use: 'Row titles and card headings.' },
  read: { sample: 'Long text is set larger, so a paragraph stays easy to read.', use: 'Paragraphs, descriptions and documentation.' },
  title: { sample: 'Month end close', use: 'Section headings.' },
  page: { sample: 'Work items', use: 'The title of a page.' },
  doc: { sample: 'Finance handbook', use: 'The title of a document.' },
  metric: { sample: '1,284', use: 'A single large number.' },
  micro: { sample: 'In review', use: 'Group labels. The only uppercase style.' },
};

function FontCard({ name, stack, sample, style }: { name: string; stack: string; sample: string; style?: CSSProperties }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card p-4">
      <div className="text-label text-muted-foreground">{name}</div>
      <div className="mt-2 text-[28px] leading-9 tracking-[-0.02em]" style={style}>
        {sample}
      </div>
      <div className="mt-3 break-words border-t border-hairline pt-3 font-mono text-[11.5px] leading-4 text-muted-foreground">{stack}</div>
    </div>
  );
}

export function Typography() {
  const styles = Object.entries(tokens.text) as Array<[string, TextSpec]>;
  return (
    <div className="max-w-[880px]">
      <P>
        One typeface, nine text styles. Body text is 13px on a 20px line, which keeps dense screens such as boards and tables
        calm. Use the style class rather than setting a size, weight or line height by hand.
      </P>

      <H2 id="typefaces">Typefaces</H2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FontCard name="Sans" stack={tokens.font.sans.$value} sample="Aa Inter Variable" style={{ fontFamily: 'var(--font-sans)' }} />
        <FontCard name="Mono" stack={tokens.font.mono.$value} sample="Aa 0123 ENG-14" style={{ fontFamily: 'var(--font-mono)', fontSize: 24 }} />
      </div>
      <P>
        Sans is the default and loads as a variable font, so every weight is available. Mono is for keys, code and
        tokens, and uses the system monospace face. Use <Code>font-mono</Code> for it.
      </P>

      <H2 id="text-styles">Text styles</H2>
      <div className="mt-4 rounded-lg border border-border bg-card px-4">
        {styles.map(([name, spec]) => {
          const copy = TEXT_COPY[name];
          const weight = spec.weight?.$value ?? '400';
          const style: CSSProperties = {
            fontSize: spec.size.$value,
            lineHeight: spec['line-height'].$value,
            fontWeight: Number(weight),
            letterSpacing: spec['letter-spacing']?.$value,
            textTransform: name === 'micro' ? 'uppercase' : undefined,
          };
          return (
            <div key={name} className="grid grid-cols-1 gap-x-8 gap-y-2 border-b border-hairline py-4 last:border-b-0 sm:grid-cols-[200px_minmax(0,1fr)]">
              <div className="min-w-0">
                <Code>{`text-${name}`}</Code>
                <div className="mt-1.5 font-mono text-[11.5px] text-muted-foreground">
                  {spec.size.$value} / {spec['line-height'].$value} / {weight}
                </div>
                {spec['letter-spacing'] && <div className="font-mono text-[11.5px] text-subtle-foreground">tracking {spec['letter-spacing'].$value}</div>}
              </div>
              <div className="min-w-0">
                <div className="truncate text-foreground" style={style}>
                  {copy?.sample ?? name}
                </div>
                {copy && <div className="mt-1.5 text-label text-subtle-foreground">{copy.use}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <Callout title="Why micro is a class, not a token">
        A design token cannot carry <Code>text-transform</Code>, so <Code>text-micro</Code> is a utility that sets uppercase
        itself. Every other style is a theme token.
      </Callout>
      <CodeBlock
        lang="tsx"
        title="Usage"
        code={`<h2 className="text-title">Month end close</h2>
<p className="text-body text-muted-foreground">Due on the 30th.</p>`}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Radius and elevation
// ---------------------------------------------------------------------------------------------

export function RadiusElevation() {
  const base = parseInt(tokens.radius.base.$value, 10);
  const steps = [
    { utility: 'rounded-xs', px: 3, rule: 'Literal 3px', use: 'Small details' },
    { utility: 'rounded-sm', px: base - 4, rule: 'Base − 4', use: 'Small details' },
    { utility: 'rounded-md', px: base - 2, rule: 'Base − 2', use: 'Chips and sidebar items' },
    { utility: 'rounded-lg', px: base, rule: 'Base', use: 'Buttons and inputs' },
    { utility: 'rounded-xl', px: base + 4, rule: 'Base + 4', use: 'Panels' },
    { utility: 'rounded-2xl', px: base + 8, rule: 'Base + 8', use: 'Dialogs' },
  ];
  const shadows = [
    { name: 'elevation-sm', variable: '--elevation-sm', utility: 'shadow-sm', note: 'Cards and code blocks resting on the page.' },
    { name: 'elevation-lg', variable: '--elevation-lg', utility: 'shadow-lg', note: 'Menus, popovers and dialogs that float above the page.' },
    { name: 'focus-ring', variable: '--focus-ring', utility: 'shadow-[var(--focus-ring)]', note: 'The keyboard focus ring, used with a ring-coloured border.' },
  ] as const;

  return (
    <div className="max-w-[880px]">
      <P>
        Radius and elevation are small and consistent. Every radius is one step from a single base, so changing{' '}
        <Code>--radius</Code> moves the whole system together.
      </P>

      <H2 id="radius">Radius</H2>
      <P>
        The base is {tokens.radius.base.$value}. Buttons and inputs use it as it is; chips go one step smaller and panels and
        dialogs one or two steps larger.
      </P>
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3 rounded-lg border border-border bg-background p-4">
        {steps.map((step) => (
          <div key={step.utility} className="min-w-0">
            <div className="h-16 border border-border bg-card" style={{ borderRadius: step.px }} />
            <div className="mt-2 font-mono text-[11.5px] text-foreground">{step.utility}</div>
            <div className="text-label text-muted-foreground">{step.px}px</div>
          </div>
        ))}
      </div>
      <Table
        head={['Class', 'Size', 'Derived from', 'Used for']}
        rows={steps.map((step) => [<Code key="c">{step.utility}</Code>, `${step.px}px`, step.rule, step.use])}
      />

      <H2 id="elevation">Elevation</H2>
      <P>
        Two shadows and a focus ring. Surfaces are separated first by a hairline border, so a shadow only says how high
        something sits.
      </P>
      <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-3">
        {shadows.map((shadow) => {
          const value = tokens.shadow[shadow.name].$value;
          const isRing = shadow.name === 'focus-ring';
          return (
            <div key={shadow.name} className="min-w-0">
              <div
                className={`h-20 rounded-xl border bg-card ${isRing ? 'border-ring' : 'border-hairline'}`}
                style={{ boxShadow: `var(${shadow.variable})` }}
              />
              <div className="mt-3 text-body font-medium">{shadow.name}</div>
              <div className="mt-0.5 text-label text-muted-foreground">{shadow.note}</div>
              <div className="mt-2 space-y-1">
                <Spec label="Class">{shadow.utility}</Spec>
                <Spec label="Value">{value}</Spec>
              </div>
            </div>
          );
        })}
      </div>
      <CodeBlock
        lang="tsx"
        title="Usage"
        code={`<div className="rounded-xl border border-border bg-card shadow-sm">...</div>
<input className="rounded-lg border focus-visible:border-ring focus-visible:shadow-[var(--focus-ring)]" />`}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------------------------

const RUN_MS = 600;

/** Reads `cubic-bezier(a, b, c, d)` into its four numbers, with the Sole curve as a fallback. */
function parseBezier(value: string): [number, number, number, number] {
  const [a, b, c, d] = value.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
  return a === undefined || b === undefined || c === undefined || d === undefined ? [0.22, 1, 0.36, 1] : [a, b, c, d];
}

function EaseCurve({ value }: { value: string }) {
  const [x1, y1, x2, y2] = parseBezier(value);
  // A 200 by 200 plot with a 20px margin: time runs left to right, progress bottom to top.
  const px = (t: number) => 20 + 160 * t;
  const py = (v: number) => 180 - 160 * v;
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`The ${value} curve: it rises steeply, then settles`} className="h-auto w-full max-w-[220px]">
      <rect x="20" y="20" width="160" height="160" fill="none" stroke="var(--border)" />
      <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(1)} stroke="var(--border)" strokeDasharray="3 3" />
      <line x1={px(0)} y1={py(0)} x2={px(x1)} y2={py(y1)} stroke="var(--faint)" />
      <line x1={px(1)} y1={py(1)} x2={px(x2)} y2={py(y2)} stroke="var(--faint)" />
      <path d={`M${px(0)},${py(0)} C${px(x1)},${py(y1)} ${px(x2)},${py(y2)} ${px(1)},${py(1)}`} fill="none" stroke="var(--primary)" strokeWidth="2" />
      <circle cx={px(0)} cy={py(0)} r="3" fill="var(--primary)" />
      <circle cx={px(1)} cy={py(1)} r="3" fill="var(--primary)" />
      <circle cx={px(x1)} cy={py(y1)} r="3" fill="var(--card)" stroke="var(--faint)" />
      <circle cx={px(x2)} cy={py(y2)} r="3" fill="var(--card)" stroke="var(--faint)" />
      <text x="100" y="198" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
        Time
      </text>
      <text x="8" y="100" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)" transform="rotate(-90 8 100)">
        Progress
      </text>
    </svg>
  );
}

function Track({ label, at, run, easing, ms }: { label: string; at: 0 | 1; run: boolean; easing: string; ms: number }) {
  return (
    <div>
      <div className="mb-1.5 text-label text-muted-foreground">{label}</div>
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <div
          className="absolute top-0 size-5 rounded-full bg-primary"
          style={{
            left: at ? 'calc(100% - 20px)' : '0px',
            transition: run && ms > 0 ? `left ${ms}ms ${easing}` : 'none',
          }}
        />
      </div>
    </div>
  );
}

export function Motion() {
  const ease = tokens.ease.rise.$value;
  const [at, setAt] = useState<0 | 1>(0);
  const [run, setRun] = useState(false);
  const timers = useRef<number[]>([]);
  // Honour reduced motion in the demo itself: the ball jumps to the end instead of travelling.
  const reduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const ms = reduced ? 0 : RUN_MS;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const play = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    // Jump back to the start without animating, then let it run on the next frame.
    setRun(false);
    setAt(0);
    timers.current.push(
      window.setTimeout(() => {
        setRun(true);
        setAt(1);
      }, 30),
    );
  };

  return (
    <div className="max-w-[880px]">
      <P>
        Motion is quiet and quick. It explains a change, such as something arriving or a colour responding, and it never
        decorates. There is one curve, and it settles without bouncing.
      </P>

      <H2 id="ease-rise">The rise curve</H2>
      <P>
        <Code>ease-rise</Code> starts fast and eases to rest, so an element feels as if it answered the moment you acted.
      </P>
      <div className="mt-4 flex flex-wrap gap-6 rounded-lg border border-border bg-card p-4">
        <div className="w-[220px] shrink-0">
          <EaseCurve value={ease} />
        </div>
        <div className="min-w-[260px] flex-1">
          <div className="space-y-1">
            <Spec label="Token">ease.rise</Spec>
            <Spec label="Variable">--ease-rise</Spec>
            <Spec label="Value">{ease}</Spec>
          </div>
          <div className="mt-5 space-y-4">
            <Track label="ease-rise" at={at} run={run} easing={ease} ms={ms} />
            <Track label="linear, for comparison" at={at} run={run} easing="linear" ms={ms} />
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={play}
              className="h-7 rounded-lg border border-border bg-card px-3 text-label font-medium text-foreground transition-colors duration-[120ms] hover:border-primary focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none"
            >
              Play
            </button>
            <span className="text-label text-subtle-foreground">{reduced ? 'Reduced motion is on' : `${RUN_MS}ms`}</span>
          </div>
        </div>
      </div>

      <H2 id="durations">Durations</H2>
      <Table
        head={['Change', 'Duration', 'Easing']}
        rows={[
          ['Colour, border and shadow changes, such as hover and focus', '120ms', 'Default'],
          ['Panels, sheets, popovers and dialogs entering', '200ms', <Code key="r">ease-rise</Code>],
        ]}
      />

      <H3 id="rules">Rules</H3>
      <ul className="my-2 max-w-[680px] list-disc space-y-1.5 pl-5 text-read text-foreground">
        <li>Colour changes take 120ms. Panels take 200ms.</li>
        <li>No bounce, overshoot or spring. A thing arrives and stops.</li>
        <li>
          Reduced motion is honoured. When someone has asked their system for less motion, transitions are removed and the
          end state appears at once.
        </li>
      </ul>
      <CodeBlock
        lang="tsx"
        title="Usage"
        code={`<button className="transition-colors duration-[120ms] motion-reduce:transition-none" />
<div className="transition-transform duration-200 ease-[var(--ease-rise)] motion-reduce:transition-none" />`}
      />
      <Callout tone="warning" title="Reduced motion">
        Add <Code>motion-reduce:transition-none</Code> to every transition you write. The Play button above does.
      </Callout>
    </div>
  );
}
