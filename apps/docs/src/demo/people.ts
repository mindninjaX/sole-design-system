import type { SolePerson } from '@sole-ui/react';

// Made-up people, firms and boards for every example. Never a real name or email.

export const people: SolePerson[] = [
  { id: 'p-ava', name: 'Ava Thompson' },
  { id: 'p-noah', name: 'Noah Patel' },
  { id: 'p-mia', name: 'Mia Rossi' },
  { id: 'p-leo', name: 'Leo Nguyen' },
  { id: 'p-zara', name: 'Zara Ahmed' },
  { id: 'p-oliver', name: 'Oliver Brooks' },
  { id: 'p-grace', name: 'Grace Kim' },
  { id: 'p-bot', name: 'Taskmate', isBot: true },
];

export const [ava, noah, mia, leo, zara, oliver, grace, bot] = people as [
  SolePerson, SolePerson, SolePerson, SolePerson, SolePerson, SolePerson, SolePerson, SolePerson,
];

export const firms = ['Harbour Accounting', 'Northside Payroll', 'Bright & Co Bookkeeping'] as const;

export const boards = [
  { id: 'b-eng', name: 'Engineering', emoji: '💻', key: 'ENG' },
  { id: 'b-cs', name: 'Customer success', emoji: '🤝', key: 'CS' },
  { id: 'b-pay', name: 'Payroll', emoji: '💸', key: 'PAY' },
] as const;

/** The fixed "today": Tuesday 29 Sep 2026, 3:00 PM in Sydney. */
export const NOW = new Date('2026-09-29T05:00:00Z');
export const TODAY = '2026-09-29';
