import { describe, expect, it } from 'vitest';
import { AVATAR_COLOURS, avatarColour, boardGradient, BOARD_GRADIENTS } from './colour.ts';
import { cn } from './cn.ts';
import { HUES } from './hue.ts';
import { FORMER_MEMBER, initials, personName } from './person.ts';

describe('person', () => {
  it('takes initials from the first two words', () => {
    expect(initials('Ava Thompson')).toBe('AT');
    expect(initials('ava.t')).toBe('A');
    expect(initials('')).toBe('?');
  });
  it('names a missing person as a former member', () => {
    expect(personName(null)).toBe(FORMER_MEMBER);
    expect(personName({ id: 'p1', name: 'Noah Patel' })).toBe('Noah Patel');
  });
});

describe('colour', () => {
  it('picks a stable avatar colour from the id', () => {
    expect(AVATAR_COLOURS).toContain(avatarColour('p1'));
    expect(avatarColour('p1')).toBe(avatarColour('p1'));
  });
  it('picks a stable board gradient', () => {
    expect(BOARD_GRADIENTS).toContainEqual(boardGradient('b1'));
  });
});

describe('cn and hues', () => {
  it('keeps a text size next to a text colour', () => {
    expect(cn('text-label', 'text-muted-foreground')).toBe('text-label text-muted-foreground');
  });
  it('lists the twelve hues', () => {
    expect(HUES).toHaveLength(12);
  });
});
