// Writes site/index.html: one self-contained page that shows every Sole token, plus the
// generated tokens.css and tokens.json it links to. Run with `npm run site`.
// It renders from the token source directly, so it never shows a stale build.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCss, renderDtcg } from '../packages/tokens/src/generate.ts';
import { tokens } from '../packages/tokens/src/tokens.ts';
import type { Token } from '../packages/tokens/src/tokens.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const siteDir = resolve(root, 'site');
const REPO_URL = 'https://github.com/mindninjaX/sole-design-system';

const esc = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Colour groups, in the order the source lists them. A token no group claims lands in
// "Surface and text", so a new token always shows up on the page.
const COLOUR_GROUPS: ReadonlyArray<{ title: string; note: string; match: (name: string) => boolean }> = [
  {
    title: 'Action and focus',
    note: 'The blue family: buttons, links, selection and the focus ring.',
    match: (n) => /^(primary|brand|link|accent|ring)/.test(n),
  },
  {
    title: 'Status',
    note: 'Danger, warning and success come as a strong colour, a text colour, a soft fill and a border.',
    match: (n) => /^(destructive|danger|warning|success|overdue)/.test(n),
  },
  { title: 'Sidebar', note: 'The navigation rail.', match: (n) => n.startsWith('sidebar') },
  { title: 'Tooltip and mark', note: 'The dark tooltip and the brand mark.', match: (n) => n.startsWith('tooltip') || n === 'mark' },
  { title: 'State icons', note: 'Task state colours by group.', match: (n) => n.startsWith('state-') },
  { title: 'Sticky notes', note: 'Fills for sticky notes.', match: (n) => n.startsWith('sticky-') },
  {
    title: 'Surface and text',
    note: 'Page and card surfaces, borders, fields and the grey text roles.',
    match: () => true,
  },
];

function isToken(node: unknown): node is Token {
  return typeof node === 'object' && node !== null && '$value' in node;
}

function colourSection(): string {
  const buckets = new Map<string, Array<[string, Token]>>();
  for (const group of COLOUR_GROUPS) buckets.set(group.title, []);
  for (const [name, node] of Object.entries(tokens.color)) {
    if (!isToken(node)) continue;
    const group = COLOUR_GROUPS.find((g) => g.match(name));
    if (group === undefined) throw new Error(`Could not place the colour "${name}" in a group.`);
    buckets.get(group.title)?.push([name, node]);
  }
  // The surface group comes first on the page, ahead of the order it is matched in.
  const order = ['Surface and text', ...COLOUR_GROUPS.map((g) => g.title).filter((t) => t !== 'Surface and text')];
  return order
    .map((title) => {
      const group = COLOUR_GROUPS.find((g) => g.title === title);
      const entries = buckets.get(title) ?? [];
      if (group === undefined || entries.length === 0) return '';
      const swatches = entries
        .map(
          ([name, token]) => `
        <div class="swatch">
          <div class="chip" style="background:${esc(token.$value)}"></div>
          <div class="swatch-name">${esc(name)}</div>
          <div class="swatch-hex">${esc(token.$value)}</div>
        </div>`,
        )
        .join('');
      return `
      <h3>${esc(title)}</h3>
      <p class="note">${esc(group.note)}</p>
      <div class="swatches">${swatches}</div>`;
    })
    .join('');
}

function hueSection(): string {
  const rows = Object.entries(tokens.hue)
    .map(([name, hue]) => {
      const cell = (label: string, token: Token) => `
        <div class="hue-value"><span class="dot-sm" style="background:${esc(token.$value)}"></span><span class="hue-label">${label}</span> ${esc(token.$value)}</div>`;
      return `
      <div class="hue-row">
        <span class="tag" style="background:${esc(hue.bg.$value)};border-color:${esc(hue.border.$value)};color:${esc(hue.fg.$value)}">
          <span class="tag-dot" style="background:${esc(hue.dot.$value)}"></span>${esc(name)}
        </span>
        <div class="hue-values">${cell('fill', hue.bg)}${cell('border', hue.border)}${cell('text', hue.fg)}${cell('dot', hue.dot)}</div>
      </div>`;
    })
    .join('');
  return `<div class="card hue-card">${rows}</div>`;
}

