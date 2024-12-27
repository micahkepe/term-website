import { Command, CommandResult } from "../mock-server";
import { findDirectory, LocalFileSystem } from "../file-system";

/**
 * A minimal implementation of the "cd" command. Changes the current directory.
 * Supported usage is `cd [directory]`, where `directory` is the target directory
 * and can be a relative or absolute path. The `-` option navigates to the previous directory.
 *
 * @param args The command arguments
 * @param fileSystem The file system
 * @returns The output of the command
 * @see {@link Command}
 * @see {@link LocalFileSystem}
 * @see {@link findDirectory}
 */
export const cdCommand: Command = {
  command: "cd",
  args: ["[directory | -]"],
  description: "Change directory",
  execute: (args?: string[], fileSystem?: LocalFileSystem): CommandResult => {
    if (!fileSystem) {
      return { output: "cd: file system not initialized.", failed: true };
    }

    // Initialize lastDirectory in localStorage if it doesn't exist
    if (!localStorage.getItem("lastDirectory")) {
      localStorage.setItem("lastDirectory", fileSystem.root.name);
    }

    // If no arguments, go to root
    if (!args || args.length === 0) {
      const previousPath = fileSystem.currentPath;
      fileSystem.currentPath = fileSystem.root.name;
      updateLastDirectory(previousPath, fileSystem.currentPath);
      dispatchChangeEvent("~");
      return { output: null };
    }

    const targetPath = args[0].trim();
    const previousPath = fileSystem.currentPath;

    // Resolve path
    const resolvedPath = resolvePath(targetPath, fileSystem);
    const targetDir = findDirectory(fileSystem.root, resolvedPath);

    if (!targetDir) {
      return { output: `cd: no such directory: ${targetPath}`, failed: true };
    }

    if (!Array.isArray(targetDir.children)) {
      return { output: `cd: not a directory: ${targetPath}`, failed: true };
    }

    // Update the current path
    fileSystem.currentPath = resolvedPath;

    // Update last directory and dispatch event
    updateLastDirectory(previousPath, resolvedPath);
    dispatchChangeEvent(resolvedPath === "/" ? "~" : resolvedPath);

    return { output: null };
  },
};

/**
 * Resolves a path relative to the current directory or as an absolute path.
 */
function resolvePath(path: string, fileSystem: LocalFileSystem): string {
  switch (path) {
    case ".":
      return fileSystem.currentPath;
    case "..": {
      const parts = fileSystem.currentPath.split("/").filter(Boolean);
      return parts.length === 0
        ? fileSystem.root.name
        : "/" + parts.slice(0, -1).join("/");
    }
    case "~":
      return fileSystem.root.name;
    case "-": {
      const lastDir = localStorage.getItem("lastDirectory");
      if (!lastDir || lastDir === fileSystem.currentPath) {
        throw new Error("cd: no previous directory");
      }
      return lastDir;
    }
    default:
      return path.startsWith("/")
        ? path
        : fileSystem.currentPath === fileSystem.root.name
          ? `/${path}`
          : `${fileSystem.currentPath}/${path}`;
  }
}

/**
 * Updates the last directory in localStorage if it has changed.
 */
function updateLastDirectory(previousPath: string, newPath: string): void {
  if (previousPath !== newPath) {
    localStorage.setItem("lastDirectory", previousPath);
  }
}

/**
 * Dispatches a custom event to update the terminal display.
 */
function dispatchChangeEvent(newPwd: string): void {
  const changeDirectoryEvent = new CustomEvent("changeDirectoryEvent", {
    detail: { newPwd },
  });
  document.dispatchEvent(changeDirectoryEvent);
}
