/**
 * This module defines a mock server to handle requests from the terminal client.
 * However, in the future an actual server could be implemented using WebSockets
 * like in this tutorial:
 *   https://www.eddymens.com/blog/creating-a-browser-based-interactive-terminal-using-xtermjs-and-nodejs.html#how-it-works
 */
import { initFileSystem, Directory, LocalFileSystem } from "./file-system";
import { commands } from "./commands";

/**
 * Represents the result of running a command. Commands can either return null
 * values, such as in the case of `clear`, or an output string. Commands can
 * send an optional `failed` flag for whether the operation failed, otherwise
 * it is presumed that the operation succeeded.
 */
export type CommandResult = {
  output: string | null;
  failed?: boolean;
};

/**
 * A command object that defines a command, its arguments, and the function to
 * execute when the command is called.
 * The `execute` function takes the current directory, arguments, and file system
 * as parameters and returns the output of the command.
 */
export type Command = {
  command: string;
  args: string[];
  opts?: string[];
  execute: (args?: string[], fileSystem?: LocalFileSystem) => CommandResult;
  description?: string;
};

/**
 * Interface for the server processing commands from the terminal client.
 * The `executeCommand` method takes a command string and returns a Promise
 * that resolves to the output of the command, which may either be the string
 * output or null for commands like `clear` that don't need return values.
 */
export interface IServer {
  executeCommand(command: string): Promise<CommandResult>;
}

/**
 * A mock server that processes commands from the terminal client. It emulates
 * an actual terminal backend.
 */
export class MockServer implements IServer {
  private fileSystem: LocalFileSystem | null = null;
  private currentDir: Directory | null = null;
  private cmdRegistry: Map<string, Command> = new Map();

  constructor() {
    initFileSystem()
      .then((fs) => {
        this.fileSystem = fs;
        this.currentDir = fs.root;

        // Populate the command registry
        for (const cmd of commands) {
          this.cmdRegistry.set(cmd.command, cmd);
        }
      })
      .catch((error) => {
        console.error("Failed to initialize file system:", error);
      });
  }

  /**
   * Processes a command string and returns the output of the command.
   * @param command The command string to process.
   * @returns A Promise that resolves to the output of the command.
   */
  executeCommand(command: string): Promise<CommandResult> {
    if (!this.fileSystem || !this.currentDir) {
      return Promise.resolve({
        output: "Failed to initialize file system.",
        failed: true,
      });
    }

    const [cmd, ...args] = command.split(" ");
    const commandObj = this.cmdRegistry.get(cmd);
    if (!commandObj) {
      return Promise.resolve({
        output: `${cmd}: command not found`,
        failed: true,
      });
    }

    return Promise.resolve(commandObj.execute(args, this.fileSystem));
  }
}
