import type { ReactNode } from 'react';
import { Pill } from '@sole-ui/react';
import { Callout, CodeBlock, Code, H2, H3, P, Steps, Table } from '../ui.tsx';

// The three Get started pages. Each returns the page body only: the app shell draws the
// title and summary above it. Code samples live in constants so the JSX stays readable and
// the braces inside them are never parsed as JSX.

const INSTALL_NPM = 'npm install @sole-ui/react radix-ui';
const INSTALL_PNPM = 'pnpm add @sole-ui/react radix-ui';
const INSTALL_YARN = 'yarn add @sole-ui/react radix-ui';

const STYLES_CSS = `@import "tailwindcss";
@import "@sole-ui/react/styles.css";`;

const VITE_CONFIG = `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});`;

const NEXT_POSTCSS = `// postcss.config.mjs
export default {
  plugins: { '@tailwindcss/postcss': {} },
};`;

const PROVIDER_ROUTER = `// src/providers.tsx
import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { SoleProvider } from '@sole-ui/react';
import type { SoleLinkProps } from '@sole-ui/react';

// The parts hand your link a ref, so the adapter has to forward it.
const AppLink = forwardRef<HTMLAnchorElement, SoleLinkProps>(function AppLink({ href, ...props }, ref) {
  return <Link ref={ref} to={href} {...props} />;
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SoleProvider
      linkComponent={AppLink}
      timeZone="Australia/Sydney"
      personHref={(person) => \`/people/\${person.id}\`}
    >
      {children}
    </SoleProvider>
  );
}`;

const PROVIDER_NEXT = `// app/providers.tsx
'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { SoleProvider } from '@sole-ui/react';
import type { SoleLinkProps } from '@sole-ui/react';

const AppLink = forwardRef<HTMLAnchorElement, SoleLinkProps>(function AppLink({ href, ...props }, ref) {
  return <Link ref={ref} href={href} {...props} />;
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SoleProvider
      linkComponent={AppLink}
      timeZone="Australia/Sydney"
      personHref={(person) => \`/people/\${person.id}\`}
    >
      {children}
    </SoleProvider>
  );
}`;

const USE_PARTS = `import { Button, PageHeader, Pill } from '@sole-ui/react';
import { DueChip, StatePill } from '@sole-ui/react/hq';
import { Plus } from 'lucide-react';

export function WeeklyReview() {
  return (
    <div className="space-y-4 p-6">
      <PageHeader
        title="Weekly review"
        description="Open items for the team."
        actions={
          <Button>
            <Plus />
            New item
          </Button>
        }
      />
      <div className="flex items-center gap-2">
        <StatePill state={{ name: 'In progress', group: 'started' }} />
        <DueChip due="2026-10-29" />
        <Pill tone="success">Approved</Pill>
      </div>
    </div>
  );
}`;

const TOASTS = `import { Toaster, toast } from '@sole-ui/react';

// Once, near the root of the app (inside SoleProvider).
<Toaster />

// Anywhere after that.
toast.success('Saved');
toast.error('Could not save that. Try again.');`;

const PEOPLE_EXAMPLE = `import type { SolePerson } from '@sole-ui/react';

const ava: SolePerson = { id: 'u_1', name: 'Ava Thompson' };`;

const TYPECHECK = `npx tsc --noEmit`;

