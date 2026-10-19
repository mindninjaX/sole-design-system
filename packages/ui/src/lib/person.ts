/** The one neutral shape for a person. HQ, the CRM and the Dialer each map their own rows to it. */
export interface SolePerson {
  id: string;
  name: string;
  avatarUrl?: string | null;
  isBot?: boolean;
}

/** What a part shows for someone who has left (brand-and-ux 5.12). */
export const FORMER_MEMBER = 'Former member';

/**
 * First letter of the first two words: "Ava Thompson" is AT. A name that is still an
 * email local part is one word, so "ava.t" is A.
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((w) => [...w][0] ?? '');
  return letters.join('').toUpperCase() || '?';
}

/** The name a part shows: the person's name, or "Former member" when there is no person. */
export function personName(person: SolePerson | null | undefined): string {
  if (!person) return FORMER_MEMBER;
  return person.name.trim() || FORMER_MEMBER;
}
