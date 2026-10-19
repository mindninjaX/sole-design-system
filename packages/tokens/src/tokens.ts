/**
 * THE token source for the Sole look.
 *
 * Every value is copied from Sole HQ's globals.css (sole-hq at 89668d5). The test in
 * test/tokens.test.ts compares the CSS generated from this file with a copy of that file,
 * so a value cannot drift. A token value never changes in this repository; if the look
 * changes, it changes in Sole HQ first and the fixture is replaced with the new file.
 *
 * Shape: DTCG (design tokens community group) groups and leaves. A leaf's
 * `$description` becomes the comment above it in the generated CSS, so the reasons HQ
 * wrote down travel with the values.
 */

export type TokenType = 'color' | 'dimension' | 'fontFamily' | 'shadow' | 'cubicBezier' | 'number';

export interface Token {
  $value: string;
  $type: TokenType;
  $description?: string;
}

export interface TokenTree {
  [name: string]: Token | TokenTree;
}

const leaf =
  (type: TokenType) =>
  (value: string, description?: string): Token =>
    description === undefined ? { $value: value, $type: type } : { $value: value, $type: type, $description: description };

const color = leaf('color');
const dimension = leaf('dimension');
const fontFamily = leaf('fontFamily');
const shadow = leaf('shadow');
const cubicBezier = leaf('cubicBezier');
const weight = leaf('number');

