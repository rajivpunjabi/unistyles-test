/**
 * Unistyles v2 runtime configuration.
 *
 * Registers breakpoints, themes and adaptive-theme config, and augments the
 * library's type definitions so `theme` and breakpoints are fully typed at
 * every call site. Import this file once, early in the app entry.
 */

import { UnistylesRegistry } from "react-native-unistyles";

import { breakpoints } from "./breakpoints";
import { darkTheme, lightTheme } from "./themes";

type AppBreakpoints = typeof breakpoints;
type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};

declare module "react-native-unistyles" {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
}

UnistylesRegistry.addBreakpoints(breakpoints)
  .addThemes({
    light: lightTheme,
    dark: darkTheme,
  })
  .addConfig({
    adaptiveThemes: true,
  });