// The prompt is plain text the reader copies, so backticks and template placeholders inside
// it are escaped. Keep every line within the one template string.
const AGENT_PROMPT = `You are adding the Sole design system (@sole-ui/react) to this project and building UI with it. Follow these steps in order.

1. Read the docs first
- Parts, live, with variants: https://mindninjax.github.io/sole-design-system/components/
- README: https://github.com/mindninjaX/sole-design-system/blob/main/packages/ui/README.md
- Machine-readable list of parts: https://mindninjax.github.io/sole-design-system/components/llms.txt
Open a part's page before you use it, and use the props it shows.

2. Install
- Install \`@sole-ui/react\` and \`radix-ui\` with this project's package manager.
- Check that react and react-dom are 18.3 or 19, that tailwindcss is v4.1 or newer, and that Node is 22 or newer. If one is missing, say so and stop.

3. Add the styles
In the main stylesheet, add exactly these two lines (the package folder is scanned for classes automatically, so there is nothing to add to a Tailwind config):
@import "tailwindcss";
@import "@sole-ui/react/styles.css";

4. Wrap the app in SoleProvider (once, near the root)
- linkComponent: an adapter for this project's router. It must use forwardRef, take \`href\`, and render the router's link. React Router: <Link ref={ref} to={href} {...props} />. Next.js: next/link, in a file that starts with 'use client'.
- timeZone: "Australia/Sydney" unless the project says otherwise.
- personHref: (person) => the route of a person's page, or null for no link.
- Put <Toaster /> inside the provider, once.

5. Build only from the package's parts
Import from '@sole-ui/react' and '@sole-ui/react/hq'. Never copy shadcn files into the project and never hand-write a button, pill, avatar or table when a part exists.
- shadcn parts: Button, Input, Select, Dialog, AlertDialog, Tabs, DropdownMenu, Popover, Tooltip, Checkbox, Switch, Sheet.
- Sole parts: Avatar, PersonChip, Pill, Kbd, Table, FilterChip, LabelTag, PageHeader, EmptyState.
- Shell pieces: AppFrame, Sidebar, Page, TopBar, Breadcrumbs, CommandPalette.
- Sole HQ parts (@sole-ui/react/hq): StateIcon, StatePill, PriorityIcon, DueChip, ReviewBadge, WorkItemRow, BoardCard, PageRow, InboxRow, Comment.
If no part fits, say so and ask before writing a custom one.

6. Rules
- Style with token utilities: bg-primary, text-muted-foreground, border-border, text-body, rounded-lg. Never write a hex value.
- Light mode and desktop only. No dark mode, no mobile layouts.
- Copy is plain and in sentence case. Failures read "Could not ..." (for example "Could not save that. Try again."). No exclamation marks. Australian spelling. Dates look like 29 Sep.
- Examples, fixtures and tests use made-up people (Ava Thompson) and example.com emails.
- People are SolePerson values: { id, name, avatarUrl?, isBot? }.
- In-app links go through SoleLink. Never use a raw <a> for a route inside the app.
- Icons come from lucide-react, drawn at 16px.

7. Verify and report
- Run the typecheck, then run the app and look at the screen.
- Finish with a short report: the files you changed, and the parts you used, each with the part page you read.`;

/** Four cards that open the main sections. Plain divs on token classes, so they match the tokens exactly. */
function LinkCard({ href, title, children }: { href: string; title: string; children: string }) {
  return (
    <a href={href} className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary">
      <div className="text-strong">{title}</div>
      <div className="mt-1 text-body text-muted-foreground">{children}</div>
    </a>
  );
}

function List({ children }: { children: ReactNode }) {
  return <ul className="my-2 max-w-[680px] list-disc space-y-1.5 pl-5 text-read text-foreground">{children}</ul>;
}

