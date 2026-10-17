import { Bell, Buildings, CreditCard, Tag, UsersThree, Wallet, type Icon } from 'phosphor-react-native';
import { expenses, incomeSources, paymentMethods } from './data';

export type SettingsRow = { label: string; value?: string; toggle?: boolean };
export type SettingsPage = { slug: string; title: string; icon: Icon; summary: string; note?: string; rows: SettingsRow[] };

// Mock settings until they come from Supabase.
export const settingsGroups: { group: string; pages: SettingsPage[] }[] = [
  {
    group: 'Resort',
    pages: [
      {
        slug: 'profile',
        title: 'Resort profile',
        icon: Buildings,
        summary: 'Avila Beach PH',
        rows: [
          { label: 'Name', value: 'Avila Beach PH' },
          { label: 'Address', value: 'Brgy. Poblacion, sample address' },
          { label: 'TIN', value: '482-917-305-000' },
          { label: 'Contact number', value: '+63 917 482 6150' },
          { label: 'Currency', value: 'Philippine peso (PHP)' },
        ],
      },
    ],
  },
  {
    group: 'Money',
    pages: [
      {
        slug: 'income-sources',
        title: 'Income sources',
        icon: Wallet,
        summary: `${incomeSources.length} sources`,
        note: 'These appear as choices when you record a cash in.',
        rows: incomeSources.map((s) => ({ label: s.label })),
      },
      {
        slug: 'expense-categories',
        title: 'Expense categories',
        icon: Tag,
        summary: `${expenses.length} categories`,
        note: 'These appear as choices when you add an expense.',
        rows: expenses.map((e) => ({ label: e.label })),
      },
      {
        slug: 'payment-methods',
        title: 'Payment methods',
        icon: CreditCard,
        summary: paymentMethods.join(', '),
        rows: paymentMethods.map((m) => ({ label: m })),
      },
    ],
  },
  {
    group: 'Team',
    pages: [
      {
        slug: 'staff',
        title: 'Staff access',
        icon: UsersThree,
        summary: '4 people',
        note: 'Owners and managers can record and edit transactions. Front desk can record cash in only.',
        rows: [
          { label: 'Marisol Avila', value: 'Owner' },
          { label: 'Paolo Dizon', value: 'Manager' },
          { label: 'Jen Bautista', value: 'Front desk' },
          { label: 'Ramon Cruz', value: 'Front desk' },
        ],
      },
    ],
  },
  {
    group: 'App',
    pages: [
      {
        slug: 'notifications',
        title: 'Notifications',
        icon: Bell,
        summary: '2 on',
        rows: [
          { label: 'Daily summary at 8:00 PM', toggle: true },
          { label: 'Expense over ₱20,000', toggle: true },
          { label: 'Every booking payment', toggle: false },
        ],
      },
    ],
  },
];

export const settingsPages = settingsGroups.flatMap((g) => g.pages);
