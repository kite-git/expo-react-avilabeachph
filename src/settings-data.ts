import { Bell, Buildings, CreditCard, Tag, Wallet, type Icon } from 'phosphor-react-native';
import { useTransactions } from './store';
import { peso } from './theme';

export type SettingsRow = { label: string; value?: string; toggle?: boolean };
export type SettingsPage = { slug: string; title: string; icon: Icon; summary: string; note?: string; rows: SettingsRow[] };

const EDIT_NOTE = 'To change these, edit the table in the Supabase dashboard.';

// Pages are built from the database so Settings always matches what the forms offer.
export function useSettingsGroups(): { group: string; pages: SettingsPage[] }[] {
  const { resort, categories, methods } = useTransactions();
  const incoming = categories.filter((c) => c.kind === 'in');
  const outgoing = categories.filter((c) => c.kind === 'out');
  const notSet = 'Not set';

  return [
    {
      group: 'Resort',
      pages: [
        {
          slug: 'profile',
          title: 'Resort profile',
          icon: Buildings,
          summary: resort?.name ?? 'Avila Beach PH',
          note: 'The opening balance is what the resort had before the first entry in this app. ' + EDIT_NOTE,
          rows: [
            { label: 'Name', value: resort?.name ?? notSet },
            { label: 'Address', value: resort?.address || notSet },
            { label: 'TIN', value: resort?.tin || notSet },
            { label: 'Contact number', value: resort?.contact || notSet },
            { label: 'Opening balance', value: peso(resort?.opening_balance ?? 0) },
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
          summary: `${incoming.length} sources`,
          note: 'These appear as choices when you record a cash in. ' + EDIT_NOTE,
          rows: incoming.map((c) => ({ label: c.name })),
        },
        {
          slug: 'expense-categories',
          title: 'Expense categories',
          icon: Tag,
          summary: `${outgoing.length} categories`,
          note: 'These appear as choices when you add an expense. ' + EDIT_NOTE,
          rows: outgoing.map((c) => ({ label: c.name })),
        },
        {
          slug: 'payment-methods',
          title: 'Payment methods',
          icon: CreditCard,
          summary: methods.map((m) => m.name).join(', '),
          note: EDIT_NOTE,
          rows: methods.map((m) => ({ label: m.name })),
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
          summary: 'Not sent yet',
          note: 'Preview only. These switches don’t send notifications yet.',
          rows: [
            { label: 'Daily summary at 8:00 PM', toggle: true },
            { label: 'Expense over ₱20,000', toggle: true },
            { label: 'Every booking payment', toggle: false },
          ],
        },
      ],
    },
  ];
}
