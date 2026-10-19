# @sole-ui/react

Sole's design system for React and Tailwind CSS v4: the design tokens (colour, label hues, type scale, radius, elevation, motion) and the shared and Sole HQ components, typed, tested and copied from Sole HQ with the same look and behaviour.

Light mode and desktop only. React 18.3 and 19.

Documentation, every part live with its variants, and every token: https://mindninjax.github.io/sole-design-system/

## Install

```sh
npm install @sole-ui/react
```

## Components

Peer dependencies: `react`, `react-dom` (18.3 or 19), `radix-ui` and, for the styles, `tailwindcss` v4.

```sh
npm install @sole-ui/react radix-ui
```

Wrap the app in `SoleProvider` once. It gives the parts your router's link, the work clock and the tooltip provider:

```tsx
import { Link } from 'react-router';
import { Button, SoleProvider, Toaster } from '@sole-ui/react';
import { StatePill } from '@sole-ui/react/hq';

<SoleProvider
  linkComponent={({ href, ...props }) => <Link to={href} {...props} />}
  timeZone="Australia/Sydney"
  personHref={(person) => `/people/${person.id}`}
>
  <Button>Save</Button>
  <StatePill state={{ name: 'In progress', group: 'started' }} />
  <Toaster />
</SoleProvider>
```

- `@sole-ui/react` holds the shared shadcn parts (`Button`, `Dialog`, `Select`, `Tabs`, ...), the Sole parts (`Avatar`, `PersonChip`, `Pill`, `Table`, `FilterChip`, ...) and the app shell pieces (`AppFrame`, `Sidebar`, `TopBar`, `CommandPalette`).
- `@sole-ui/react/hq` holds the parts only Sole HQ uses (`StateIcon`, `DueChip`, `WorkItemRow`, `BoardCard`, ...).
- The parts are presentational: no router, no fetching. People are `SolePerson` (`id`, `name`, `avatarUrl?`, `isBot?`); links go through `SoleLink`. Pass `now` to `SoleProvider` to pin the clock in demos and tests.
- Each part that draws an element forwards its ref, and every module starts with `'use client'`, so they work in Next.js too.

## With Tailwind CSS v4

Tailwind v4 is an optional peer dependency (`^4.1.0`). In your main stylesheet:

```css
@import "tailwindcss";
@import "@sole-ui/react/styles.css";
```

That gives you:

- the Sole colours as utilities (`bg-primary`, `text-muted-foreground`, `border-border`), the label hues (`.hue-blue` with `bg-tag-bg`, `text-tag-fg`) and the radius, shadow and type scales (`text-body`, `text-strong`, `text-micro`);
- Inter Variable as the sans font, through `@fontsource-variable/inter`, which installs with the package;
- the base layer: page background and text colour, tabular numbers on `time` and `kbd`, and no motion for people who asked their system for less.

## Without Tailwind

`tokens.css` is plain CSS custom properties on `:root`, plus the `.hue-*` classes. It works in any project:

```css
@import "@sole-ui/react/tokens.css";

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--elevation-sm);
}
```

(The `@theme` and `@utility` blocks in the file are for Tailwind. Other tools ignore them.)

## In JavaScript

```js
import { tokens } from "@sole-ui/react";

tokens.color.primary.$value; // "#0270d6"
```

`tokens` is the token tree as a plain object, typed so that `tokens.color.primary` is checked by the compiler.

## tokens.json

`@sole-ui/react/tokens.json` is the same tree in the [DTCG](https://www.designtokens.org/) format (`$value`, `$type`, `$description`), for design tools and other generators:

```js
import tokens from "@sole-ui/react/tokens.json" with { type: "json" };
```

## Source

https://github.com/mindninjaX/sole-design-system. The values never change here first: if the look changes, it changes in Sole HQ, and the tokens follow.
