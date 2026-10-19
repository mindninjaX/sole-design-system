import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderUi } from '../../../test/render.tsx';
import { Badge } from './badge.tsx';
import { Button } from './button.tsx';
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
import { Toggle } from './toggle.tsx';
import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx';

// A callback ref typed for HTMLElement is accepted by every part's narrower element type.
type Ref = (el: HTMLElement | null) => void;

// The parts a consumer hands to Radix's asChild (a tooltip trigger around a Button) need
// their ref on React 18, where a function component cannot take `ref` as a prop.
const PARTS: [string, (ref: Ref) => ReactElement][] = [
  ['Button', (ref) => <Button ref={ref}>Save</Button>],
  ['Input', (ref) => <Input ref={ref} />],
  ['Textarea', (ref) => <Textarea ref={ref} />],
  ['Badge', (ref) => <Badge ref={ref}>New</Badge>],
  ['Skeleton', (ref) => <Skeleton ref={ref} />],
  ['Separator', (ref) => <Separator ref={ref} />],
  ['Label', (ref) => <Label ref={ref}>Name</Label>],
  ['Checkbox', (ref) => <Checkbox ref={ref} aria-label="Agree" />],
  ['Switch', (ref) => <Switch ref={ref} aria-label="Notify me" />],
  [
    'TabsList',
    (ref) => (
      <Tabs defaultValue="a">
        <TabsList ref={ref}>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>
    ),
  ],
  [
    'TabsTrigger',
    (ref) => (
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger ref={ref} value="a">
            A
          </TabsTrigger>
        </TabsList>
      </Tabs>
    ),
  ],
  [
    'TabsContent',
    (ref) => (
      <Tabs defaultValue="a">
        <TabsContent ref={ref} value="a">
          Content
        </TabsContent>
      </Tabs>
    ),
  ],
  ['Tabs', (ref) => <Tabs ref={ref} defaultValue="a" />],
  ['ScrollArea', (ref) => <ScrollArea ref={ref}>Content</ScrollArea>],
  ['Toggle', (ref) => <Toggle ref={ref}>B</Toggle>],
  [
    'ToggleGroup',
    (ref) => (
      <ToggleGroup ref={ref} type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    ),
  ],
  [
    'ToggleGroupItem',
    (ref) => (
      <ToggleGroup type="single">
        <ToggleGroupItem ref={ref} value="a">
          A
        </ToggleGroupItem>
      </ToggleGroup>
    ),
  ],
  ['Toaster', (ref) => <Toaster ref={ref} />],
];

describe('refs', () => {
  it.each(PARTS)('%s forwards its ref', (_name, make) => {
    let node: HTMLElement | null = null;
    renderUi(
      make((el) => {
        node = el;
      }),
    );
    expect(node).toBeInstanceOf(HTMLElement);
  });
});
