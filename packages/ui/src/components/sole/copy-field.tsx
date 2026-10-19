'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../../lib/cn.ts';
import { Button } from '../ui/button.tsx';

// Copy field (02.9; 90.2, 90.3, 90.7): the value in a 40px field with a Copy button
// inside on the right. `secret` shows a temporary password in a monospace face at 15px,
// so O and 0 and l and 1 read apart (JetBrains Mono is not installed; the system mono
// stack stands in). After a copy the button says "Copied" for 2 seconds.

export interface CopyFieldProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  value: string;
  /** A password shown once: monospace, 15px. */
  secret?: boolean;
  /** What is copied, for screen readers: "Temporary password", "Sign-up link". */
  label: string;
  onCopied?: () => void;
}

export const CopyField = React.forwardRef<HTMLDivElement, CopyFieldProps>(function CopyField({ value, secret = false, label, onCopied, className, ...props }, ref) {
  const id = React.useId();
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopied?.();
    } catch {
      // The clipboard can be refused (an insecure context, a denied permission). The
      // value stays selectable, so select it for a manual copy.
      const el = document.getElementById(id);
      if (el) window.getSelection()?.selectAllChildren(el);
    }
  };

  return (
    <div
      ref={ref}
      data-copy-field={secret ? 'secret' : 'plain'}
      className={cn('flex h-10 min-w-0 items-center gap-2 rounded-lg border border-input bg-field pr-[5px] pl-3', className)}
      {...props}
    >
      <span
        id={id}
        className={cn('min-w-0 flex-1 truncate text-foreground select-all', secret ? 'font-mono text-[15px] leading-5' : 'text-body')}
      >
        {value}
      </span>
      <Button type="button" variant="outline" size="sm" onClick={copy} className="gap-2 bg-background px-[11px] shadow-none" aria-label={`Copy ${label.toLocaleLowerCase('en-AU')}`}>
        {copied ? <Check aria-hidden="true" className="size-4 text-success" /> : <Copy aria-hidden="true" className="size-4" />}
        {copied ? 'Copied' : 'Copy'}
      </Button>
      {/* The button's name stays "Copy ...", so the change is said here. */}
      <span role="status" className="sr-only">
        {copied ? `${label} copied` : ''}
      </span>
    </div>
  );
});
CopyField.displayName = 'CopyField';