export function Overview() {
  return (
    <>
      <P>
        <Code>@sole-ui/react</Code> is the design system behind Sole HQ: the colours, type, spacing and every part on the screen, packaged
        so that anything built for Sole looks and behaves the same. It is written for the people building Sole HQ, and for the AI agents
        that help them.
      </P>
      <P>
        Everything here is copied from Sole HQ itself. If the look changes, it changes in Sole HQ first, and the tokens and parts follow.
      </P>
      <div className="my-3 flex items-center gap-2 text-body text-muted-foreground">
        <Pill tone="info">0.2.0</Pill>
        <span>
          On <a className="text-link hover:underline" href="https://www.npmjs.com/package/@sole-ui/react">npm</a>, source on{' '}
          <a className="text-link hover:underline" href="https://github.com/mindninjaX/sole-design-system">GitHub</a>.
        </span>
      </div>

      <div className="my-6 grid max-w-[760px] grid-cols-1 gap-3 sm:grid-cols-2">
        <LinkCard href="#/quick-start" title="Quick start">
          Install the package, add two lines of CSS and put the first part on a screen.
        </LinkCard>
        <LinkCard href="#/ai-agent" title="Use with an AI agent">
          One prompt that sets up the package and builds with the right parts.
        </LinkCard>
        <LinkCard href="#/foundations/colour" title="Foundations">
          Colour, type, radius, elevation and motion, as tokens you can use as classes or variables.
        </LinkCard>
        <LinkCard href="#/components/button" title="Components">
          Every part, live, with its variants and states.
        </LinkCard>
      </div>

      <H2>What is inside</H2>
      <P>One package, two entries, and three CSS files.</P>
      <Table
        head={['Entry', 'What it holds', 'Example parts']}
        rows={[
          [
            <Code key="e">@sole-ui/react</Code>,
            'The tokens, the helpers, the shadcn parts with Sole\'s look, Sole\'s own parts, the app shell and toasts.',
            <span key="p">
              <Code>Button</Code>, <Code>Dialog</Code>, <Code>Avatar</Code>, <Code>Pill</Code>, <Code>AppFrame</Code>, <Code>toast</Code>
            </span>,
          ],
          [
            <Code key="e">@sole-ui/react/hq</Code>,
            'The parts only Sole HQ uses: work items, boards, pages, the inbox and comments.',
            <span key="p">
              <Code>StatePill</Code>, <Code>DueChip</Code>, <Code>WorkItemRow</Code>, <Code>BoardCard</Code>, <Code>InboxRow</Code>
            </span>,
          ],
          [
            <Code key="e">@sole-ui/react/styles.css</Code>,
            'The Tailwind v4 theme: colour, type, radius and shadow utilities, Inter Variable and the base layer.',
            'Use with Tailwind v4.',
          ],
          [
            <Code key="e">@sole-ui/react/tokens.css</Code>,
            'The same tokens as plain CSS custom properties, for projects without Tailwind.',
            <Code key="p">var(--primary)</Code>,
          ],
          [
            <Code key="e">@sole-ui/react/tokens.json</Code>,
            'The token tree in the DTCG format, for design tools and generators.',
            'Figma, Style Dictionary.',
          ],
        ]}
      />

      <H2>Principles</H2>
      <List>
        <li>
          <strong>One look.</strong> Primary blue <Code>#0270D6</Code>, zinc greys, Inter Variable at 13px on 20px, and an 8px radius.
          There are no themes to choose between.
        </li>
        <li>
          <strong>Presentational.</strong> Parts draw what they are given. They have no router and fetch nothing: links go through{' '}
          <Code>SoleLink</Code> and people are <Code>SolePerson</Code> values.
        </li>
        <li>
          <strong>Light mode and desktop only.</strong> There is no dark theme and no touch layout, so nothing to switch off.
        </li>
        <li>
          <strong>React 18 and 19.</strong> Every part forwards its ref, and every module starts with <Code>&apos;use client&apos;</Code>,
          so the package works in Next.js too.
        </li>
        <li>
          <strong>Tailwind v4.</strong> The tokens are real utilities: <Code>bg-primary</Code>, <Code>text-muted-foreground</Code>,{' '}
          <Code>text-body</Code>, <Code>rounded-lg</Code>.
        </li>
      </List>

      <Callout title="Where to start">
        New to the package? Follow the <a className="text-link hover:underline" href="#/quick-start">quick start</a>. Working with an AI
        agent? Give it the <a className="text-link hover:underline" href="#/ai-agent">ready-made prompt</a>.
      </Callout>
    </>
  );
}

