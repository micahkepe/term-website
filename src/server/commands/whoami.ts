import { Command, CommandResult } from "../mock-server";
import config from "../../../config.json";

/**
 * A mock command that displays information about the author. This command does
 * not take any arguments. The functionality is loosely based on the `whoami`
 * command in Unix-like operating systems.
 * @see {@link Command}
 */
export const whoamiCommand: Command = {
  command: "whoami",
  args: [],
  description: "Display current user",
  execute: (): CommandResult => {
    return {
      output: `${config.guest_username}`,
    };
  },
};