function typeSection(): string {
  const sans = tokens.font.sans.$value;
  const mono = tokens.font.mono.$value;
  const rows = Object.entries(tokens.text)
    .map(([name, style]) => {
      const s = style as Record<string, Token | undefined>;
      const size = s.size?.$value ?? '13px';
      const lineHeight = s['line-height']?.$value ?? '20px';
      const weight = s.weight?.$value ?? '400';
      const tracking = s['letter-spacing']?.$value;
      const upper = name === 'micro';
      const css = `font-size:${size};line-height:${lineHeight};font-weight:${weight};${tracking ? `letter-spacing:${tracking};` : ''}${upper ? 'text-transform:uppercase;' : ''}`;
      const spec = `${size} / ${lineHeight} / ${weight}${tracking ? ` / ${tracking}` : ''}`;
      return `
      <div class="type-row">
        <div class="type-meta"><div class="type-name">text-${esc(name)}</div><div class="type-spec">${esc(spec)}</div></div>
        <div class="type-sample" style="${css}">${upper ? 'Section label' : 'Sole keeps the work moving'}</div>
      </div>`;
    })
    .join('');
  return `
    <div class="card">${rows}</div>
    <div class="card fonts">
      <div class="type-meta"><div class="type-name">font-sans</div><div class="type-spec">${esc(sans)}</div></div>
      <div class="type-meta"><div class="type-name">font-mono</div><div class="type-spec mono">${esc(mono)}</div></div>
    </div>`;
}

function radiusSection(): string {
  const base = Number.parseInt(tokens.radius.base.$value, 10);
  const steps: Array<[string, number, string]> = [
    ['xs', 3, '3px, a literal'],
    ['sm', base - 4, 'base minus 4'],
    ['md', base - 2, 'base minus 2'],
    ['lg', base, 'the base: buttons and inputs'],
    ['xl', base + 4, 'base plus 4: panels'],
    ['2xl', base + 8, 'base plus 8: dialogs'],
  ];
  const boxes = steps
    .map(
      ([name, px, note]) => `
      <div class="radius-item">
        <div class="radius-box" style="border-radius:${px}px"></div>
        <div class="swatch-name">radius-${esc(name)}</div>
        <div class="swatch-hex">${px}px</div>
        <div class="note-sm">${esc(note)}</div>
      </div>`,
    )
    .join('');
  return `<p class="note">The base radius is <code>--radius: ${esc(tokens.radius.base.$value)}</code>. Every step is derived from it.</p><div class="card radius-row">${boxes}</div>`;
}

function elevationSection(): string {
  const items = Object.entries(tokens.shadow)
    .map(([name, token]) => {
      const isRing = name === 'focus-ring';
      return `
      <div class="shadow-item">
        <div class="shadow-box${isRing ? ' ring' : ''}" style="box-shadow:${esc(token.$value)}"></div>
        <div class="swatch-name">${esc(name)}</div>
        <div class="swatch-hex mono">${esc(token.$value)}</div>
      </div>`;
    })
    .join('');
  return `<div class="shadow-row">${items}</div>`;
}

