import { Bell, CalendarX, Inbox, Zap } from 'lucide-react';
import {
  Avatar,
  AvatarRow,
  AvatarStack,
  Banner,
  CenteredState,
  CopyField,
  CountBadge,
  EmptyState,
  ErrorState,
  Field,
  HUES,
  InlineError,
  InlineSuccess,
  Kbd,
  LabelTag,
  LabelTags,
  NoAccess,
  PersonChip,
  PersonHeader,
  Pill,
  ReadOnlyField,
  SkeletonRows,
  SoleLockup,
  SoleMark,
  SoleProvider,
  type AvatarSize,
  type BannerTone,
  type PillTone,
  type SolePerson,
} from '@sole-ui/react';
import type { DocSection } from '../doc.tsx';
import { Canvas, Row, Stage } from '../doc.tsx';
import { NOW, ava, bot, grace, leo, mia, noah, oliver, zara } from '../demo/people.ts';

// A picture as a data: address, so the page never touches the network.
const PICTURE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#f59e0b"/><circle cx="32" cy="26" r="12" fill="#fde68a"/><path d="M8 64c2-16 14-22 24-22s22 6 24 22z" fill="#b45309"/></svg>',
)}`;
const BROKEN = 'data:image/png;base64,AAAA';
const withPicture = (p: SolePerson): SolePerson => ({ ...p, avatarUrl: PICTURE });
const withBrokenPicture = (p: SolePerson): SolePerson => ({ ...p, avatarUrl: BROKEN });

const SIZES: AvatarSize[] = [16, 20, 24, 32, 40, 48, 64];
const TONES: BannerTone[] = ['danger', 'warning', 'success', 'info'];
const PILL_TONES: PillTone[] = ['success', 'warning', 'neutral', 'info'];
const SAMPLE_LABELS = ['Payroll', 'Billing', 'Onboarding', 'Support', 'Reports', 'Security', 'Launch', 'Research', 'Finance', 'Legal', 'Design', 'People'];

function SizeRow({ label, person }: { label: string; person: SolePerson | null }) {
  return (
    <Row label={label}>
      {SIZES.map((size) => (
        <span key={size} className="inline-flex flex-col items-center gap-1">
          <Avatar person={person} size={size} label />
          <span className="text-micro text-subtle-foreground">{size}</span>
        </span>
      ))}
    </Row>
  );
}

export const sections: DocSection[] = [
  {
    id: 'avatar',
    title: 'Avatar',
    group: 'Sole',
    summary: 'A person as a circle: their picture, or initials on a tint hashed from their id. Bots show an icon and someone who has gone shows a question mark. AvatarStack overlaps several.',
    importLine: "import { Avatar, AvatarStack } from '@sole-ui/react'",
    render: () => (
      <>
        <Stage>
          <SizeRow label="Person" person={ava} />
          <SizeRow label="Bot" person={bot} />
          <SizeRow label="No person" person={null} />
          <SizeRow label="With picture" person={withPicture(mia)} />
          <SizeRow label="Picture will not load" person={withBrokenPicture(noah)} />
        </Stage>
        <h4 className="mt-6 mb-2 text-label text-muted-foreground">AvatarStack</h4>
        <Stage>
          <Row label="Two (default max)">
            <AvatarStack people={[ava, noah]} />
          </Row>
          <Row label="Three, max 2">
            <AvatarStack people={[ava, noah, mia]} />
          </Row>
          <Row label="Five, max 3">
            <AvatarStack people={[ava, noah, mia, leo, zara]} max={3} />
          </Row>
          <Row label="With pictures and a bot">
            <AvatarStack people={[withPicture(ava), bot, withPicture(grace)]} max={3} size={32} />
          </Row>
          <Row label="Sizes">
            {SIZES.map((size) => (
              <AvatarStack key={size} people={[oliver, grace, leo]} max={3} size={size} />
            ))}
          </Row>
        </Stage>
      </>
    ),
  },
  {
    id: 'person-chip',
    title: 'PersonChip',
    group: 'Sole',
    summary: 'A 20px avatar and the name. It links through the provider\'s personHref; a bot and someone who has gone never link.',
    importLine: "import { PersonChip } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <SoleProvider now={() => NOW} timeZone="Australia/Sydney" personHref={() => '#person-chip'}>
          <Row label="Links (personHref)">
            <PersonChip person={ava} />
            <PersonChip person={withPicture(mia)} />
          </Row>
          <Row label="link={false}">
            <PersonChip person={noah} link={false} />
          </Row>
          <Row label="Bot, no link">
            <PersonChip person={bot} />
          </Row>
          <Row label="Former member">
            <PersonChip person={null} />
          </Row>
        </SoleProvider>
        <Row label="No personHref">
          <PersonChip person={leo} />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'person-header',
    title: 'PersonHeader',
    group: 'Sole',
    summary: 'The top of a person\'s page: a 64px avatar, the name, an optional Admin pill, a meta line and actions. AvatarRow is the picture line on a profile form.',
    importLine: "import { PersonHeader, AvatarRow } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="Name only">
          <PersonHeader person={ava} className="w-full" />
        </Row>
        <Row label="Admin, meta, actions">
          <PersonHeader
            person={withPicture(noah)}
            admin
            meta={['Payroll lead', 'noah@example.com', 'Perth, 2 hours behind Sydney']}
            actions={<Pill tone="success">Linked to Slack</Pill>}
            className="w-full"
          />
        </Row>
        <Row label="Bot">
          <PersonHeader person={bot} meta={['Slack bot']} className="w-full" />
        </Row>
        <Row label="AvatarRow">
          <AvatarRow
            person={mia}
            title="Profile picture"
            body="A square picture works best."
            actions={
              <>
                <button type="button" className="rounded-lg border border-border bg-background px-3 py-1 text-label">
                  Change
                </button>
                <button type="button" className="rounded-lg px-3 py-1 text-label text-muted-foreground">
                  Remove
                </button>
              </>
            }
            className="w-full"
          />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'kbd',
    title: 'Kbd',
    group: 'Sole',
    summary: 'A keyboard hint. Pass "mod" for the command key: it reads Cmd on a Mac and Ctrl elsewhere.',
    importLine: "import { Kbd, keysText } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="mod + K">
          <Kbd keys={['mod', 'K']} />
        </Row>
        <Row label="Single key">
          <Kbd keys={['/']} />
          <Kbd keys={['Esc']} />
          <Kbd keys={['Enter']} />
        </Row>
        <Row label="Combination">
          <Kbd keys={['mod', 'Shift', 'P']} />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'count-badge',
    title: 'CountBadge',
    group: 'Sole',
    summary: 'A small round count, such as the Inbox badge. There is no red variant: red is for deadlines.',
    importLine: "import { CountBadge } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="tint (default)">
          <CountBadge>3</CountBadge>
          <CountBadge>12</CountBadge>
          <CountBadge label="2 unread mentions">@ 2</CountBadge>
          <CountBadge>99+</CountBadge>
        </Row>
        <Row label="muted">
          <CountBadge variant="muted">3</CountBadge>
          <CountBadge variant="muted">12</CountBadge>
          <CountBadge variant="muted">99+</CountBadge>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'pill',
    title: 'Pill',
    group: 'Sole',
    summary: 'A status chip. Green is done or fine, amber is waiting on someone, grey is a plain fact, blue is something to act on.',
    importLine: "import { Pill } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="Tones">
          {PILL_TONES.map((tone) => (
            <Pill key={tone} tone={tone}>
              {tone}
            </Pill>
          ))}
        </Row>
        <Row label="With an icon">
          {PILL_TONES.map((tone) => (
            <Pill key={tone} tone={tone} icon={<Zap aria-hidden="true" />}>
              {tone}
            </Pill>
          ))}
        </Row>
        <Row label="Truncates">
          <Pill className="max-w-32">Must change password before continuing</Pill>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'banner',
    title: 'Banner',
    group: 'Sole',
    summary: 'A soft box for something the whole screen needs to say, with room for actions. InlineError and InlineSuccess are the one-line versions under a field.',
    importLine: "import { Banner, InlineError, InlineSuccess } from '@sole-ui/react'",
    render: () => (
      <>
        <Stage>
          {TONES.map((tone) => (
            <Row key={tone} label={tone}>
              <Banner tone={tone} className="w-full">
                {tone === 'danger' ? 'Could not save. The server did not answer. Your text is still here.' : `This is a ${tone} message with one sentence.`}
              </Banner>
            </Row>
          ))}
          <Row label="With actions">
            <Banner
              tone="warning"
              className="w-full"
              actions={
                <>
                  <button type="button" className="h-8 rounded-lg border border-border bg-background px-3 text-body">
                    Change date
                  </button>
                  <button type="button" className="h-8 rounded-lg bg-primary px-3 text-body text-primary-foreground">
                    Mark as reviewed
                  </button>
                </>
              }
            >
              This page was due for review on 15 Sep.
            </Banner>
          </Row>
          <Row label="Own icon">
            <Banner tone="warning" icon={CalendarX} className="w-full">
              The review is due today.
            </Banner>
          </Row>
        </Stage>
        <h4 className="mt-6 mb-2 text-label text-muted-foreground">Inline messages</h4>
        <Stage>
          <Row label="InlineError">
            <InlineError>That email or password is not right.</InlineError>
          </Row>
          <Row label="InlineSuccess">
            <InlineSuccess>The key works. It answered in 1.2 s.</InlineSuccess>
          </Row>
        </Stage>
      </>
    ),
  },
  {
    id: 'field',
    title: 'Field',
    group: 'Sole',
    summary: 'A label, one control and a hint or an error. The control gets the id and the aria attributes, so the label and the message belong to it. ReadOnlyField shows a value that cannot change.',
    importLine: "import { Field, ReadOnlyField } from '@sole-ui/react'",
    render: () => (
      <Stage width={420}>
        <Row label="Plain">
          <Field label="Full name" className="w-full">
            <input className="h-8 w-full rounded-md border border-input bg-field px-2.5 text-body" defaultValue="Ava Thompson" />
          </Field>
        </Row>
        <Row label="With help">
          <Field label="New password" hint="At least 12 characters." className="w-full">
            <input type="password" className="h-8 w-full rounded-md border border-input bg-field px-2.5 text-body" />
          </Field>
        </Row>
        <Row label="With error">
          <Field label="Work email" error="Could not find that email." className="w-full">
            <input className="h-8 w-full rounded-md border border-input bg-field px-2.5 text-body aria-invalid:border-destructive" defaultValue="ava@example" />
          </Field>
        </Row>
        <Row label="Read only">
          <ReadOnlyField label="Email" value="ava@example.com" note="Set by your account" />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'copy-field',
    title: 'CopyField',
    group: 'Sole',
    summary: 'A value in a field with a Copy button inside. After a copy the button says Copied for two seconds. `secret` shows a password in a monospace face.',
    importLine: "import { CopyField } from '@sole-ui/react'",
    render: () => (
      <Stage width={480}>
        <Row label="Plain">
          <CopyField value="https://example.com/join/harbour-accounting" label="Sign-up link" className="w-full" />
        </Row>
        <Row label="secret">
          <CopyField value="Harbour-violet-7-kettle" secret label="Temporary password" className="w-full" />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'states',
    title: 'States',
    group: 'Sole',
    summary: 'Empty, error, no access and loading. An error never looks like an empty list. EmptyState, ErrorState, NoAccess, SkeletonRows and CenteredState.',
    importLine: "import { EmptyState, ErrorState, NoAccess, SkeletonRows, CenteredState } from '@sole-ui/react'",
    render: () => (
      <div className="flex flex-col gap-6">
        <Canvas>
          <EmptyState icon={Inbox} title="Nothing is assigned to you right now." body="Work that is given to you shows up here." action={<button type="button" className="h-8 rounded-lg bg-secondary px-3 text-body">Open the boards</button>} />
        </Canvas>
        <Canvas>
          <ErrorState title="Could not load the wiki" onRetry={() => {}} />
        </Canvas>
        <Canvas>
          <NoAccess what="the Payroll board" />
        </Canvas>
        <Canvas>
          <h4 className="mb-2 text-label text-muted-foreground">framed, in CenteredState</h4>
          <CenteredState className="min-h-0 py-4">
            <div className="flex flex-wrap items-start justify-center gap-4">
              <EmptyState framed icon={Bell} title="No notifications" body="You are up to date." />
              <ErrorState framed title="Could not load notifications" onRetry={() => {}} />
              <NoAccess framed what="this page" />
            </div>
          </CenteredState>
        </Canvas>
        <Canvas>
          <h4 className="mb-2 text-label text-muted-foreground">SkeletonRows: row, then page</h4>
          <SkeletonRows rows={3} delay={0} />
          <SkeletonRows rows={2} variant="page" delay={0} className="mt-4" />
        </Canvas>
      </div>
    ),
  },
  {
    id: 'label-tag',
    title: 'LabelTag',
    group: 'Sole',
    summary: 'A label with a dot in one of 12 named hues. The same name is the same colour everywhere. LabelTags shows a few and "+n".',
    importLine: "import { LabelTag, LabelTags } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="All 12 hues">
          {HUES.map((hue, i) => (
            <LabelTag key={hue} name={SAMPLE_LABELS[i] ?? hue} hue={hue} />
          ))}
        </Row>
        <Row label="Truncates">
          <LabelTag name="A very long label name that does not fit" hue="indigo" />
        </Row>
        <Row label="LabelTags, max 2">
          <LabelTags
            labels={[
              { id: 'l1', name: 'Payroll', hue: 'blue' },
              { id: 'l2', name: 'Billing', hue: 'amber' },
              { id: 'l3', name: 'Onboarding', hue: 'teal' },
            ]}
          />
        </Row>
        <Row label="LabelTags, max 3">
          <LabelTags
            max={3}
            labels={[
              { id: 'l1', name: 'Payroll', hue: 'blue' },
              { id: 'l2', name: 'Billing', hue: 'amber' },
              { id: 'l3', name: 'Onboarding', hue: 'teal' },
            ]}
          />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'logo',
    title: 'Logo',
    group: 'Sole',
    summary: 'The Sole mark and the lockup beside the product name. The mark is carried inside the package, so no file is needed in public.',
    importLine: "import { SoleMark, SoleLockup } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="SoleMark">
          {[16, 20, 24, 32, 48].map((size) => (
            <SoleMark key={size} size={size} />
          ))}
        </Row>
        <Row label="SoleLockup 20">
          <SoleLockup />
        </Row>
        <Row label="SoleLockup 24">
          <SoleLockup size={24} />
        </Row>
        <Row label="SoleLockup 32">
          <SoleLockup size={32} />
        </Row>
        <Row label="name">
          <SoleLockup name="Sole Dialer" />
        </Row>
      </Stage>
    ),
  },
];
