import { Command, CommandResult } from "../mock-server";
import config from "../../../config.json";

/**
 * A mock command that opens the author's email in the default email client.
 * This command does not take any arguments.
 * @see {@link Command}
 * @see {@link config}
 */
export const emailCommand: Command = {
  command: "email",
  args: [],
  description: "Send me an email",
  execute: (args?): CommandResult => {
    if (args && args.length > 1) {
      return {
        output:
          "email: too many arguments passed, expected 0, got " + args.length,
        failed: true,
      };
    }
    window.open(`mailto:${config.author.email}`);
    return {
      output: `Opening email client...`,
    };
  },
};
