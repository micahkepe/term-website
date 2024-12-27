import { Command, CommandResult } from "../mock-server";
import { LocalFileSystem, findDirectory } from "../file-system";
import { AnsiCodes } from "../../ansi-codes";

/**
 * Resolves a target path relative to the current path.
 * Supports "." and ".." as well as absolute and relative paths.
 * @param currentPath The current path
 * @param targetPath The target path
 * @returns The resolved path
 */
function resolvePath(currentPath: string, targetPath?: string): string {
  if (!targetPath) return currentPath;
  if (targetPath === ".") return currentPath;
  if (targetPath === "..") {
    const parts = currentPath.split("/").filter(Boolean);
    if (parts.length === 0) return "/";
    parts.pop();
    return "/" + parts.join("/");
  }
  if (targetPath.startsWith("/")) return targetPath; // Absolute path
  return currentPath === "/"
    ? "/" + targetPath
    : currentPath + "/" + targetPath; // Relative path
}

/**
 * A minimal implementation of the "ls" command. Lists the contents of a directory.
 * @param args The command arguments
 * @param fileSystem The file system
 * @returns The output of the command
 * @see {@link Command}
 * @see {@link LocalFileSystem}
 * @see {@link AnsiCodes}
 */
export const lsCommand: Command = {
  command: "ls",
  args: ["[directory]"],
  description: "List directory contents",
  execute: (args?: string[], fileSystem?: LocalFileSystem): CommandResult => {
    if (!fileSystem || !fileSystem.currentPath) {
      return { output: "ls: File system not initialized.", failed: true };
    }

    const targetPath = resolvePath(fileSystem.currentPath, args?.[0]);
    const resolvedDir = findDirectory(fileSystem.root, targetPath);

    if (!resolvedDir) {
      return {
        output: `Directory not found: ${args?.[0] || targetPath}`,
        failed: true,
      };
    }

    if (!Array.isArray(resolvedDir.children)) {
      return { output: `${targetPath} is not a directory.`, failed: true };
    }

    // List the directory contents
    return {
      output:
        resolvedDir.children
          .map((child) =>
            "children" in child
              ? `${AnsiCodes.Cyan}${child.name}/${AnsiCodes.Reset}`
              : `${child.name}`,
          )
          .join("\t") || "",
    };
  },
};