function motionSection(): string {
  const ease = tokens.ease.rise.$value;
  const nums = /cubic-bezier\(([^)]+)\)/.exec(ease)?.[1]?.split(',').map((v) => Number.parseFloat(v));
  if (nums === undefined || nums.length !== 4 || nums.some(Number.isNaN)) throw new Error('Could not read the ease-rise curve.');
  const [x1, y1, x2, y2] = nums as [number, number, number, number];
  // A 100x100 plot with the y axis flipped; the curve runs from (0,100) to (100,0).
  const curve = `M0,100 C${x1 * 100},${100 - y1 * 100} ${x2 * 100},${100 - y2 * 100} 100,0`;
  return `
    <div class="card motion">
      <svg viewBox="-10 -10 120 120" width="120" height="120" role="img" aria-label="The ease-rise curve">
        <rect x="0" y="0" width="100" height="100" fill="none" stroke="var(--border)" />
        <path d="${curve}" fill="none" stroke="var(--primary)" stroke-width="2.5" />
      </svg>
      <div>
        <div class="swatch-name">ease-rise</div>
        <div class="swatch-hex mono">${esc(ease)}</div>
        <p class="note-sm">A quick start that settles softly. Press the button to see it on a 600ms move.</p>
        <div class="track"><div class="ball" id="ball"></div></div>
        <button type="button" class="btn" id="play">Play</button>
      </div>
    </div>`;
}

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sole design system: tokens</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  color-scheme: light;
  --background: ${tokens.color.background.$value};
  --foreground: ${tokens.color.foreground.$value};
  --card: ${tokens.color.card.$value};
  --primary: ${tokens.color.primary.$value};
  --primary-hover: ${tokens.color['primary-hover'].$value};
  --primary-foreground: ${tokens.color['primary-foreground'].$value};
  --link: ${tokens.color.link.$value};
  --muted-foreground: ${tokens.color['muted-foreground'].$value};
  --subtle-foreground: ${tokens.color['subtle-foreground'].$value};
  --border: ${tokens.color.border.$value};
  --hairline: ${tokens.color.hairline.$value};
  --ring: ${tokens.color.ring.$value};
  --radius: ${tokens.radius.base.$value};
  --ease-rise: ${tokens.ease.rise.$value};
  --elevation-sm: ${tokens.shadow['elevation-sm'].$value};
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: Inter, ${tokens.font.sans.$value.replace(/^"Inter Variable", /, '')};
  font-size: 13px;
  line-height: 20px;
  -webkit-font-smoothing: antialiased;
}
main { max-width: 960px; margin: 0 auto; padding: 40px 24px 80px; }
a { color: var(--link); }
code, .mono { font-family: ${tokens.font.mono.$value}; }
code { background: var(--hairline); padding: 1px 5px; border-radius: 4px; font-size: 12px; }
h1 { font-size: 28px; line-height: 34px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 8px; }
h2 { font-size: 18px; line-height: 24px; font-weight: 600; letter-spacing: -0.015em; margin: 48px 0 12px; }
h3 { font-size: 14px; line-height: 20px; font-weight: 600; letter-spacing: -0.01em; margin: 24px 0 2px; }
p { margin: 0 0 12px; }
.lead { font-size: 16px; line-height: 26px; color: var(--muted-foreground); max-width: 680px; }
.note { color: var(--muted-foreground); margin-bottom: 12px; }
.note-sm { color: var(--subtle-foreground); font-size: 12px; line-height: 16px; margin-top: 4px; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--elevation-sm); padding: 16px; }
.install { margin: 16px 0 0; max-width: 680px; }
.install pre { margin: 0; padding: 12px 16px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--elevation-sm); overflow-x: auto; font-family: ${tokens.font.mono.$value}; font-size: 12px; line-height: 20px; }
.install .note-sm { margin: 8px 0 0; }
.links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.links a { display: inline-flex; align-items: center; height: 32px; padding: 0 12px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); text-decoration: none; font-weight: 500; }
.links a:hover { border-color: var(--primary); }
.swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.swatch { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 8px; }
.chip { height: 44px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.08); }
.swatch-name { font-weight: 500; margin-top: 8px; word-break: break-word; }
.swatch-hex { color: var(--subtle-foreground); font-size: 12px; line-height: 16px; word-break: break-word; }
.hue-card { padding: 4px 16px; }
.hue-row { display: flex; align-items: center; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--hairline); flex-wrap: wrap; }
.hue-row:last-child { border-bottom: 0; }
.tag { display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 10px; border: 1px solid; border-radius: 6px; font-size: 12px; font-weight: 500; width: 96px; }
.tag-dot { width: 8px; height: 8px; border-radius: 50%; }
.hue-values { display: flex; flex-wrap: wrap; gap: 4px 20px; }
.hue-value { display: inline-flex; align-items: center; gap: 6px; color: var(--muted-foreground); font-size: 12px; }
.hue-label { color: var(--subtle-foreground); min-width: 38px; }
.dot-sm { width: 10px; height: 10px; border-radius: 3px; border: 1px solid rgba(0,0,0,0.1); }
.type-row { display: grid; grid-template-columns: 220px 1fr; gap: 16px; align-items: baseline; padding: 12px 0; border-bottom: 1px solid var(--hairline); }
.type-row:first-child { padding-top: 0; }
.type-row:last-child { border-bottom: 0; padding-bottom: 0; }
.type-name { font-weight: 500; }
.type-spec { color: var(--subtle-foreground); font-size: 12px; line-height: 16px; word-break: break-word; }
.fonts { margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.radius-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; }
.radius-box { width: 72px; height: 72px; background: var(--hairline); border: 1px solid var(--border); border-top-color: var(--primary); border-left-color: var(--primary); border-top-width: 2px; border-left-width: 2px; }
.shadow-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.shadow-box { height: 96px; background: var(--card); border-radius: var(--radius); border: 1px solid var(--hairline); margin-bottom: 12px; }
.shadow-box.ring { border-color: var(--ring); }
.motion { display: flex; gap: 24px; align-items: center; flex-wrap: wrap; }
.motion > div { flex: 1; min-width: 240px; }
.track { height: 28px; background: var(--hairline); border-radius: 14px; position: relative; margin: 12px 0; }
.ball { position: absolute; left: 4px; top: 4px; width: 20px; height: 20px; border-radius: 50%; background: var(--primary); transition: transform 600ms var(--ease-rise); }
.ball.go { transform: translateX(var(--travel, 300px)); }
.btn { height: 32px; padding: 0 14px; border: 0; border-radius: var(--radius); background: var(--primary); color: var(--primary-foreground); font: inherit; font-weight: 500; cursor: pointer; }
.btn:hover { background: var(--primary-hover); }
footer { margin-top: 56px; color: var(--subtle-foreground); }
@media (max-width: 640px) { .type-row, .fonts { grid-template-columns: 1fr; gap: 4px; } }
</style>
</head>
<body>
<main>
  <h1>Sole design system: tokens</h1>
  <p class="lead">The design tokens behind the Sole look: colour, label hues, type, radius, elevation and motion. They are copied from Sole HQ's stylesheet and turned into CSS and DTCG JSON from one source file, so every product reads the same values. They ship as <code>@sole-ui/react</code>; the components and the full documentation come in later versions.</p>
  <div class="install">
    <pre>npm install @sole-ui/react</pre>
    <div class="note-sm">Then, in your Tailwind v4 stylesheet:</div>
    <pre>@import "tailwindcss";
