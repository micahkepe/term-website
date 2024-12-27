import { Command, CommandResult } from "../mock-server";
import { commands } from "./index";
import { generateSpacerString } from "../../utils";
import { AnsiCodes } from "../../ansi-codes";

export const helpCommand: Command = {
  command: "help",
  args: ["[command]"],
  description: "See available commands",
  execute: (args?): CommandResult => {
    if (args && args.length > 1) {
      return {
        output:
          "help: too many arguments passed, expected 0 or 1, got " +
          args.length,
        failed: true,
      };
    } else if (args && args.length === 1) {
      const command = commands.find((cmd) => cmd.command === args[0]);

      if (!command) {
        return {
          output: `help: no help topics match '${args[0]}'. Try 'help' to list all available commands.`,
          failed: true,
        };
      }

      return {
        output:
          `${AnsiCodes.BoldCyan}${command.command}${AnsiCodes.Reset} - ${command.description || "No description available"}\n\n` +
          `Usage: ${command.command} ${command.args.join(" ")}\n` +
          `Options: ${command.opts?.length ? command.opts.join(", ") : "None"}`,
      };
    }
    const commandDescriptions = commands
      .map(
        (cmd) =>
          ` ${AnsiCodes.BoldCyan}${cmd.command}${AnsiCodes.Reset}${generateSpacerString(
            10 - cmd.command.length,
          )}- ${cmd.description || "No description available"} ${cmd.opts?.length ? `(Opts: ${cmd.opts.join(", ")})` : ""}`,
      )
      .join("\n");

    return { output: `\nAvailable commands:\n\n${commandDescriptions}\n` };
  },
};
