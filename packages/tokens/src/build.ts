// Writes the two files other code reads: DTCG JSON for tools, and the CSS that
// @sole-ui/react ships. Run with `npm run build -w @sole/tokens`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCss, renderDtcg } from './generate.ts';
import { tokens } from './tokens.ts';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const outputs: Array<[path: string, content: string]> = [
  [resolve(packageRoot, 'dist/tokens.json'), renderDtcg(tokens)],
  // Generated and committed, so a reviewer sees a token change in the diff.
  [resolve(packageRoot, '../ui/src/styles/tokens.css'), renderCss(tokens)],
];

for (const [path, content] of outputs) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}
