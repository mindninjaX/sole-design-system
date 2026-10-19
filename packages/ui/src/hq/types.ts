import type { DateOnly } from '../lib/dates.ts';
import type { Hue } from '../lib/hue.ts';
import type { SolePerson } from '../lib/person.ts';

// The words Sole HQ's database uses, written out so the parts need no HQ import. HQ's own
// types (`@shared/db`) are string unions with the same members, so a value of one is
// assignable to the other with no mapping.

/** Where a work item's state sits in its life. Colour and icon are by group, never by the state's own hex. */
export type StateGroup = 'backlog' | 'unstarted' | 'started' | 'completed' | 'cancelled';

export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'No priority',
};

/** Review state of a wiki page. `due` means due within 14 days. */
export type ReviewState = 'current' | 'due' | 'overdue' | 'unknown';

/** The kinds of custom property a work board can track. */
export type PropertyType = 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'person' | 'checkbox' | 'url';

/** The colours a sticky note can take. */
export type StickyColour = 'gray' | 'peach' | 'pink' | 'orange' | 'green' | 'light-blue' | 'dark-blue' | 'purple';

/**
 * Everything WorkItemRow and BoardCard read about a work item, resolved: the fields of HQ's
 * `WorkItemView` that the two parts use. HQ builds one from a view; a demo writes one by hand.
 */
export interface WorkItemSummary {
  /** "ENG-14". */
  key: string;
  /** Where the item opens, "/b/ENG/14". */
  href: string;
  title: string;
  priority: Priority;
  /** Not loaded yet or deleted: the parts draw the item as Todo, with no state name. */
  state?: { name: string; group: StateGroup } | null;
  labels: Array<{ id: string; name: string; hue: Hue }>;
  dueDate: DateOnly | null;
  /** In the order they were added. */
  assignees: SolePerson[];
  /** Completed or cancelled: the due date is a plain fact and never red. */
  isDone: boolean;
}

/** A board's name and emoji, the two things BoardChip draws. */
export interface BoardSummary {
  id: string;
  name: string;
  /** Data, not copy: none, or an empty one, draws a folder. */
  emoji: string | null;
  /** "ENG". Optional: the parts link by `href`, not by key. */
  key?: string;
}
