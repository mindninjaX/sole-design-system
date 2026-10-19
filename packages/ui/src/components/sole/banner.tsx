'use client';

import * as React from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn.ts';

// Banners and inline messages (02-components.png 02.4; 60.5, 60.8, 70.6, 90.8, 90.9).
// A banner is a soft box in one of four tones with a 16px icon, the sentence, and room
// for actions on the right (32px buttons: Button/Outline or Button/Secondary, then the
// primary). Inline messages are one line under a field, 12px, icon and text in the tone.

export type BannerTone = 'danger' | 'warning' | 'success' | 'info';

const TONES: Record<BannerTone, { box: string; icon: string; Icon: LucideIcon }> = {
  danger: { box: 'border-danger-border bg-danger-soft text-danger-text', icon: 'text-danger-text', Icon: CircleAlert },
  warning: { box: 'border-warning-border bg-warning-soft text-warning-text', icon: 'text-warning-text', Icon: TriangleAlert },
  success: { box: 'border-success-border bg-success-soft text-success-text', icon: 'text-success', Icon: CircleCheck },
  info: { box: 'border-brand/30 bg-accent text-accent-foreground', icon: 'text-accent-foreground', Icon: Info },
};

export interface BannerProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'role'> {
  tone: BannerTone;
  /** Overrides the tone's icon, e.g. CalendarX for a review that is due. */
  icon?: LucideIcon;
  /** Buttons on the right, 32px: the quiet one first, the main action last. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** Defaults to alert for danger and status otherwise. */
  role?: 'alert' | 'status';
}

export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(function Banner({ tone, icon: IconProp, actions, children, role, className, ...props }, ref) {
  const t = TONES[tone];
  const Icon = IconProp ?? t.Icon;
  return (
    <div
      ref={ref}
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
      data-banner={tone}
      className={cn('flex items-center rounded-lg border py-2 pr-3 pl-2.5', t.box, className)}
      {...props}
    >
      <Icon size={16} strokeWidth={1.8} aria-hidden="true" className={cn('mr-2.5 shrink-0', t.icon)} />
      <div className="min-w-0 flex-1 py-px text-body">{children}</div>
      {actions && <div className="ml-3 flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
});
Banner.displayName = 'Banner';

export interface InlineErrorProps extends React.ComponentPropsWithoutRef<'p'> {
  children: React.ReactNode;
}

/** One line under a field when something failed: "That email or password is not right." */
export const InlineError = React.forwardRef<HTMLParagraphElement, InlineErrorProps>(function InlineError({ children, className, ...props }, ref) {
  return (
    <p ref={ref} role="alert" className={cn('flex items-start gap-1.5 text-label text-danger-text', className)} {...props}>
      <CircleAlert size={14} strokeWidth={1.8} aria-hidden="true" className="mt-px shrink-0" />
      <span className="min-w-0">{children}</span>
    </p>
  );
});
InlineError.displayName = 'InlineError';

export interface InlineSuccessProps extends React.ComponentPropsWithoutRef<'p'> {
  children: React.ReactNode;
}

/** One line after an action that worked: "The key works. Gemini answered in 1.2 s." */
export const InlineSuccess = React.forwardRef<HTMLParagraphElement, InlineSuccessProps>(function InlineSuccess({ children, className, ...props }, ref) {
  return (
    <p ref={ref} role="status" className={cn('flex items-start gap-1.5 text-label text-success-text', className)} {...props}>
      <CircleCheck size={14} strokeWidth={1.8} aria-hidden="true" className="mt-px shrink-0 text-success" />
      <span className="min-w-0">{children}</span>
    </p>
  );
});
InlineSuccess.displayName = 'InlineSuccess';
