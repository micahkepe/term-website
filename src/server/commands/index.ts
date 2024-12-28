import { Command } from "../mock-server";
import { lsCommand } from "./ls";
import { catCommand } from "./cat";
import { helpCommand } from "./help";
import { clearCommand } from "./clear";
import { whoamiCommand } from "./whoami";
import { pwdCommand } from "./pwd";
import { rmCommand } from "./rm";
import { cdCommand } from "./cd";
import { themeCommand } from "./theme";
import { emailCommand } from "./email";
import { repoCommand } from "./repo";

/**
 * List of all available commands. This list is used to generate the help command.
 * The order of the commands in this list determines the order in which they are
 * displayed in the help command.
 * @see {@link helpCommand}
 * @see {@link Command}
 */
export const commands: Command[] = [
  lsCommand,
  catCommand,
  helpCommand,
  clearCommand,
  whoamiCommand,
  pwdCommand,
  rmCommand,
  cdCommand,
  themeCommand,
  emailCommand,
  repoCommand,
];
