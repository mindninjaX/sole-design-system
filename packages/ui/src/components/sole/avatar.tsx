'use client';

import * as React from 'react';
import { Bot } from 'lucide-react';
import { cn } from '../../lib/cn.ts';
import { avatarColour } from '../../lib/colour.ts';
import { initials, personName, type SolePerson } from '../../lib/person.ts';

// Initials on a tint, the colour hashed from the person id over Dialer's 8 so a
// rename never changes it (brand-and-ux 5.12). A person who has set a picture shows it
// instead, in the same circle. The initials are also the fallback when the
// picture will not load, so a broken link never leaves a hole.

export type AvatarSize = 16 | 20 | 24 | 32 | 40 | 48 | 64;

/** The picture in the circle, or the initials when there is none or it did not load. */
function Face({ url, name }: { url: string | null | undefined; name: string }) {
  // The address that failed, so a new picture (a new address) gets its own try.
  const [failed, setFailed] = React.useState<string | null>(null);
  if (url && failed !== url) {
    return <img src={url} alt="" draggable={false} decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(url)} className="size-full rounded-full object-cover" />;
  }
  return <>{initials(name)}</>;
}

export interface AvatarProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> {
  /** `null` or `undefined` draws a "?", for someone who has gone. A bot (`isBot`) draws the bot icon. */
  person: SolePerson | null | undefined;
  size?: AvatarSize;
  /** Set when the avatar stands alone, so screen readers hear the name. */
  label?: boolean;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({ person, size = 20, label, className, style, ...props }, ref) {
  const name = personName(person);
  const box = { width: size, height: size, fontSize: Math.round(size * 0.36) };
  const a11y = label ? { role: 'img' as const, 'aria-label': name, title: name } : { 'aria-hidden': true as const };

  if (!person || person.isBot) {
    return (
      <span
        ref={ref}
        {...a11y}
        style={{ ...box, ...style }}
        className={cn('inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-neutral-soft text-subtle-foreground select-none', className)}
        {...props}
      >
        {person?.isBot ? <Bot size={Math.round(size * 0.6)} strokeWidth={1.8} aria-hidden="true" /> : '?'}
      </span>
    );
  }
  const colour = avatarColour(person.id);
  return (
    <span
      ref={ref}
      {...a11y}
      data-colour={colour}
      style={{ ...box, backgroundColor: `${colour}18`, borderColor: `${colour}33`, color: colour, ...style }}
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border leading-none font-bold tracking-tight select-none', className)}
      {...props}
    >
      <Face url={person.avatarUrl} name={name} />
    </span>
  );
});
Avatar.displayName = 'Avatar';

export interface AvatarStackProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> {
  people: SolePerson[];
  /** How many avatars to show before "+n". */
  max?: number;
  size?: AvatarSize;
}

/** Up to `max` avatars overlapping, then "+n". */
export const AvatarStack = React.forwardRef<HTMLSpanElement, AvatarStackProps>(function AvatarStack({ people, max = 2, size = 20, className, ...props }, ref) {
  if (!people.length) return null;
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  const names = people.map((p) => personName(p)).join(', ');
  return (
    <span ref={ref} role="img" aria-label={names} title={names} className={cn('inline-flex shrink-0 items-center', className)} {...props}>
      {shown.map((p, i) => (
        <Avatar key={p.id} person={p} size={size} className={cn('ring-2 ring-card', i > 0 && '-ml-1')} />
      ))}
      {extra > 0 && (
        <span
          style={{ height: size, minWidth: size, fontSize: Math.round(size * 0.45) }}
          className="-ml-1 inline-flex items-center justify-center rounded-full border border-border bg-neutral-soft px-1 font-semibold text-neutral-text ring-2 ring-card"
        >
          +{extra}
        </span>
      )}
    </span>
  );
});
AvatarStack.displayName = 'AvatarStack';
