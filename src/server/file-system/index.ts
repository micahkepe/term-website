/**
 * Represents a file in the file system. A file has a name and content.
 */
export interface File {
  name: string;
  content: string;
  createdAt?: number;
  lastModifiedAt?: number;
  createdBy?: string;
  lastModifiedBy?: string;
  permissions?: string; // Unix-like file permissions string
}

/**
 * Represents a dictory in the filesystem. A directory has a name and children.
 * The children can be files or directories.
 */
export interface Directory {
  name: string;
  children: Array<File | Directory>;
  createdAt?: number;
  lastModifiedAt?: number;
  createdBy?: string;
  lastModifiedBy?: string;
  permissions?: string; // Unix-like file permissions string
}

/**
 * Represents the filesystem. The filesystem has a root directory.
 * The root directory is the top-level directory in the filesystem.
 * The root directory has a name and children. The children can be files or
 * directories. The root directory is the starting point for all filesystem
 * operations.
 * NOTE: There is a `FileSystem` type in MDN Web Docs, so we use
 * `LocalFileSystem` instead to avoid naming and type conflicts.
 */
export interface LocalFileSystem {
  root: Directory;
  currentPath: string;
}

/**
 * Initializes the filesystem with a root directory. The root directory is the
 * top-level directory in the filesystem and the root node in which all of the
 * other files in the file tree descend.
 * @returns {Promise<LocalFileSystem>}
 */
export function initFileSystem(): Promise<LocalFileSystem> {
  const rootPath = `/`;

  const rootDirectory: Directory = {
    name: rootPath,
    children: [],
  };

  const files = import.meta.glob("./files/**/*", {
    query: "?raw",
    import: "default",
  });

  console.log("files");
  console.log(files);

  const filePromises = Object.entries(files).map(([filePath, loadFile]) => {
    const parts = filePath.replace("./files/", "").split("/");
    const fileName = parts.pop()!; // The last part is the file name

    return loadFile().then((content) => {
      let currentDir = rootDirectory;

      // Traverse the directory structure to find or create nested directories
      for (const part of parts) {
        let dir = currentDir.children.find(
          (child) =>
            (child as Directory).name === part && !(child as File).content,
        ) as Directory;

        if (!dir) {
          dir = { name: part, children: [] };
          currentDir.children.push(dir);
        }

        currentDir = dir;
      }

      currentDir.children.push({
        name: fileName,
        content,
      } as File);
    });
  });

  return Promise.all(filePromises)
    .then(() => ({ root: rootDirectory, currentPath: rootPath }))
    .catch((error) => {
      console.error("Failed to initialize file system:", error);
      return { root: { name: rootPath, children: [] }, currentPath: rootPath };
    });
}

/**
 * Performs a search for a directory in the filesystem given a path. Returns the
 * directory if found, otherwise returns null. Searches by traversing the parts
 * in the filepath string until either the resource is found or a deadend is
 * reached.
 * @param root The root directory of the filesystem.
 * @param path The path to the directory to find.
 * @returns The directory if found, otherwise null.
 */
export function findDirectory(root: Directory, path: string): Directory | null {
  if (path === "/") return root;

  const parts = path.split("/").filter(Boolean); // Split and remove empty parts
  let dir: Directory | null = root;

  for (const part of parts) {
    if (!dir) return null;
    const child = dir.children.find(
      (child) => child.name === part && "children" in child,
    ) as Directory;

    if (!child) {
      return null; // Directory not found
    }
    dir = child;
  }
  return dir;
}
