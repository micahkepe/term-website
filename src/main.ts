import { ChangeTerminalThemeEvent, ChangeDirectoryEvent, View } from "./view";
import { MockServer, CommandResult } from "./server/mock-server";
import "./client/terminal/terminal.ts";

/**
 * Initial entry point to the application. This module acts as the main
 * controller for the terminal client. The terminal client communicates with
 * the mock server to process commands and display the output in the terminal via
 * custom events that are dispatched and then delegated to the server and view
 * modules.
 */
function main(): void {
  const view = new View();
  const server = new MockServer();

  document.addEventListener(
    "terminalInputEvent",
    function (event: CustomEvent): Promise<void> {
      return server
        .executeCommand(event.detail.input)
        .then((result: CommandResult) => {
          view.displayTerminalCmdOutput(
            result.output ? result.output : "",
            result.failed,
          );
        })
        .catch((error: string) => view.displayTerminalCmdOutput(error, true));
    },
  );

  document.addEventListener("clearTerminalEvent", function (): void {
    view.clearTerminalBuffer();
  });

  document.addEventListener(
    "changeDirectoryEvent",
    function (event: CustomEvent<ChangeDirectoryEvent>): void {
      view.setTerminalPwd(event.detail.newPwd);
    },
  );

  document.addEventListener(
    "changeTerminalThemeEvent",
    function (event: CustomEvent<ChangeTerminalThemeEvent>): void {
      const theme = event.detail.theme;
      view.changeTerminalTheme(theme);
    },
  );
}

document.addEventListener("DOMContentLoaded", () => {
  main();
});
