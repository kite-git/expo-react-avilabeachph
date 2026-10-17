import { useColorScheme } from 'react-native';

// Radius rule: balance card 20, sections 16, inputs and buttons 14, icon tiles 12, chips and + full pill.
export const themes = {
  light: {
    bg: '#F6F1E4',
    surface: '#FCF8EE',
    text: '#2A1E0E',
    muted: '#6E5E44',
    hairline: '#E6DCC6',
    accent: '#8A5A12',
    balanceBg: '#5A3A12',
    onBalance: '#FBF3E2',
    onBalanceMuted: '#E8C77A',
    error: '#A3341C',
    // Chart pair checked with the dataviz validator against `surface`.
    chartIn: '#8A5A12',
    chartOut: '#C9921F',
  },
  dark: {
    bg: '#14100A',
    surface: '#1E1810',
    text: '#F1E9D8',
    muted: '#B3A68C',
    hairline: '#33291B',
    accent: '#E0B04A',
    balanceBg: '#4A3112',
    onBalance: '#FBF3E2',
    onBalanceMuted: '#E3C27C',
    error: '#F08A6C',
    chartIn: '#BA8A10',
    chartOut: '#94501A',
  },
};
export type Theme = typeof themes.light;

export const useTheme = () => themes[useColorScheme() === 'dark' ? 'dark' : 'light'];

export const peso = (n: number) =>
  Math.abs(n).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
export const signed = (n: number) => (n < 0 ? '−' : '+') + peso(n);
