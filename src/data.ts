import {
  Bed,
  Confetti,
  Drop,
  ForkKnife,
  Lightning,
  Receipt,
  UsersThree,
  type Icon,
} from 'phosphor-react-native';

// Mock data until a real ledger is wired in.
export const balance = 2846310.42;
export const income = 1204880.0;
export const expenses: { label: string; amount: number; icon: Icon }[] = [
  { label: 'Payroll', amount: 268900.0, icon: UsersThree },
  { label: 'Food and beverage', amount: 148720.5, icon: ForkKnife },
  { label: 'Utilities', amount: 121384.65, icon: Lightning },
  { label: 'Maintenance', amount: 73432.0, icon: Drop },
];
export const incomeSources: { label: string; icon: Icon }[] = [
  { label: 'Room bookings', icon: Bed },
  { label: 'Restaurant', icon: ForkKnife },
  { label: 'Walk-ins', icon: Receipt },
  { label: 'Events', icon: Confetti },
];
export const paymentMethods = ['Cash', 'GCash', 'Maya', 'Bank transfer'];

export type Activity = {
  id: string;
  title: string;
  when: string;
  amount: number;
  icon: Icon;
  category: string;
  method: string;
};
export const activity: Activity[] = [
  { id: 's1', title: 'Villa 3 booking, Reyes family', when: 'Today, 9:42 AM', amount: 38500.0, icon: Bed, category: 'Room bookings', method: 'Bank transfer' },
  { id: 's2', title: 'Meralco electric bill', when: 'Today, 8:15 AM', amount: -42816.37, icon: Lightning, category: 'Utilities', method: 'Bank transfer' },
  { id: 's3', title: 'Restaurant sales', when: 'Yesterday', amount: 27940.0, icon: ForkKnife, category: 'Restaurant', method: 'Cash' },
  { id: 's4', title: 'Pool chemicals restock', when: 'Yesterday', amount: -6215.5, icon: Drop, category: 'Maintenance', method: 'GCash' },
  { id: 's5', title: 'Housekeeping payroll', when: 'Oct 15', amount: -118400.0, icon: UsersThree, category: 'Payroll', method: 'Bank transfer' },
  { id: 's6', title: 'Cabana 2 walk-in, GCash', when: 'Oct 14', amount: 4800.0, icon: Receipt, category: 'Walk-ins', method: 'GCash' },
];

// Mock six-month history; October matches the Overview figures above.
export const monthly = [
  { month: 'May', income: 986420.5, expenses: 571208.35 },
  { month: 'Jun', income: 1112305.0, expenses: 598640.8 },
  { month: 'Jul', income: 1348760.25, expenses: 655912.4 },
  { month: 'Aug', income: 1287115.75, expenses: 641370.1 },
  { month: 'Sep', income: 1041890.0, expenses: 583227.65 },
  { month: 'Oct', income: 1204880.0, expenses: 612437.15 },
];
export const incomeBySource = [
  { label: 'Room bookings', amount: 742350.0 },
  { label: 'Restaurant', amount: 286415.5 },
  { label: 'Walk-ins', amount: 98624.5 },
  { label: 'Events', amount: 77490.0 },
];
