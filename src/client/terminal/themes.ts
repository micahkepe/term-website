/**
 * This module defines color themes available for the xterm.js terminal
 * emulator. Themes are defined by the ITheme xterm interface:
 *  https://xtermjs.org/docs/api/terminal/interfaces/itheme/
 */

import { ITheme } from "@xterm/xterm";

/**
 * A copy of the Catpuccin Mocha palette. Some colors are not perfect 1-1
 * matches, but I have put the closest palette colors for those and have
 * commented the Catpuccin color chosen.
 *
 * Adapted from:
 * https://catppuccin.com/palette
 */
export const CatpuccinMochaTheme: ITheme = {
  background: "#1e1e2e",
  black: "#11111b",
  blue: "#89b4fa",
  brightBlack: "#45475a", // 'Surface 1'
  brightBlue: "#74c7ec", // 'Sapphire'
  brightCyan: "#94e2d5", // 'Teal'
  cyan: "#89dceb", // 'Sky'
  green: "#a6e3a1",
  red: "#f38ba8",
  brightRed: "#eba0ac", // 'Maroon'
  magenta: "#b4befe", // 'Lavender'
  brightMagenta: "#cba6f7", // 'Mauve'
  yellow: "#f9e2af",
  brightYellow: "#f5e0dc", // 'Rosewater'
  selectionBackground: "#6c7086", // 'Overlay 0'
};

/**
 * The Dracula theme for the terminal emulator.
 * Colors taken partly from:
 * https://en.wikipedia.org/wiki/Dracula_(color_scheme)
 */
export const DraculaTheme: ITheme = {
  background: "#282a36",
  black: "#44475a",
  blue: "#6272a4",
  brightBlack: "#6272a4",
  brightBlue: "#bd93f9",
  brightCyan: "#8be9fd",
  cyan: "#8be9fd",
  green: "#50fa7b",
  red: "#ff5555",
  brightRed: "#ff5555",
  magenta: "#ff79c6",
  brightMagenta: "#ff79c6",
  yellow: "#f1fa8c",
  brightYellow: "#f1fa8c",
  selectionBackground: "#44475a",
};

/**
 * The Solarized Dark theme for the terminal emulator.
 *
 * Colors taken from:
 * https://ethanschoonover.com/solarized/
 */
export const SolarizedDark: ITheme = {
  background: "#002b36",
  black: "#073642",
  blue: "#268bd2",
  brightBlack: "#586e75",
  brightBlue: "#839496",
  brightCyan: "#93a1a1",
  cyan: "#2aa198",
  green: "#859900",
  red: "#dc322f",
  brightRed: "#cb4b16",
  magenta: "#d33682",
  brightMagenta: "#6c71c4",
  yellow: "#b58900",
  brightYellow: "#657b83",
  selectionBackground: "#073642",
};

/**
 * The available themes for the terminal emulator.
 */
export const TermThemes: Map<string, ITheme> = new Map([
  ["catpuccin-mocha", CatpuccinMochaTheme],
  ["dracula", DraculaTheme],
  ["solarized-dark", SolarizedDark],
]);