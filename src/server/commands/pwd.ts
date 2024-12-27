import { Command, CommandResult } from "../mock-server";
import { LocalFileSystem } from "../file-system";

/**
 * The `pwd` command prints the current working directory. It takes no arguments.
 * @see {@link Command}
 * @see {@link LocalFileSystem}
 * @returns The current working directory
 */
export const pwdCommand: Command = {
  command: "pwd",
  args: [],
  description: "Print current directory",
  execute: (_, fileSystem?: LocalFileSystem): CommandResult => {
    if (!fileSystem) {
      return { output: "pwd: file system not initialized", failed: true };
    }

    return { output: fileSystem.currentPath || fileSystem.root.name };
  },
};
