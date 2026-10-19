'use client';

import { Calendar, CircleChevronDown, Hash, Link as LinkIcon, ListChecks, SquareCheck, Type, User } from 'lucide-react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/cn.ts';
import type { PropertyType } from './types.ts';

// One glyph per kind of custom property (0014), in the settings list and the type picker,
// so "Sprint" reads as a choice and "Story points" as a number at a glance.

const ICONS: Record<PropertyType, LucideIcon> = {
  text: Type,
  number: Hash,
  date: Calendar,
  select: CircleChevronDown,
  multi_select: ListChecks,
  person: User,
  checkbox: SquareCheck,
  url: LinkIcon,
};

export interface PropertyTypeIconProps extends Omit<LucideProps, 'ref'> {
  type: PropertyType;
}

export const PropertyTypeIcon = React.forwardRef<SVGSVGElement, PropertyTypeIconProps>(function PropertyTypeIcon(
  { type, className, ...props },
  ref,
) {
  const Icon = ICONS[type];
  return <Icon strokeWidth={1.8} {...props} ref={ref} aria-hidden="true" className={cn('size-3.5 shrink-0 text-muted-foreground', className)} data-type-icon={type} />;
});
PropertyTypeIcon.displayName = 'PropertyTypeIcon';
