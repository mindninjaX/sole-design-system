// Writes site/components/llms.txt: a plain-text list of every part for AI agents (the
// llmstxt.org shape). It loads the same section files the site renders, so it cannot drift.
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

interface Section {
  id: string;
  title: string;
  group: string;
  summary: string;
  importLine?: string;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://mindninjax.github.io/sole-design-system/components/';

const server = await createServer({ root, appType: 'custom', server: { middlewareMode: true }, logLevel: 'error' });
try {
  const files = (await import('node:fs')).readdirSync(resolve(root, 'src/sections')).filter((f) => f.endsWith('.tsx'));
  const all: Section[] = [];
  for (const file of files) {
    const mod = (await server.ssrLoadModule(`/src/sections/${file}`)) as { sections: Section[] };
    all.push(...mod.sections);
  }
  all.sort((a, b) => a.title.localeCompare(b.title));

  const groupTitle: Record<string, string> = { Shared: 'Shared parts (shadcn)', Sole: 'Sole parts', Shell: 'App shell', HQ: 'Sole HQ parts' };
  const lines = [
    '# Sole design system (@sole-ui/react)',
    '',
    "> Sole HQ's design system as a React and Tailwind CSS v4 package. One look: primary blue #0270D6, Inter Variable 13px/20px, 8px radius, light mode and desktop only. Parts are presentational (no router, no fetching), forward refs, and work on React 18.3 and 19.",
    '',
    '## Setup',
    '',
    '- Install: `npm install @sole-ui/react radix-ui` (peers: react, react-dom ^18.3 || ^19, tailwindcss ^4.1)',
    '- Styles, in your main CSS: `@import "tailwindcss";` then `@import "@sole-ui/react/styles.css";`',
    '- Wrap the app once: `<SoleProvider linkComponent={...} timeZone="Australia/Sydney" personHref={...}>` (from `@sole-ui/react`)',
    '- Entries: `@sole-ui/react` (tokens, shared, Sole and shell parts, `toast`) and `@sole-ui/react/hq` (parts only Sole HQ uses)',
    '- People are `SolePerson { id, name, avatarUrl?, isBot? }`. In-app links go through `SoleLink`.',
    '- Use token utilities (`bg-primary`, `text-muted-foreground`, `text-body`, `rounded-lg`), never hex values.',
    `- Docs: ${SITE}`,
    '',
  ];
  for (const group of ['Shared', 'Sole', 'Shell', 'HQ']) {
    lines.push(`## ${groupTitle[group] ?? group}`, '');
    for (const s of all.filter((x) => x.group === group)) {
      const importLine = s.importLine ? ` Import: \`${s.importLine}\`` : '';
      lines.push(`- [${s.title}](${SITE}#/components/${s.id}): ${s.summary}${importLine}`);
    }
    lines.push('');
  }
  const out = resolve(root, '../../site/components/llms.txt');
  writeFileSync(out, `${lines.join('\n')}\n`);
  console.log(`Wrote ${out} with ${all.length} parts`);
} finally {
  await server.close();
}
