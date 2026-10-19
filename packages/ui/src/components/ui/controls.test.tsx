import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderUi } from '../../../test/render.tsx';
import { Badge } from './badge.tsx';
import { Button, buttonVariants } from './button.tsx';
import { Calendar } from './calendar.tsx';
import { Checkbox } from './checkbox.tsx';
import { Input } from './input.tsx';
import { Label } from './label.tsx';
import { ScrollArea } from './scroll-area.tsx';
import { Separator } from './separator.tsx';
import { Skeleton } from './skeleton.tsx';
import { Toaster } from './sonner.tsx';
import { Switch } from './switch.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.tsx';
import { Textarea } from './textarea.tsx';
import { Toggle, toggleVariants } from './toggle.tsx';
import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx';

afterEach(() => {
  act(() => void toast.dismiss());
});

describe('Button', () => {
  it.each([
    ['default', 'bg-primary'],
    ['destructive', 'bg-destructive'],
    ['outline', 'border-border'],
    ['secondary', 'bg-secondary'],
    ['ghost', 'text-muted-foreground'],
    ['link', 'text-link'],
  ] as const)('renders the %s variant with its classes', (variant, cls) => {
    renderUi(<Button variant={variant}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass(cls);
    expect(button).toHaveAttribute('data-slot', 'button');
    expect(button).toHaveAttribute('data-variant', variant);
  });

  it.each([
    ['default', 'h-8'],
    ['xs', 'h-6'],
    ['sm', 'h-7'],
    ['lg', 'h-9'],
    ['icon', 'size-8'],
    ['icon-xs', 'size-6'],
    ['icon-sm', 'size-7'],
    ['icon-lg', 'size-9'],
  ] as const)('renders the %s size with its classes', (size, cls) => {
    renderUi(<Button size={size}>Go</Button>);
    const button = screen.getByRole('button', { name: 'Go' });
    expect(button).toHaveClass(cls);
    expect(button).toHaveAttribute('data-size', size);
  });

  it('turns an outline icon button white (the compound variant)', () => {
    renderUi(
      <Button variant="outline" size="icon" aria-label="More">
        +
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'More' })).toHaveClass('bg-card');
  });

  it('is disabled and does not click when disabled', async () => {
    const onClick = vi.fn();
    renderUi(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    await userEvent.setup().click(button).catch(() => {});
    expect(onClick).not.toHaveBeenCalled();
  });

  it('clicks when enabled', async () => {
    const onClick = vi.fn();
    renderUi(<Button onClick={onClick}>Save</Button>);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('passes its classes to the child with asChild', () => {
    renderUi(
      <Button asChild variant="outline">
        <a href="/boards">Boards</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Boards' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/boards');
    expect(link).toHaveAttribute('data-slot', 'button');
    expect(link).toHaveClass('border-border');
  });

  it('exports buttonVariants as a class function', () => {
    expect(buttonVariants({ variant: 'destructive', size: 'lg' })).toContain('bg-destructive');
    expect(buttonVariants({ variant: 'destructive', size: 'lg' })).toContain('h-9');
  });
});

describe('Badge', () => {
  it.each([
    ['default', 'bg-neutral-soft'],
    ['outline', 'border-border'],
    ['accent', 'bg-accent'],
    ['danger', 'bg-danger-soft'],
    ['warning', 'bg-warning-soft'],
    ['success', 'bg-success-soft'],
    ['overdue', 'bg-overdue'],
  ] as const)('renders the %s variant', (variant, cls) => {
    renderUi(<Badge variant={variant}>Label</Badge>);
    const badge = screen.getByText('Label');
    expect(badge).toHaveClass(cls);
    expect(badge).toHaveAttribute('data-slot', 'badge');
    expect(badge).toHaveAttribute('data-variant', variant);
  });
});

describe('Checkbox', () => {
  it('toggles by click', async () => {
    const onCheckedChange = vi.fn();
    renderUi(<Checkbox aria-label="Agree" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole('checkbox', { name: 'Agree' });
    expect(box).toHaveAttribute('data-state', 'unchecked');
    await userEvent.setup().click(box);
    expect(box).toHaveAttribute('data-state', 'checked');
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    await userEvent.setup().click(box);
    expect(box).toHaveAttribute('data-state', 'unchecked');
  });

  it('toggles by keyboard', async () => {
    const user = userEvent.setup();
    renderUi(<Checkbox aria-label="Agree" />);
    const box = screen.getByRole('checkbox', { name: 'Agree' });
    await user.tab();
    expect(box).toHaveFocus();
    await user.keyboard(' ');
    expect(box).toHaveAttribute('data-state', 'checked');
  });

  it('does not toggle when disabled', async () => {
    renderUi(<Checkbox aria-label="Agree" disabled />);
    const box = screen.getByRole('checkbox', { name: 'Agree' });
    await userEvent.setup().click(box);
    expect(box).toHaveAttribute('data-state', 'unchecked');
  });
});

describe('Switch', () => {
  it('toggles by click', async () => {
    renderUi(<Switch aria-label="Notify me" />);
    const toggle = screen.getByRole('switch', { name: 'Notify me' });
    expect(toggle).toHaveAttribute('data-state', 'unchecked');
    await userEvent.setup().click(toggle);
    expect(toggle).toHaveAttribute('data-state', 'checked');
  });

  it('toggles by keyboard', async () => {
    const user = userEvent.setup();
    renderUi(<Switch aria-label="Notify me" />);
    const toggle = screen.getByRole('switch', { name: 'Notify me' });
    await user.tab();
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('data-state', 'checked');
  });

  it('carries its size', () => {
    renderUi(<Switch aria-label="Small" size="sm" />);
    expect(screen.getByRole('switch', { name: 'Small' })).toHaveAttribute('data-size', 'sm');
  });
});

describe('Tabs', () => {
  const tabs = (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview content</TabsContent>
      <TabsContent value="activity">Activity content</TabsContent>
    </Tabs>
  );

  it('switches by click', async () => {
    renderUi(tabs);
    expect(screen.getByText('Overview content')).toBeInTheDocument();
    expect(screen.queryByText('Activity content')).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Activity' }));
    expect(screen.getByText('Activity content')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute('data-state', 'active');
  });

  it('switches by arrow key', async () => {
    const user = userEvent.setup();
    renderUi(tabs);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute('data-state', 'active');
  });
});

describe('Toggle and ToggleGroup', () => {
  it('toggles a single toggle', async () => {
    renderUi(<Toggle aria-label="Bold">B</Toggle>);
    const toggle = screen.getByRole('button', { name: 'Bold' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.setup().click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggleVariants({ variant: 'outline' })).toContain('border-input');
  });

  it('keeps one item on in single mode', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <ToggleGroup type="single" onValueChange={onValueChange}>
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="board">Board</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole('radio', { name: 'List' }));
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('data-state', 'on');
    await user.click(screen.getByRole('radio', { name: 'Board' }));
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('data-state', 'off');
    expect(screen.getByRole('radio', { name: 'Board' })).toHaveAttribute('data-state', 'on');
    expect(onValueChange).toHaveBeenLastCalledWith('board');
  });

  it('keeps several items on in multiple mode', async () => {
    const user = userEvent.setup();
    renderUi(
      <ToggleGroup type="multiple" variant="outline">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole('button', { name: 'Bold' }));
    await user.click(screen.getByRole('button', { name: 'Italic' }));
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('data-variant', 'outline');
  });
});

describe('Input and Textarea', () => {
  it('accepts typing in an input', async () => {
    renderUi(<Input aria-label="Name" placeholder="Name" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    await userEvent.setup().type(input, 'Ava Thompson');
    expect(input).toHaveValue('Ava Thompson');
    expect(input).toHaveAttribute('data-slot', 'input');
  });

  it('accepts typing in a textarea', async () => {
    renderUi(<Textarea aria-label="Note" />);
    const area = screen.getByRole('textbox', { name: 'Note' });
    await userEvent.setup().type(area, 'First line');
    expect(area).toHaveValue('First line');
    expect(area).toHaveAttribute('data-slot', 'textarea');
  });

  it('passes aria-invalid and disabled through', () => {
    renderUi(
      <>
        <Input aria-label="Email" aria-invalid disabled />
        <Textarea aria-label="Reason" aria-invalid disabled />
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInvalid();
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Reason' })).toBeInvalid();
    expect(screen.getByRole('textbox', { name: 'Reason' })).toBeDisabled();
  });
});

describe('Label, Separator, Skeleton and ScrollArea', () => {
  it('Label names its input', () => {
    renderUi(
      <>
        <Label htmlFor="firm">Firm</Label>
        <Input id="firm" />
      </>,
    );
    expect(screen.getByLabelText('Firm')).toBeInTheDocument();
  });

  it('Separator is decorative by default and a separator role when not', () => {
    renderUi(
      <>
        <Separator data-testid="plain" />
        <Separator data-testid="semantic" decorative={false} orientation="vertical" />
      </>,
    );
    expect(screen.getByTestId('plain')).toHaveAttribute('role', 'none');
    expect(screen.getByTestId('semantic')).toHaveAttribute('role', 'separator');
    expect(screen.getByTestId('semantic')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('Skeleton hides itself from screen readers', () => {
    renderUi(<Skeleton data-testid="bar" />);
    expect(screen.getByTestId('bar')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('bar')).toHaveClass('animate-pulse');
  });

  it('ScrollArea renders its children in a viewport', () => {
    renderUi(
      <ScrollArea className="h-20">
        <p>Inside the area</p>
      </ScrollArea>,
    );
    expect(screen.getByText('Inside the area').closest('[data-slot="scroll-area-viewport"]')).not.toBeNull();
  });
});

describe('Calendar', () => {
  it('renders September 2026 and reports a selected day', async () => {
    const onSelect = vi.fn();
    renderUi(<Calendar mode="single" month={new Date(2026, 8)} onSelect={onSelect} />);
    expect(screen.getByText('September 2026')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: /September 15th/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    const picked = onSelect.mock.calls[0]?.[0] as Date;
    expect([picked.getFullYear(), picked.getMonth(), picked.getDate()]).toEqual([2026, 8, 15]);
  });
});

describe('Toaster', () => {
  it('shows a toast', async () => {
    renderUi(<Toaster />);
    act(() => void toast.success('Saved', { description: 'Your changes are in.' }));
    expect(await screen.findByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Your changes are in.')).toBeInTheDocument();
  });
});
