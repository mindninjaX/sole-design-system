'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';
import { InlineError } from './banner.tsx';

// Fields (02-components.png 02.3 and 02.9; 80.3, 90.8): a 12/500 label, 6px, the control,
// then a hint or an inline error. The control gets the id, aria-describedby and
// aria-invalid, so the label and the message belong to it.

export interface FieldProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  /** "Could not ..." sentence; replaces the hint and marks the control invalid. */
  error?: React.ReactNode;
  /** One control: an Input, Textarea, FieldSelectButton or the like. */
  children: React.ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>;
  /** The control's id, when the caller needs to know it. Otherwise the control's own, or a generated one. */
  id?: string;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field({ label, hint, error, children, className, id: idProp, ...props }, ref) {
  const auto = React.useId();
  const own = React.isValidElement(children) ? children.props : undefined;
  const id = idProp ?? own?.id ?? auto;
  const messageId = `${id}-message`;
  // Keeps what the control already points at (a password's rule list, say), adds the message.
  const describedBy = [own?.['aria-describedby'], hint || error ? messageId : undefined].filter(Boolean).join(' ') || undefined;
  const control = React.isValidElement(children)
    ? React.cloneElement(children, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : own?.['aria-invalid'],
      })
    : children;
  return (
    <div ref={ref} className={cn('flex min-w-0 flex-col gap-1.5', className)} {...props}>
      <label htmlFor={id} className="text-label text-foreground">
        {label}
      </label>
      {control}
      {error ? (
        <InlineError id={messageId}>{error}</InlineError>
      ) : (
        hint && (
          <p id={messageId} className="text-label font-normal text-subtle-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
});
Field.displayName = 'Field';

export interface ReadOnlyFieldProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Why it cannot change: "Set by your Google account". */
  note?: React.ReactNode;
}

/** Field/Read only (80.3 Email): the label, then the value and why it cannot change. */
export const ReadOnlyField = React.forwardRef<HTMLDivElement, ReadOnlyFieldProps>(function ReadOnlyField({ label, value, note, className, ...props }, ref) {
  return (
    <div ref={ref} className={cn('min-w-0', className)} {...props}>
      <p className="text-label text-foreground">{label}</p>
      <p className="mt-1 text-body text-foreground">
        {value}
        {note && (
          <span className="text-subtle-foreground">
            <span aria-hidden="true" className="px-2.5">
              ·
            </span>
            {note}
          </span>
        )}
      </p>
    </div>
  );
});
ReadOnlyField.displayName = 'ReadOnlyField';
