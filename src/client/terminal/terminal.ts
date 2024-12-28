import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { DraculaTheme, TermThemes } from "./themes";
import { getTemplate } from "../../utils";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { SearchAddon } from "@xterm/addon-search";
import { AnsiCodes } from "../../ansi-codes";
import { isIncompleteInput } from "./utils";
import config from "../../../config.json";

/**
 * Represents a terminal emulator that provides a command-line interface to the
 * user. The terminal is initialized with a welcome message and a set of
 * commands that the user can execute. The terminal supports basic keyboard
 * input handling, command history, and command execution. The terminal can be
 * themed with a set of predefined themes.
 */
export class TerminalComponent extends HTMLElement {
  private terminal: Terminal | null = null;
  private fitAddon: FitAddon | null = null;
  private searchAddon: SearchAddon | null = null;
  private controller: AbortController | null = null;
  private shadow: ShadowRoot;
  private static template: HTMLTemplateElement;
  private pwd: string = "~";
  private cmdHistory: string[] = [];
  private cmdHistoryIdx: number = -1;
  private currentInput: string = "";
  private cursorPosition: number = 0;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    if (!TerminalComponent.template) {
      TerminalComponent.template = getTemplate("#terminal-component-template");
    }

    this.shadow.appendChild(TerminalComponent.template.content.cloneNode(true));
  }

  connectedCallback() {
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };

    this.initializeTerminal()
      .then((terminal) => {
        this.terminal = terminal;
        this.writeWelcomeMessage();
        this.setupKeyboardHandling();
      })
      .catch((error) => {
        console.error(error);
      });

    window.addEventListener(
      "resize",
      () => {
        this.fitAddon?.fit();
      },
      options,
    );

    // load command history if available
    this.cmdHistory = JSON.parse(sessionStorage.getItem("cmdHistory") || "[]");
  }

  /**
   * Initializes the terminal emulator with the necessary addons and settings.
   * @private
   * @returns {Terminal} The initialized terminal emulator.
   */
  private initializeTerminal(): Promise<Terminal> {
    const terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: "bar",
      theme: TermThemes.get(config.default_theme) || DraculaTheme,
      fontFamily: "JetBrains Mono",
      cols: 80,
      allowProposedApi: true,
    });

    // xterm addons
    // See: https://github.com/xtermjs/xterm.js/tree/master/addons
    this.fitAddon = new FitAddon();
    this.searchAddon = new SearchAddon();

    terminal.loadAddon(this.fitAddon);
    terminal.loadAddon(new WebLinksAddon());
    terminal.loadAddon(this.searchAddon);

    const container = this.shadow.querySelector(
      ".terminal-container",
    ) as HTMLElement;
    if (!container) throw new Error("Terminal container not found");

    terminal.open(container);

    this.fitAddon.fit();

    return Promise.resolve(terminal);
  }

  /**
   * Handles user input on the prompt line. On hitting "Enter", if the input is
   * non-empty, a custom event is dispatched for handling server-side. Currently
   * does not support command history navigation or Tab completion. Commands are
   * handled "blindly"- all commands are dispatched with custom events.
   * @private
   * @returns {void}
   */
  private setupKeyboardHandling(): void {
    if (!this.terminal) return;

    let input = "";
    this.cursorPosition = 0;

    this.terminal.onKey(({ key, domEvent }) => {
      if (!this.terminal) return;

      switch (domEvent.key) {
        case "Enter": {
          if (isIncompleteInput(input)) {
            this.terminal.write("\r\n> ");
            input += "\n";
            this.cursorPosition = input.length;
            return;
          }

          this.terminal.write("\r\n");

          if (input.trim() === "") {
            this.prompt();
            return;
          }

          // Add command to history if it's not empty and not duplicate
          if (
            this.cmdHistory.length === 0 ||
            this.cmdHistory[this.cmdHistory.length - 1] !== input
          ) {
            this.cmdHistory.push(input.trim());
            sessionStorage.setItem(
              "cmdHistory",
              JSON.stringify(this.cmdHistory),
            );
          }
          this.cmdHistoryIdx = this.cmdHistory.length;

          // Handle sudo commands
          if (input.trim().startsWith("sudo")) {
            input = "";
            this.writeOutput("nice try, not happening", true);
            return;
          }

          const event = new CustomEvent("terminalInputEvent", {
            detail: { input: input.trim() },
          });
          document.dispatchEvent(event);
          input = "";
          this.cursorPosition = 0;
          break;
        }

        case "Backspace": {
          if (this.cursorPosition > 0) {
            // Remove character at cursor position - 1
            input =
              input.slice(0, this.cursorPosition - 1) +
              input.slice(this.cursorPosition);
            this.cursorPosition--;

            // Clear from cursor to end of line
            this.terminal.write("\b\x1b[K");

            // Redraw the remaining text
            const remainingText = input.slice(this.cursorPosition);
            if (remainingText) {
              this.terminal.write(remainingText);
              // Move cursor back to new position
              this.terminal.write(
                "\x1b[".concat(remainingText.length.toString(), "D"),
              );
            }
          }
          break;
        }

        case "Tab":
          // TODO: Implement tab completion
          return;

        case "ArrowLeft": {
          if (this.cursorPosition > 0) {
            this.cursorPosition--;
            this.terminal?.write("\x1b[D");
          }
          break;
        }

        case "ArrowRight": {
          if (this.cursorPosition < input.length) {
            this.cursorPosition++;
            this.terminal?.write("\x1b[C");
          }
          break;
        }

        case "ArrowUp": {
          if (this.cmdHistory.length > 0 && this.cmdHistoryIdx > 0) {
            if (this.cmdHistoryIdx === this.cmdHistory.length) {
              this.currentInput = input;
            }

            this.cmdHistoryIdx--;
            input = this.cmdHistory[this.cmdHistoryIdx];
            this.terminal.write("\x1b[2K\r"); // Clear line
            this.prompt();
            this.terminal.write(input);
            this.cursorPosition = input.length;
          }
          break;
        }

        case "ArrowDown": {
          if (this.cmdHistoryIdx < this.cmdHistory.length) {
            this.cmdHistoryIdx++;
            input =
              this.cmdHistoryIdx === this.cmdHistory.length
                ? this.currentInput
                : this.cmdHistory[this.cmdHistoryIdx];
            this.terminal.write("\x1b[2K\r"); // Clear line
            this.prompt();
            this.terminal.write(input);
            this.cursorPosition = input.length;
          }
          break;
        }

        default: {
          // Handle special key combinations
          if (domEvent.ctrlKey) {
            switch (domEvent.key) {
              case "l": {
                const event = new CustomEvent("clearTerminalEvent");
                document.dispatchEvent(event);
                break;
              }
              case "c": {
                if (input !== "") {
                  this.terminal.write(
                    `${AnsiCodes.BackgroundBlue}^C${AnsiCodes.Reset}\r\n`,
                  );
                  input = "";
                  this.prompt();
                }
                break;
              }
              case "u": {
                input = "";
                this.terminal.write("\x1b[2K\r"); // Clear line
                this.prompt();
                break;
              }
              case "w": {
                const words = input.trim().split(" ");
                if (words.length > 0) {
                  input = words.slice(0, -1).join(" ");
                }
                this.terminal.write("\x1b[1K"); // Clear line from cursor
                this.terminal.write("\r"); // Move cursor to start of line
                this.prompt();
                this.terminal.write(input);
                break;
              }
            }
          } else if (!domEvent.ctrlKey && !domEvent.altKey) {
            // Insert character at cursor position
            input =
              input.slice(0, this.cursorPosition) +
              key +
              input.slice(this.cursorPosition);
            this.cursorPosition++;

            this.terminal.write(key);
            const remainingText = input.slice(this.cursorPosition);
            if (remainingText) {
              this.terminal.write(remainingText);
              this.terminal.write(
                "\x1b[".concat(remainingText.length.toString(), "D"),
              );
            }
          }
        }
      }
    });
  }

  disconnectedCallback() {
    this.controller?.abort();
    this.controller = null;

    this.terminal?.dispose();
  }

  /**
   * Prints the default message that greets the user when they first launch the
   * terminal.
   * @private
   * @returns {void}
   */
  private writeWelcomeMessage(): void {
    if (!this.terminal) return;

    this.terminal.writeln(`${Date().toLocaleString()}`);
    this.terminal.writeln(
      `Welcome to ${config.author.name}'s terminal, the nerd shell.`,
    );
    this.terminal.writeln(
      `Type \`${AnsiCodes.Cyan}help${AnsiCodes.Reset}\` for a list of commands.`,
    );
    this.prompt();
  }

  /**
   * Writes a prompt to the terminal to indicate that the terminal is ready to
   * accept user input.
   * @private
   * @returns {void}
   */
  private prompt(prevCmdFailed = false): void {
    if (!this.terminal) return;

    let prepend: string;

    if (prevCmdFailed) {
      prepend = `${AnsiCodes.BoldRed}→${AnsiCodes.Reset}`;
    } else {
      prepend = `${AnsiCodes.BoldGreen}→${AnsiCodes.Reset}`;
    }

    // A dupe of the `bobbyrussell` Oh-my-zsh theme
    this.terminal.write(
      `${prepend}  ${AnsiCodes.BoldCyan}${this.pwd} ${AnsiCodes.Reset}${AnsiCodes.BoldPurple}git:(${AnsiCodes.Reset}${AnsiCodes.BoldRed}main${AnsiCodes.BoldPurple})${AnsiCodes.BoldHighIntensityYellow} ✘${AnsiCodes.Reset} `,
    );
  }

  /**
   * Formats the path to always show ~ for home directory and its subdirectories
   * @param {string} path The path to format
   * @returns {string} The formatted path
   */
  private formatPath(path: string): string {
    // If we're at root level of home directory
    if (path === "/" || path === "~" || path === "") {
      return "~";
    }

    // If it's a subdirectory path
    if (path.startsWith("/")) {
      // Remove the leading slash and replace with ~/
      return `~${path}`;
    }

    // If it's already a relative path with ~, return as is
    if (path.startsWith("~")) {
      return path;
    }

    // For any other paths, prefix with ~/
    return `~/${path}`;
  }

  /**
   * Sets the current working directory for the terminal. This should be called
   * when the user changes directories to properly update the terminal view.
   * @param {string} pwd The new current working directory.
   * @returns {void}
   */
  setPwd(pwd: string): void {
    this.pwd = this.formatPath(pwd);
  }

  /**
   * Writes the output of a command to the terminal.
   * @param {string} output The output of the command to write to the terminal.
   * @returns {void}
   */
  writeOutput(output: string, prevCmdFailed = false): void {
    if (output.trim() === "") {
      this.prompt(prevCmdFailed);
      return;
    }

    const lines = output.split("\n"); // Split content by newlines
    lines.forEach((line) => {
      this.terminal?.writeln(line.trimEnd()); // Trim excess spaces and write each line
    });
    this.prompt(prevCmdFailed);
  }

  /**
   * Changes the theme of the terminal emulator.
   * @param {string} theme The name of the theme to change to.
   * @returns {void}
   */
  changeTheme(theme: string): void {
    if (!this.terminal) return;

    if (!TermThemes.has(theme)) {
      console.error(`Theme ${theme} not found. Using default theme.`);
    }

    // get the theme object from the available themes
    // or use the default theme
    const themeObject = TermThemes.get(theme) || DraculaTheme;

    // create a new terminal with the new theme and set the current working
    // directory
    this.terminal.options.theme = themeObject;
  }

  /**
   * Clears the terminal screen, leaving the current prompt line as the first
   * line in the buffer.
   * @returns {void}
   */
  clearBuffer(): void {
    this.terminal?.clear();
  }
}

customElements.define("terminal-component", TerminalComponent);