@import "@sole-ui/react/styles.css";</pre>
    <div class="note-sm">No Tailwind? Import <code>@sole-ui/react/tokens.css</code> for the plain CSS variables, or read <code>@sole-ui/react/tokens.json</code>.</div>
  </div>
  <div class="links">
    <a href="${REPO_URL}">GitHub repository</a>
    <a href="tokens.css" download>tokens.css</a>
    <a href="tokens.json" download>tokens.json (DTCG)</a>
  </div>

  <h2>Colour</h2>
  <p class="note">Every colour token, with its name and value. Text greys are split by role: foreground, muted and subtle all clear 4.5:1 on white; faint is for dots, dividers and chevrons only, never words.</p>
  ${colourSection()}

  <h2>Label hues</h2>
  <p class="note">The twelve hues for labels and tags. People pick a hue name, never a hex. Each hue is one ramp: a light fill, a border, a dark text colour and a dot.</p>
  ${hueSection()}

  <h2>Type scale</h2>
  <p class="note">Each style shows size / line-height / weight, then letter-spacing where it has one. Body text is 13px on 20px.</p>
  ${typeSection()}

  <h2>Radius</h2>
  ${radiusSection()}

  <h2>Elevation</h2>
  <p class="note">Two elevations and a focus ring.</p>
  ${elevationSection()}

  <h2>Motion</h2>
  ${motionSection()}

  <footer>Light mode and desktop only. Source: <a href="${REPO_URL}">${REPO_URL.replace('https://', '')}</a></footer>
</main>
<script>
  var ball = document.getElementById('ball');
  var play = document.getElementById('play');
  function travel() {
    var track = ball.parentElement;
    ball.style.setProperty('--travel', Math.max(0, track.clientWidth - 28) + 'px');
  }
  play.addEventListener('click', function () {
    travel();
    ball.classList.remove('go');
    void ball.offsetWidth;
    ball.classList.add('go');
  });
</script>
</body>
</html>
`;

mkdirSync(siteDir, { recursive: true });
writeFileSync(resolve(siteDir, 'index.html'), page);
writeFileSync(resolve(siteDir, 'tokens.css'), renderCss(tokens));
writeFileSync(resolve(siteDir, 'tokens.json'), renderDtcg(tokens));
console.log(`Wrote ${siteDir}/index.html, tokens.css and tokens.json`);
