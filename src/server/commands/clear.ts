import { Command, CommandResult } from "../mock-server";

/**
 * Command to clear the terminal screen. This command does not take any arguments.
 * It clears the terminal screen by dispatching a custom event. The client
 * listens for this event and clears the terminal buffer when it is received.
 * @see {@link Command}
 */
export const clearCommand: Command = {
  command: "clear",
  args: [],
  description: "Clear the terminal screen",
  execute: (): CommandResult => {
    const event = new CustomEvent("clearTerminalEvent");
    document.dispatchEvent(event); // Notify the client to clear the terminal
    return { output: null };
  },
};
