# @sole-ui/react

Sole's design system. This first release (0.1.0) holds the design tokens: colour, label hues, type scale, radius, elevation and motion, copied from Sole HQ's stylesheet. The components come in later versions.

Light mode and desktop only.

Documentation and a live view of every token: https://mindninjax.github.io/sole-design-system/

## Install

```sh
npm install @sole-ui/react
```

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
