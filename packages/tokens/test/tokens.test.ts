import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { tokens } from '../src/tokens.ts';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const generatedCss = resolve(packageRoot, '../ui/src/styles/tokens.css');
const generatedJson = resolve(packageRoot, 'dist/tokens.json');

// The blocks that hold Sole HQ's custom properties. Everything else in globals.css
// (base layer, reduced motion, the text-micro utility) is not a token.
const TOKEN_BLOCK = /^(:root|\.hue-[a-z]+|@theme inline)$/;

/**
 * Reads `--name: value;` declarations from the token blocks of a stylesheet. The key
 * carries the block's selector because `--ease-rise` is declared both in `:root` and in
 * `@theme inline`, with different values.
 */
function customProperties(css: string): Map<string, string> {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const found = new Map<string, string>();
  const stack: string[] = [];
  let buffer = '';

  const record = () => {
    const selector = stack[stack.length - 1];
    const match = /^(--[\w-]+)\s*:\s*([\s\S]+)$/.exec(buffer.trim());
    if (selector !== undefined && TOKEN_BLOCK.test(selector) && match) {
      // Hex digits are case-insensitive, and so is everything else we compare.
      found.set(`${selector}|${match[1]}`, match[2]!.replace(/\s+/g, ' ').trim().toLowerCase());
    }
    buffer = '';
  };

  for (const ch of stripped) {
    if (ch === '{') {
      stack.push(buffer.trim().replace(/\s+/g, ' '));
      buffer = '';
    } else if (ch === '}') {
      record();
      stack.pop();
    } else if (ch === ';') {
      record();
    } else {
      buffer += ch;
    }
  }
  return found;
}

const DTCG_TYPES = ['color', 'dimension', 'fontFamily', 'shadow', 'cubicBezier', 'number'];

describe('tokens', () => {
  beforeAll(() => {
    // Run the real build so the test reads what a consumer would get.
    execFileSync(process.execPath, ['src/build.ts'], { cwd: packageRoot, stdio: 'pipe' });
  });

  it('every HQ custom property has the same value', () => {
    const hq = customProperties(readFileSync(resolve(packageRoot, 'test/hq-globals.css'), 'utf8'));
    const ours = customProperties(readFileSync(generatedCss, 'utf8'));

    // A parser that finds nothing would make the comparison pass for the wrong reason.
    expect(hq.size).toBeGreaterThan(200);
    expect([...ours.keys()].sort()).toEqual([...hq.keys()].sort());
    expect(Object.fromEntries(ours)).toEqual(Object.fromEntries(hq));
  });

  it('pins the Sole look', () => {
    expect(tokens.color.primary.$value).toBe('#0270d6');
    expect(tokens.radius.base.$value).toBe('8px');
    expect(tokens.text.body.size.$value).toBe('13px');
    expect(tokens.text.body['line-height'].$value).toBe('20px');
    expect(tokens.font.sans.$value.startsWith('"Inter Variable"')).toBe(true);
  });

  it('writes valid DTCG', () => {
    const tree = JSON.parse(readFileSync(generatedJson, 'utf8')) as Record<string, unknown>;
    expect(tree).not.toHaveProperty('$schema');

    let leaves = 0;
    const walk = (node: Record<string, unknown>, path: string) => {
      if ('$value' in node) {
        leaves += 1;
        expect(typeof node.$value, `${path} $value`).toBe('string');
        expect(DTCG_TYPES, `${path} $type`).toContain(node.$type);
        return;
      }
      for (const [key, child] of Object.entries(node)) {
        if (key.startsWith('$')) continue;
        walk(child as Record<string, unknown>, `${path}.${key}`);
      }
    };
    walk(tree, 'tokens');
    expect(leaves).toBeGreaterThan(100);
  });
});
