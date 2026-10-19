'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';
import type { Hue } from '../../lib/hue.ts';

// A label: 20px, a 4px dot, one of 12 named hues (brand-and-ux 5.3 rule 6, 5.5).
// Categories get a soft tint; the same name is the same colour everywhere.

export interface LabelTagProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> {
  name: string;
  hue: Hue;
}

export const LabelTag = React.forwardRef<HTMLSpanElement, LabelTagProps>(function LabelTag({ name, hue, className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={cn(
        `hue-${hue}`,
        'inline-flex h-5 max-w-40 shrink-0 items-center gap-[5px] rounded-md border border-tag-border bg-tag-bg px-[7px] text-[11.5px] leading-none font-medium text-tag-fg',
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-tag-dot" />
      <span className="truncate">{name}</span>
    </span>
  );
});
LabelTag.displayName = 'LabelTag';

export interface LabelTagsProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> {
  labels: Array<{ id: string; name: string; hue: Hue }>;
  /** How many labels to show before "+n". */
  max?: number;
}

/** Up to `max` labels, then "+n" in the same shape. */
export const LabelTags = React.forwardRef<HTMLSpanElement, LabelTagsProps>(function LabelTags({ labels, max = 2, className, ...props }, ref) {
  if (!labels.length) return null;
  const shown = labels.slice(0, max);
  const extra = labels.length - shown.length;
  return (
    <span ref={ref} className={cn('inline-flex min-w-0 items-center gap-1', className)} {...props}>
      {shown.map((l) => (
        <LabelTag key={l.id} name={l.name} hue={l.hue} />
      ))}
      {extra > 0 && (
        <span
          title={labels.slice(max).map((l) => l.name).join(', ')}
          className="inline-flex h-5 shrink-0 items-center rounded-md border border-border px-1.5 text-[11.5px] font-medium text-muted-foreground"
        >
          +{extra}
        </span>
      )}
    </span>
  );
});
LabelTags.displayName = 'LabelTags';
