import path from "node:path";

export interface LocalPaths {
  root: string;
  uploadsDir: string;
  dbDir: string;
}

export function getLocalPaths(customRoot?: string): LocalPaths {
  const configuredRoot = customRoot ?? process.env.LOCAL_DATA_ROOT ?? "data";
  const root = path.isAbsolute(configuredRoot)
    ? configuredRoot
    : path.join(/* turbopackIgnore: true */ process.cwd(), configuredRoot);
  return {
    root,
    uploadsDir: path.join(root, "uploads"),
    dbDir: path.join(root, "db"),
  };
}