// `satisfies` keeps the literal key names, so `tokens.color.primary` is checked by the compiler.
export const tokens = {
  // Every :root colour, in HQ's order and with HQ's kebab names. The text greys are split by
  // role: foreground, muted-foreground and subtle-foreground clear 4.5:1; faint is for dots,
  // dividers and chevrons only, never words.
  color: {
    background: color('#f5f5f5'),
    foreground: color('#18181b'),
    card: color('#ffffff'),
    'card-foreground': color('#18181b'),
    popover: color('#ffffff'),
    'popover-foreground': color('#18181b'),
    primary: color('#0270d6'),
    'primary-foreground': color('#ffffff'),
    'primary-hover': color('#0263bd'),
    brand: color('#0485f7'),
    link: color('#0263bd'),
    secondary: color('#f4f4f5'),
    'secondary-foreground': color('#3f3f46'),
    muted: color('#f4f4f5'),
    'muted-foreground': color('#52525b'),
    'subtle-foreground': color('#71717a'),
    faint: color('#9ca3af'),
    accent: color('#e6f2fe'),
    'accent-foreground': color('#0263bd'),
    'row-hover': color('#f7f9fc'),
    border: color('#dedee0'),
    hairline: color('#f3f3f7'),
    input: color('#dedee0'),
    field: color('#f9fafb'),
    ring: color('#0485f7'),
    destructive: color('#dc2626'),
    'destructive-foreground': color('#ffffff'),
    'danger-text': color('#b42318'),
    'danger-soft': color('#fef2f2'),
    'danger-border': color('#fecaca'),
    warning: color('#f59e0b'),
    'warning-text': color('#b45309'),
    'warning-soft': color('#fffbeb'),
    'warning-border': color('#fcd34d'),
    success: color('#10b981'),
    'success-text': color('#047857'),
    'success-soft': color('#ecfdf5'),
    'success-border': color('#a7f3d0'),
    'neutral-soft': color('#f3f4f6'),
    'neutral-text': color('#374151'),
    skeleton: color('#eef0f3'),
    sidebar: color('#f5f5f5'),
    'sidebar-foreground': color('#3f3f46'),
    'sidebar-accent': color('#e6f2fe'),
    'sidebar-accent-foreground': color('#0263bd'),
    'sidebar-hover': color('#ebebef'),
    'sidebar-border': color('#dedee0'),
    'sidebar-ring': color('#0485f7'),
    tooltip: color('#18181b'),
    'tooltip-foreground': color('#ffffff'),
    overdue: color('#dc2626'),
    'overdue-foreground': color('#ffffff'),
    mark: color('#4d4dff'),
    'state-backlog': color('#9ca3af', 'State icon colours by group (brand-and-ux 5.8).'),
    'state-unstarted': color('#71717a'),
    'state-started': color('#f59e0b'),
    'state-completed': color('#10b981'),
    'state-cancelled': color('#9ca3af'),
    'sticky-gray': color('#d6d6d8', 'Sticky notes (brand-and-ux 5.2).'),
    'sticky-peach': color('#ffd5d7'),
    'sticky-pink': color('#fdd4e3'),
    'sticky-orange': color('#ffe3cd'),
    'sticky-green': color('#c3f0de'),
    'sticky-light-blue': color('#c5eff9'),
    'sticky-dark-blue': color('#c9dafb'),
    'sticky-purple': color('#e3d8fd'),
    'sticky-foreground': color('#18181b'),
  },

  // The twelve label hues. A user picks a hue name, never a hex.
  hue: {
    slate: {
      bg: color('#f8fafc', 'Label hues (brand-and-ux 5.3 rule 6). Users pick a hue name, never a hex. The approved design draws each tag from one ramp: the 50 step fill, 200 border, 800 text and 600 dot, so every text pair clears 7:1 on its own fill.'),
      border: color('#e2e8f0'),
      fg: color('#1e293b'),
      dot: color('#475569'),
    },
    indigo: {
      bg: color('#eef2ff'),
      border: color('#c7d2fe'),
      fg: color('#3730a3'),
      dot: color('#4f46e5'),
    },
    violet: {
      bg: color('#f5f3ff'),
      border: color('#ddd6fe'),
      fg: color('#5b21b6'),
      dot: color('#7c3aed'),
    },
    blue: {
      bg: color('#eff6ff'),
      border: color('#bfdbfe'),
      fg: color('#1e40af'),
      dot: color('#2563eb'),
    },
    cyan: {
      bg: color('#ecfeff'),
      border: color('#a5f3fc'),
      fg: color('#155e75'),
      dot: color('#0891b2'),
    },
    teal: {
      bg: color('#f0fdfa'),
      border: color('#99f6e4'),
      fg: color('#115e59'),
      dot: color('#0d9488'),
    },
    green: {
      bg: color('#f0fdf4'),
      border: color('#bbf7d0'),
      fg: color('#166534'),
      dot: color('#16a34a'),
    },
    lime: {
      bg: color('#f7fee7'),
      border: color('#d9f99d'),
      fg: color('#3f6212'),
      dot: color('#65a30d'),
    },
    amber: {
      bg: color('#fffbeb'),
      border: color('#fde68a'),
      fg: color('#92400e'),
      dot: color('#d97706'),
    },
    orange: {
      bg: color('#fff7ed'),
      border: color('#fed7aa'),
      fg: color('#9a3412'),
      dot: color('#ea580c'),
    },
    rose: {
      bg: color('#fff1f2'),
      border: color('#fecdd3'),
      fg: color('#9f1239'),
      dot: color('#e11d48'),
    },
    pink: {
      bg: color('#fdf2f8'),
      border: color('#fbcfe8'),
      fg: color('#9d174d'),
      dot: color('#db2777'),
    },
  },

  radius: {
    base: dimension('8px', 'Radius (5.6): chips and sidebar items 6, buttons and inputs 8, panels 12, dialogs 16.'),
  },

  shadow: {
    'elevation-sm': shadow('0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.05)', 'Shadows (5.6).'),
    'elevation-lg': shadow('0 12px 34px -10px rgba(16, 24, 40, 0.22)'),
    'focus-ring': shadow('0 0 0 3px rgba(4, 133, 247, 0.14)'),
  },

  ease: {
    rise: cubicBezier('cubic-bezier(0.22, 1, 0.36, 1)'),
  },

  font: {
    sans: fontFamily('"Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'),
    mono: fontFamily('ui-monospace, SFMono-Regular, Menlo, monospace'),
  },

  // Type scale (brand-and-ux 5.4).
  text: {
    label: {
      size: dimension(
        '12px',
        'Type scale (brand-and-ux 5.4). text-micro, the only uppercase style, is a utility at the end of the scale, because a theme token cannot carry text-transform.',
      ),
      'line-height': dimension('16px'),
      weight: weight('500'),
    },
    body: {
      size: dimension('13px'),
      'line-height': dimension('20px'),
    },
    strong: {
      size: dimension('14px'),
      'line-height': dimension('20px'),
      weight: weight('600'),
      'letter-spacing': dimension('-0.01em'),
    },
    read: {
      size: dimension('16px'),
      'line-height': dimension('26px'),
    },
    title: {
      size: dimension('18px'),
      'line-height': dimension('24px'),
      weight: weight('600'),
      'letter-spacing': dimension('-0.015em'),
    },
    page: {
      size: dimension('20px'),
      'line-height': dimension('28px'),
      weight: weight('600'),
      'letter-spacing': dimension('-0.02em'),
    },
    doc: {
      size: dimension('28px'),
      'line-height': dimension('34px'),
      weight: weight('700'),
      'letter-spacing': dimension('-0.02em'),
    },
    metric: {
      size: dimension('28px'),
      'line-height': dimension('31px'),
      weight: weight('700'),
      'letter-spacing': dimension('-0.02em'),
    },
    micro: {
      size: dimension(
        '11px',
        'The only uppercase style. It is a utility rather than a theme token, because a theme token cannot carry text-transform.',
      ),
      'line-height': dimension('16px'),
      weight: weight('600'),
      'letter-spacing': dimension('0.06em'),
    },
  },
} satisfies TokenTree;
