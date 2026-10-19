'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { SearchIcon } from 'lucide-react';
import { cn } from '../../lib/cn.ts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog.tsx';

const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    data-slot="command"
    className={cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', className)}
    {...props}
  />
));
Command.displayName = 'Command';

// Cmd+K (20.2-command-palette-cmd-k.png): 640px, anchored near the top so it does not
// jump as results change, on a lighter overlay than a dialog's, with a footer that
// names the keys. Pass `footer` to replace the default Move and Open hints.
// A dialog root renders no element, so CommandDialog takes no ref.
function CommandDialog({
  title = 'Command palette',
  description = 'Search, or jump to a screen',
  children,
  className,
  showCloseButton = false,
  footer,
  shouldFilter,
  commandValue,
  onCommandValueChange,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  /** false when the caller filters and ranks the items itself (server search results). */
  shouldFilter?: boolean;
  /** The highlighted item's value, when the caller controls it. */
  commandValue?: string;
  onCommandValueChange?: (value: string) => void;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        overlayClassName="bg-black/20"
        className={cn(
          'top-[12dvh] max-h-[calc(88dvh-32px)] max-w-[640px] translate-y-0 gap-0 overflow-hidden rounded-xl p-0',
          className,
        )}
        showCloseButton={showCloseButton}
      >
        <Command
          shouldFilter={shouldFilter}
          value={commandValue}
          onValueChange={onCommandValueChange}
          className="rounded-xl [&_[cmdk-group]]:px-1.5 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0"
        >
          {children}
        </Command>
        {footer ?? (
          <div
            data-slot="command-footer"
            className="flex h-9 shrink-0 items-center gap-2 border-t border-border bg-muted px-3.5 text-label font-normal text-subtle-foreground"
          >
            <CommandKey>↑↓</CommandKey>
            <span className="mr-2">Move</span>
            <CommandKey>Enter</CommandKey>
            <span>Open</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** A key in the palette's own chrome: the same box as Kbd, without its import. */
function CommandKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-sm border border-border bg-card px-1 font-sans text-[11px] leading-none font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

// The ref goes to the input; the search icon and `trailing` sit in a wrapper around it.
const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & { trailing?: React.ReactNode }
>(({ className, trailing, ...props }, ref) => (
  <div data-slot="command-input-wrapper" className="flex h-12 shrink-0 items-center gap-2.5 border-b border-border px-4">
    <SearchIcon className="size-4 shrink-0 text-subtle-foreground" />
    <CommandPrimitive.Input
      ref={ref}
      data-slot="command-input"
      className={cn(
        'flex h-full w-full bg-transparent text-[15px] outline-hidden placeholder:text-subtle-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
    {trailing}
  </div>
));
CommandInput.displayName = 'CommandInput';

const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    data-slot="command-list"
    className={cn('max-h-[min(400px,calc(88dvh-120px))] scroll-py-1.5 overflow-x-hidden overflow-y-auto py-1.5', className)}
    {...props}
  />
));
CommandList.displayName = 'CommandList';

const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    data-slot="command-empty"
    className="py-6 text-center text-body text-muted-foreground"
    {...props}
  />
));
CommandEmpty.displayName = 'CommandEmpty';

const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    data-slot="command-group"
    className={cn(
      'overflow-hidden text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-1.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:leading-4 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-subtle-foreground',
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = 'CommandGroup';

const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} data-slot="command-separator" className={cn('-mx-1 h-px bg-border', className)} {...props} />
));
CommandSeparator.displayName = 'CommandSeparator';

const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    data-slot="command-item"
    className={cn(
      "group/item relative flex h-8 cursor-default items-center gap-2 rounded-md px-2.5 text-body outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='text-'])]:text-muted-foreground data-[selected=true]:[&_svg:not([class*='text-'])]:text-accent-foreground",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = 'CommandItem';

const CommandShortcut = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="command-shortcut"
      className={cn('ml-auto shrink-0 text-label font-normal text-subtle-foreground', className)}
      {...props}
    />
  ),
);
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
