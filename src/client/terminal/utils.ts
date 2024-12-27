/**
 * Collection of utility functions for terminal text manipulation and navigation
 *
 * Adapted from:
 * https://github.com/wavesoft/local-echo/blob/master/lib/Utils.js
 */

/**
 * Finds word boundaries (start and end positions) in a given input string
 * @param input The input string to analyze
 * @param leftSide If true, returns left (start) boundaries, otherwise right (end) boundaries
 */
export function findWordBoundaries(
  input: string,
  leftSide: boolean = true,
): number[] {
  const boundaries: number[] = [];
  let inWord = false;

  // Always consider position 0 as a left boundary
  if (leftSide) {
    boundaries.push(0);
  }

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const isWordChar = /\w/.test(char);

    if (!inWord && isWordChar) {
      // Start of a word
      if (leftSide) {
        boundaries.push(i);
      }
      inWord = true;
    } else if (inWord && !isWordChar) {
      // End of a word
      if (!leftSide) {
        boundaries.push(i);
      }
      inWord = false;
    }
  }

  // Always consider the end of string as a right boundary
  if (!leftSide && inWord) {
    boundaries.push(input.length);
  }

  return boundaries;
}

/**
 * Finds the closest left word boundary before the current cursor position
 * @param input The input string
 * @param offset Current cursor position
 */
export function closestLeftBoundary(input: string, offset: number): number {
  const boundaries = findWordBoundaries(input, true);
  // Find the rightmost boundary that's less than the offset
  for (let i = boundaries.length - 1; i >= 0; i--) {
    if (boundaries[i] < offset) {
      return boundaries[i];
    }
  }
  return 0;
}

/**
 * Converts a string offset to terminal column and row position
 * @param input The input string
 * @param offset Current cursor position
 * @param maxCols Maximum number of columns in the terminal
 */
export function offsetToColRow(
  input: string,
  offset: number,
  maxCols: number,
): { row: number; col: number } {
  let row = 0;
  let col = 0;

  for (let i = 0; i < offset; i++) {
    if (input[i] === "\n") {
      col = 0;
      row++;
    } else {
      col++;
      if (col >= maxCols) {
        col = 0;
        row++;
      }
    }
  }

  return { row, col };
}

/**
 * Counts the number of lines that the input will take up in the terminal
 * @param input The input string
 * @param maxCols Maximum number of columns in the terminal
 */
export function countLines(input: string, maxCols: number): number {
  return offsetToColRow(input, input.length, maxCols).row + 1;
}

/**
 * Checks if the input is incomplete (has unclosed quotes or operators)
 * @param input The input string to check
 */
export function isIncompleteInput(input: string): boolean {
  const trimmed = input.trim();

  // Empty input is not incomplete
  if (trimmed === "") {
    return false;
  }

  // Check for unclosed quotes
  let singleQuoteOpen = false;
  let doubleQuoteOpen = false;
  let escaped = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "'" && !doubleQuoteOpen) {
      singleQuoteOpen = !singleQuoteOpen;
    } else if (char === '"' && !singleQuoteOpen) {
      doubleQuoteOpen = !doubleQuoteOpen;
    }
  }

  if (singleQuoteOpen || doubleQuoteOpen) {
    return true;
  }

  // Check for incomplete operators
  const operators = ["&&", "||", "|"];
  for (const op of operators) {
    if (trimmed.endsWith(op) || trimmed.endsWith(op + " ")) {
      return true;
    }
  }

  // Check for trailing backslash (line continuation)
  if (trimmed.endsWith("\\") && !trimmed.endsWith("\\\\")) {
    return true;
  }

  return false;
}

/**
 * Checks if the input ends with whitespace
 * @param input The input string to check
 */
export function hasTailingWhitespace(input: string): boolean {
  return /[ \t]$/.test(input);
}

/**
 * Gets the last token (word) from the input
 * @param input The input string
 */
export function getLastToken(input: string): string {
  const trimmed = input.trim();
  if (trimmed === "" || hasTailingWhitespace(input)) {
    return "";
  }

  // Split on spaces, considering quotes
  const tokens: string[] = [];
  let currentToken = "";
  let inQuotes: false | "'" | '"' = false;
  let escaped = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    if (escaped) {
      currentToken += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = char;
    } else if (inQuotes === char) {
      inQuotes = false;
    } else if (!inQuotes && /\s/.test(char)) {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = "";
      }
    } else {
      currentToken += char;
    }
  }

  if (currentToken) {
    tokens.push(currentToken);
  }

  return tokens[tokens.length - 1] || "";
}
