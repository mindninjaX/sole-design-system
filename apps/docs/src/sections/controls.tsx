import {
  Badge,
  Button,
  Calendar,
  Checkbox,
  Input,
  Label,
  ScrollArea,
  Separator,
  Skeleton,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  toast,
} from '@sole-ui/react';
import { PlusIcon, BoldIcon, ItalicIcon, UnderlineIcon, ListIcon, LayoutGridIcon } from 'lucide-react';
import { Canvas, Row, Stage } from '../doc.tsx';
import type { DocSection } from '../doc.tsx';

const BUTTON_VARIANTS = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
const BUTTON_SIZES = ['xs', 'sm', 'default', 'lg'] as const;
const ICON_SIZES = ['icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const;
const BADGE_VARIANTS = ['default', 'outline', 'accent', 'danger', 'warning', 'success', 'overdue'] as const;
const SEPTEMBER = new Date(2026, 8);

export const sections: DocSection[] = [
  {
    id: 'button',
    title: 'Button',
    group: 'Shared',
    summary: 'The action control. Six variants in four text sizes and four icon sizes; asChild turns a link or any element into a button.',
    importLine: "import { Button, buttonVariants } from '@sole-ui/react'",
    render: () => (
      <Stage>
        {BUTTON_VARIANTS.map((variant) => (
          <Row key={variant} label={variant}>
            {BUTTON_SIZES.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {size}
              </Button>
            ))}
            {ICON_SIZES.map((size) => (
              <Button key={size} variant={variant} size={size} aria-label={size}>
                <PlusIcon />
              </Button>
            ))}
          </Row>
        ))}
        <Row label="Disabled">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              {variant}
            </Button>
          ))}
        </Row>
        <Row label="With icon">
          <Button>
            <PlusIcon /> New work item
          </Button>
          <Button variant="outline">
            <PlusIcon /> Add filter
          </Button>
        </Row>
        <Row label="As a link">
          <Button asChild variant="outline">
            <a href="#button">Open the page</a>
          </Button>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'badge',
    title: 'Badge',
    group: 'Shared',
    summary: 'A 22px chip that labels data. It reads as a label, never as a button.',
    importLine: "import { Badge } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="Variants">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </Row>
      </Stage>
    ),
  },
  {
    id: 'calendar',
    title: 'Calendar',
    group: 'Shared',
    summary: 'A month grid for picking a day or a range. Built on react-day-picker.',
    importLine: "import { Calendar } from '@sole-ui/react'",
    render: () => (
      <Canvas>
        <div className="flex flex-wrap gap-6">
          <div>
            <div className="mb-1 text-label text-muted-foreground">Single day</div>
            <Calendar mode="single" month={SEPTEMBER} selected={new Date(2026, 8, 15)} className="rounded-lg border border-border" />
          </div>
          <div>
            <div className="mb-1 text-label text-muted-foreground">Range</div>
            <Calendar
              mode="range"
              month={SEPTEMBER}
              selected={{ from: new Date(2026, 8, 8), to: new Date(2026, 8, 12) }}
              className="rounded-lg border border-border"
            />
          </div>
        </div>
      </Canvas>
    ),
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    group: 'Shared',
    summary: 'A tick box for one yes or no choice.',
    importLine: "import { Checkbox } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="Unchecked">
          <Checkbox aria-label="Unchecked" />
        </Row>
        <Row label="Checked">
          <Checkbox aria-label="Checked" defaultChecked />
        </Row>
        <Row label="Disabled">
          <Checkbox aria-label="Disabled" disabled />
          <Checkbox aria-label="Disabled and checked" disabled defaultChecked />
        </Row>
        <Row label="Invalid">
          <Checkbox aria-label="Invalid" aria-invalid />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'input',
    title: 'Input',
    group: 'Shared',
    summary: 'A single line of text. Pair it with a Label.',
    importLine: "import { Input } from '@sole-ui/react'",
    render: () => (
      <Stage width={420}>
        <Row label="Default">
          <Input aria-label="Default" placeholder="Search work items" />
        </Row>
        <Row label="With a value">
          <Input aria-label="With a value" defaultValue="Harbour Accounting" />
        </Row>
        <Row label="Disabled">
          <Input aria-label="Disabled" disabled defaultValue="Read only for now" />
        </Row>
        <Row label="Invalid">
          <Input aria-label="Invalid" aria-invalid defaultValue="not an email" />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'label',
    title: 'Label',
    group: 'Shared',
    summary: 'The name for a field. It dims when the control beside it is disabled.',
    importLine: "import { Label } from '@sole-ui/react'",
    render: () => (
      <Stage width={420}>
        <Row label="Enabled">
          <div className="flex w-full flex-col gap-1.5">
            <Label htmlFor="docs-label-enabled">Firm name</Label>
            <Input id="docs-label-enabled" placeholder="Harbour Accounting" />
          </div>
        </Row>
        <Row label="Disabled">
          <div className="flex w-full flex-col gap-1.5">
            <Input id="docs-label-disabled" className="peer order-2" disabled placeholder="Northside Payroll" />
            <Label htmlFor="docs-label-disabled" className="order-1">
              Firm name
            </Label>
          </div>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'scroll-area',
    title: 'ScrollArea',
    group: 'Shared',
    summary: 'A scrolling box with a slim scrollbar. Give it a height.',
    importLine: "import { ScrollArea, ScrollBar } from '@sole-ui/react'",
    render: () => (
      <Stage width={320}>
        <Row label="Vertical">
          <ScrollArea className="h-32 w-full rounded-md border border-border">
            <div className="flex flex-col gap-2 p-3 text-body">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i}>Work item {i + 1}</div>
              ))}
            </div>
          </ScrollArea>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'separator',
    title: 'Separator',
    group: 'Shared',
    summary: 'A hairline between groups, horizontal or vertical.',
    importLine: "import { Separator } from '@sole-ui/react'",
    render: () => (
      <Stage width={420}>
        <Row label="Horizontal">
          <Separator />
        </Row>
        <Row label="Vertical">
          <div className="flex h-6 items-center gap-3 text-body">
            Boards
            <Separator orientation="vertical" />
            People
            <Separator orientation="vertical" />
            Settings
          </div>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    group: 'Shared',
    summary: 'A pulsing bar that holds the place of content while it loads.',
    importLine: "import { Skeleton } from '@sole-ui/react'",
    render: () => (
      <Stage width={420}>
        <Row label="Bars">
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="w-full" />
            <Skeleton className="w-2/3" />
            <Skeleton className="w-1/3" />
          </div>
        </Row>
        <Row label="Avatar and text">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="w-1/2" />
            <Skeleton className="w-3/4" />
          </div>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'toast',
    title: 'Toast',
    group: 'Shared',
    summary: 'Short messages at the bottom right. Mount Toaster once, then call toast from anywhere.',
    importLine: "import { Toaster, toast } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="Success">
          <Button variant="outline" onClick={() => toast.success('Saved', { description: 'Your changes are in.' })}>
            Show success
          </Button>
        </Row>
        <Row label="Error">
          <Button
            variant="outline"
            onClick={() => toast.error('Could not save that change', { description: 'The server did not answer. Nothing changed.', duration: Infinity })}
          >
            Show error
          </Button>
        </Row>
        <Row label="Info">
          <Button variant="outline" onClick={() => toast.info('Ava Thompson joined the board')}>
            Show info
          </Button>
        </Row>
        <Row label="With an action">
          <Button
            variant="outline"
            onClick={() => toast.success('Moved to Done', { action: { label: 'Undo', onClick: () => {} } })}
          >
            Show with action
          </Button>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'switch',
    title: 'Switch',
    group: 'Shared',
    summary: 'An on and off setting that takes effect straight away.',
    importLine: "import { Switch } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="Off">
          <Switch aria-label="Off" />
        </Row>
        <Row label="On">
          <Switch aria-label="On" defaultChecked />
        </Row>
        <Row label="Small">
          <Switch aria-label="Small off" size="sm" />
          <Switch aria-label="Small on" size="sm" defaultChecked />
        </Row>
        <Row label="Disabled">
          <Switch aria-label="Disabled off" disabled />
          <Switch aria-label="Disabled on" disabled defaultChecked />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'tabs',
    title: 'Tabs',
    group: 'Shared',
    summary: 'Switches between views of the same page. An underline marks the open tab.',
    importLine: "import { Tabs, TabsList, TabsTrigger, TabsContent } from '@sole-ui/react'",
    render: () => (
      <Canvas width={520}>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="files">
              <PlusIcon /> Files
            </TabsTrigger>
            <TabsTrigger value="archived" disabled>
              Archived
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-body">
            The overview of the Payroll board.
          </TabsContent>
          <TabsContent value="activity" className="text-body">
            Recent changes by Noah Patel and Mia Rossi.
          </TabsContent>
          <TabsContent value="files" className="text-body">
            No files yet.
          </TabsContent>
        </Tabs>
      </Canvas>
    ),
  },
  {
    id: 'textarea',
    title: 'Textarea',
    group: 'Shared',
    summary: 'Several lines of text. It grows with what is typed.',
    importLine: "import { Textarea } from '@sole-ui/react'",
    render: () => (
      <Stage width={420}>
        <Row label="Default">
          <Textarea aria-label="Default" placeholder="Add a note" />
        </Row>
        <Row label="With a value">
          <Textarea aria-label="With a value" defaultValue={'Checked with Harbour Accounting.\nWaiting on their reply.'} />
        </Row>
        <Row label="Disabled">
          <Textarea aria-label="Disabled" disabled defaultValue="Locked while the board is archived." />
        </Row>
        <Row label="Invalid">
          <Textarea aria-label="Invalid" aria-invalid defaultValue="" placeholder="A reason is required" />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'toggle',
    title: 'Toggle',
    group: 'Shared',
    summary: 'A button that stays pressed. Use it for a view or format option.',
    importLine: "import { Toggle, toggleVariants } from '@sole-ui/react'",
    render: () => (
      <Stage>
        {(['default', 'outline'] as const).map((variant) => (
          <Row key={variant} label={variant}>
            {(['sm', 'default', 'lg'] as const).map((size) => (
              <Toggle key={size} variant={variant} size={size} aria-label={`${variant} ${size}`}>
                <BoldIcon />
              </Toggle>
            ))}
            <Toggle variant={variant} aria-label={`${variant} on`} defaultPressed>
              <ItalicIcon />
            </Toggle>
            <Toggle variant={variant} aria-label={`${variant} disabled`} disabled>
              <UnderlineIcon />
            </Toggle>
          </Row>
        ))}
      </Stage>
    ),
  },
  {
    id: 'toggle-group',
    title: 'ToggleGroup',
    group: 'Shared',
    summary: 'A row of toggles. Single keeps one on; multiple lets any number be on.',
    importLine: "import { ToggleGroup, ToggleGroupItem } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="Single">
          <ToggleGroup type="single" defaultValue="list" aria-label="View">
            <ToggleGroupItem value="list" aria-label="List">
              <ListIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="board" aria-label="Board">
              <LayoutGridIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </Row>
        <Row label="Single, outline">
          <ToggleGroup type="single" variant="outline" defaultValue="board" aria-label="View, outline">
            <ToggleGroupItem value="list">List</ToggleGroupItem>
            <ToggleGroupItem value="board">Board</ToggleGroupItem>
          </ToggleGroup>
        </Row>
        <Row label="Multiple">
          <ToggleGroup type="multiple" variant="outline" defaultValue={['bold', 'italic']} aria-label="Format">
            <ToggleGroupItem value="bold" aria-label="Bold">
              <BoldIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <ItalicIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline">
              <UnderlineIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </Row>
        <Row label="Disabled">
          <ToggleGroup type="single" disabled defaultValue="list" aria-label="View, disabled">
            <ToggleGroupItem value="list">List</ToggleGroupItem>
            <ToggleGroupItem value="board">Board</ToggleGroupItem>
          </ToggleGroup>
        </Row>
      </Stage>
    ),
  },
];