export function QuickStart() {
  return (
    <>
      <P>
        About five minutes, from an empty React app to a styled screen. You will install the package, add two lines of CSS, wrap the app
        once and use your first parts.
      </P>

      <H2>Requirements</H2>
      <Table
        head={['Need', 'Version', 'Why']}
        rows={[
          ['Node', '22 or newer', 'To install and build.'],
          [
            <Code key="n">react</Code>,
            '18.3 or 19',
            <span key="w">
              Peer dependency, together with <Code>react-dom</Code>.
            </span>,
          ],
          [<Code key="n">radix-ui</Code>, '1.4 or newer', 'Peer dependency. The parts are built on its primitives.'],
          [<Code key="n">tailwindcss</Code>, '4.1 or newer', 'For the styles. Skip it only if you use tokens.css on its own.'],
        ]}
      />

      <H2>Set up</H2>
      <Steps
        steps={[
          {
            title: 'Install',
            body: (
              <>
                <P>
                  Install the package with <Code>radix-ui</Code>, which is a peer dependency and is not installed for you. The rest
                  (including <Code>lucide-react</Code>, <Code>sonner</Code> and the Inter font) comes with the package.
                </P>
                <CodeBlock title="npm" lang="sh" code={INSTALL_NPM} />
                <CodeBlock title="pnpm" lang="sh" code={INSTALL_PNPM} />
                <CodeBlock title="yarn" lang="sh" code={INSTALL_YARN} />
              </>
            ),
          },
          {
            title: 'Add the styles',
            body: (
              <>
                <P>
                  In your main stylesheet, import Tailwind and then the Sole styles. That is all: the package scans its own files for
                  classes, so there is no <Code>content</Code> setting and no config to edit.
                </P>
                <CodeBlock title="src/index.css" lang="css" code={STYLES_CSS} />
                <P>Tailwind v4 needs its build plugin. Use the one for your tool.</P>
                <H3>Vite</H3>
                <P>
                  Install <Code>tailwindcss</Code> and <Code>@tailwindcss/vite</Code>, then add the plugin.
                </P>
                <CodeBlock lang="ts" code={VITE_CONFIG} />
                <H3>Next.js</H3>
                <P>
                  Install <Code>tailwindcss</Code>, <Code>@tailwindcss/postcss</Code> and <Code>postcss</Code>, then register the
                  plugin. Import the stylesheet in <Code>app/layout.tsx</Code>.
                </P>
                <CodeBlock lang="js" code={NEXT_POSTCSS} />
                <Callout title="Without Tailwind">
                  Import <Code>@sole-ui/react/tokens.css</Code> instead. It holds the same values as CSS custom properties. The parts
                  themselves are styled with Tailwind classes, so they need the full setup above.
                </Callout>
              </>
            ),
          },
          {
            title: 'Wrap the app in SoleProvider',
            body: (
              <>
                <P>
                  Wrap the app once, near the root. The provider gives the parts your router&apos;s link, the work clock and the tooltip
                  provider.
                </P>
                <Table
                  head={['Prop', 'What it does', 'Default']}
                  rows={[
                    [<Code key="p">linkComponent</Code>, 'The link every part uses for an address inside the app.', 'A plain <a>.'],
                    [<Code key="p">timeZone</Code>, 'The time zone "today" and "overdue" are worked out in.', <Code key="d">Australia/Sydney</Code>],
                    [<Code key="p">now</Code>, 'The app\'s clock. Pin it in demos and tests.', 'The real clock.'],
                    [<Code key="p">personHref</Code>, 'Where a person\'s name links to, or null for no link.', 'No link.'],
                  ]}
                />
                <P>
                  The parts hand the link a ref, so your adapter has to forward it. Pick the one for your router.
                </P>
                <H3>React Router</H3>
                <CodeBlock title="src/providers.tsx" lang="tsx" code={PROVIDER_ROUTER} />
                <H3>Next.js</H3>
                <P>
                  Put the provider in a client file, because a function cannot be passed from a server component.
                </P>
                <CodeBlock title="app/providers.tsx" lang="tsx" code={PROVIDER_NEXT} />
                <P>
                  Then render <Code>{'<Providers>'}</Code> around your app (in <Code>app/layout.tsx</Code> for Next.js, or in{' '}
                  <Code>main.tsx</Code> for Vite). People are plain objects:
                </P>
                <CodeBlock lang="ts" code={PEOPLE_EXAMPLE} />
              </>
            ),
          },
          {
            title: 'Use the parts',
            body: (
              <>
                <P>
                  Import shared parts from <Code>@sole-ui/react</Code> and Sole HQ parts from <Code>@sole-ui/react/hq</Code>. Here is a
                  small screen header with a work item&apos;s state and due date.
                </P>
                <CodeBlock title="src/weekly-review.tsx" lang="tsx" code={USE_PARTS} />
                <P>
                  Style around them with the token utilities (<Code>bg-primary</Code>, <Code>text-muted-foreground</Code>,{' '}
                  <Code>rounded-lg</Code>), never with hex values. Each part&apos;s page lists its props and variants, for example{' '}
                  <a className="text-link hover:underline" href="#/components/button">Button</a>.
                </P>
              </>
            ),
          },
          {
            title: 'Show toasts',
            body: (
              <>
                <P>
                  Render <Code>{'<Toaster />'}</Code> once. After that, call <Code>toast</Code> from anywhere. Errors say what went wrong
                  in plain words: &quot;Could not save that. Try again.&quot;
                </P>
                <CodeBlock lang="tsx" code={TOASTS} />
              </>
            ),
          },
          {
            title: 'Check your work',
            body: (
              <>
                <P>
                  Run the typecheck. Every part is typed, so a wrong prop shows up here before it shows up on screen.
                </P>
                <CodeBlock lang="sh" code={TYPECHECK} />
                <P>
                  Then start the app and look at the screen. If a part looks unstyled, check that the stylesheet from step 2 is imported
                  and that the Tailwind plugin is running. Compare any part with its live version on the{' '}
                  <a className="text-link hover:underline" href="#/components/button">components pages</a>.
                </P>
              </>
            ),
          },
        ]}
      />

      <H2>Next steps</H2>
      <List>
        <li>
          <a className="text-link hover:underline" href="#/ai-agent">Use with an AI agent</a>: one prompt that does this setup for you.
        </li>
        <li>
          <a className="text-link hover:underline" href="#/foundations/colour">Foundations</a>: the colour, type and spacing tokens.
        </li>
        <li>
          <a className="text-link hover:underline" href="#/components/button">Components</a>: every part, live, with its variants.
        </li>
        <li>
          <a className="text-link hover:underline" href="https://www.npmjs.com/package/@sole-ui/react">@sole-ui/react on npm</a> and the{' '}
          <a className="text-link hover:underline" href="https://github.com/mindninjaX/sole-design-system">source on GitHub</a>.
        </li>
      </List>
    </>
  );
}

