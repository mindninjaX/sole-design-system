import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The type scale (brand-and-ux 5.4) adds text-micro, text-label and friends. Without
// telling tailwind-merge they are font sizes it files them as colours, and
// cn('text-label', 'text-muted-foreground') silently drops the size.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['micro', 'label', 'body', 'strong', 'read', 'title', 'page', 'doc', 'metric'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
