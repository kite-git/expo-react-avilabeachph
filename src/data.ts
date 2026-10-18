import {
  Bed,
  Confetti,
  Drop,
  ForkKnife,
  Lightning,
  Receipt,
  Tag,
  UsersThree,
  type Icon,
} from 'phosphor-react-native';

// Icons for the categories seeded in supabase/schema.sql; new categories fall back to a tag.
const icons: Record<string, Icon> = {
  'Room bookings': Bed,
  Restaurant: ForkKnife,
  'Walk-ins': Receipt,
  Events: Confetti,
  Payroll: UsersThree,
  'Food and beverage': ForkKnife,
  Utilities: Lightning,
  Maintenance: Drop,
};
export const categoryIcon = (name: string): Icon => icons[name] ?? Tag;
