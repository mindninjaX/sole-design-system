import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderUi } from '../../../test/render.tsx';
import type { SolePerson } from '../../lib/person.ts';
import { Avatar, AvatarStack } from './avatar.tsx';
import { Banner, InlineError, InlineSuccess } from './banner.tsx';
import { CopyField } from './copy-field.tsx';
import { CountBadge } from './count-badge.tsx';
import { Field, ReadOnlyField } from './field.tsx';
import { Kbd } from './kbd.tsx';
import { LabelTag, LabelTags } from './label-tag.tsx';
import { SoleLockup, SoleMark } from './logo.tsx';
import { PersonChip } from './person-chip.tsx';
import { AvatarRow, PersonHeader } from './person-header.tsx';
import { Pill } from './pill.tsx';
import { CenteredState, EmptyState, ErrorState, NoAccess, SkeletonRows } from './states.tsx';

const ava: SolePerson = { id: 'p-ava', name: 'Ava Thompson' };
type Ref = (el: HTMLElement | null) => void;

// Each part that renders an element: its name, the component (for displayName) and an
// example wired to a callback ref, which any element type accepts.
const PARTS: Array<[string, { displayName?: string }, (ref: Ref) => ReactElement]> = [
  ['Avatar', Avatar, (ref) => <Avatar ref={ref} person={ava} />],
  ['AvatarStack', AvatarStack, (ref) => <AvatarStack ref={ref} people={[ava]} />],
  ['PersonChip', PersonChip, (ref) => <PersonChip ref={ref} person={ava} />],
  ['PersonHeader', PersonHeader, (ref) => <PersonHeader ref={ref} person={ava} />],
  ['AvatarRow', AvatarRow, (ref) => <AvatarRow ref={ref} person={ava} title="Profile picture" />],
  ['Kbd', Kbd, (ref) => <Kbd ref={ref} keys={['mod', 'K']} />],
  ['CountBadge', CountBadge, (ref) => <CountBadge ref={ref}>3</CountBadge>],
  ['Pill', Pill, (ref) => <Pill ref={ref}>Active</Pill>],
  ['Banner', Banner, (ref) => <Banner ref={ref} tone="info">Words</Banner>],
  ['InlineError', InlineError, (ref) => <InlineError ref={ref}>Could not save</InlineError>],
  ['InlineSuccess', InlineSuccess, (ref) => <InlineSuccess ref={ref}>Saved</InlineSuccess>],
  ['Field', Field, (ref) => <Field ref={ref} label="Name"><input /></Field>],
  ['ReadOnlyField', ReadOnlyField, (ref) => <ReadOnlyField ref={ref} label="Email" value="ava@example.com" />],
  ['CopyField', CopyField, (ref) => <CopyField ref={ref} value="abc" label="Link" />],
  ['CenteredState', CenteredState, (ref) => <CenteredState ref={ref}>Words</CenteredState>],
  ['EmptyState', EmptyState, (ref) => <EmptyState ref={ref} title="Nothing here" />],
  ['ErrorState', ErrorState, (ref) => <ErrorState ref={ref} title="Could not load" />],
  ['NoAccess', NoAccess, (ref) => <NoAccess ref={ref} what="this board" />],
  ['SkeletonRows', SkeletonRows, (ref) => <SkeletonRows ref={ref} delay={0} />],
  ['LabelTag', LabelTag, (ref) => <LabelTag ref={ref} name="Payroll" hue="blue" />],
  ['LabelTags', LabelTags, (ref) => <LabelTags ref={ref} labels={[{ id: 'l1', name: 'Payroll', hue: 'blue' }]} />],
  ['SoleMark', SoleMark, (ref) => <SoleMark ref={ref} />],
  ['SoleLockup', SoleLockup, (ref) => <SoleLockup ref={ref} />],
];

describe('refs', () => {
  it.each(PARTS)('%s forwards its ref', (_name, _part, make) => {
    const got: { el: HTMLElement | null } = { el: null };
    const { container } = renderUi(make((el) => void (got.el = el)));
    expect(got.el).toBeInstanceOf(HTMLElement);
    // The ref is the part's own outer element.
    expect(got.el).toBe(container.firstElementChild);
  });

  it.each(PARTS)('%s has a displayName', (name, part) => {
    expect(part.displayName).toBe(name);
  });
});
