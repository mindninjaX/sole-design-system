// Writes site/tokens.css and site/tokens.json: the downloads the docs site links to. The
// docs site itself (including the tokens pages) is built by `npm run docs:build`, which
// empties site/ first, so run this after it. Run with `npm run site`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCss, renderDtcg } from '../packages/tokens/src/generate.ts';
import { tokens } from '../packages/tokens/src/tokens.ts';

const siteDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'site');

mkdirSync(siteDir, { recursive: true });
writeFileSync(resolve(siteDir, 'tokens.css'), renderCss(tokens));
writeFileSync(resolve(siteDir, 'tokens.json'), renderDtcg(tokens));
console.log(`Wrote ${siteDir}/tokens.css and tokens.json`);
