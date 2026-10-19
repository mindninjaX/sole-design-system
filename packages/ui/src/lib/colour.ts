/** FNV-1a, 32 bit. Stable across runtimes, used to pick colours from ids. */
export function fnv1a(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Dialer's 8 avatar colours (brand-and-ux 5.12). Hashed on the person id, so a rename keeps the colour. */
export const AVATAR_COLOURS = ['#0485F7', '#0EA5A4', '#D97706', '#DB2777', '#2563EB', '#7C3AED', '#059669', '#EA580C'] as const;

export function avatarColour(id: string): string {
  return AVATAR_COLOURS[fnv1a(id) % AVATAR_COLOURS.length]!;
}

/** Board colours: 8 muted two-stop gradients (brand-and-ux 5.13), for the header strip and chip dot. */
export const BOARD_GRADIENTS = [
  ['#3B5B8C', '#263B5C'],
  ['#2F6E68', '#1E4844'],
  ['#6B4C7A', '#463151'],
  ['#8A5A2B', '#5A3A1C'],
  ['#4E6B3A', '#334527'],
  ['#4A4E8C', '#31345C'],
  ['#8A4257', '#5A2B39'],
  ['#46607A', '#2E3F50'],
] as const;

export function boardGradient(id: string): readonly [string, string] {
  return BOARD_GRADIENTS[fnv1a(id) % BOARD_GRADIENTS.length]!;
}
