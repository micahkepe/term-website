import { Command, CommandResult } from "../mock-server";
import { LocalFileSystem, findDirectory } from "../file-system";

export const rmCommand: Command = {
  command: "rm",
  args: ["<file|directory>"],
  description: "Remove a file or directory",
  execute: (args?: string[], fileSystem?: LocalFileSystem): CommandResult => {
    if (!fileSystem || !fileSystem.currentPath) {
      return { output: "rm: file system not initialized.", failed: true };
    }

    if (!args || args.length === 0) {
      return { output: "Usage: rm [-r] <file|directory>", failed: true };
    }

    const currentDir = findDirectory(fileSystem.root, fileSystem.currentPath);

    if (!currentDir) {
      return {
        output: `Current directory not found: ${fileSystem.currentPath}`,
        failed: true,
      };
    }

    // Determine the target name, handling flags
    const targetName = args[0].startsWith("-") ? args[1] : args[0];

    const targetIndex = currentDir.children.findIndex(
      (child) => child.name === targetName,
    );

    if (targetIndex === -1) {
      return {
        output: `rm: ${targetName}: no such file or directory`,
        failed: true,
      };
    }

    const target = currentDir.children[targetIndex];

    // Handle directories
    if ("children" in target && target.children) {
      if (target.children.length > 0 && args[0] !== "-r") {
        return {
          output: `rm: Directory not empty: ${targetName}, use -r to remove`,
          failed: true,
        };
      }
    }

    // Remove the file or directory
    currentDir.children.splice(targetIndex, 1);
    return { output: null };
  },
};
