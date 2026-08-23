/**
 * Unistyles v3 runtime configuration.
 *
 * Registers themes, breakpoints and settings via StyleSheet.configure, and
 * augments the library's type definitions so `theme` and breakpoints are fully
 * typed at every call site. Imported once from the app entry (index.ts) before
 * any StyleSheet.create runs.
 */

import { StyleSheet } from 'react-native-unistyles';

import { breakpoints } from './breakpoints';
import { darkTheme, lightTheme } from './themes';

type AppBreakpoints = typeof breakpoints;
type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};

declare module 'react-native-unistyles' {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  breakpoints,
  settings: {
    adaptiveThemes: false,
    initialTheme: 'light',
  },
});