export function AiAgent() {
  return (
    <>
      <P>
        Give any AI agent (Claude Code, Cursor, Copilot or ChatGPT) the prompt below. It sets up the package, wraps the app in{' '}
        <Code>SoleProvider</Code> and builds with the right parts instead of writing its own buttons and cards.
      </P>
      <P>
        The prompt points the agent at the live docs, the README and a machine-readable list of parts, so it reads the real props rather
        than guessing them.
      </P>

      <CodeBlock title="Prompt for your AI agent" lang="text" code={AGENT_PROMPT} />

      <H2>Tips</H2>
      <List>
        <li>
          <strong>Where to paste it.</strong> Into the chat of Claude Code, Cursor or Copilot, opened on your project. In ChatGPT,
          paste it with the files the agent needs to see.
        </li>
        <li>
          <strong>Keep it in the repository.</strong> Save the prompt in <Code>AGENTS.md</Code> or <Code>CLAUDE.md</Code> (drop the
          install and styles steps once they are done), so every later session builds the same way.
        </li>
        <li>
          <strong>Ask for the part page.</strong> Have the agent cite the part page it used for each part. If it cannot, it guessed.
        </li>
      </List>

      <Callout title="Machine-readable list">
        Agents that cannot browse can read <a className="text-link hover:underline" href="./llms.txt">llms.txt</a>: the list of parts, as
        plain text.
      </Callout>
    </>
  );
}
