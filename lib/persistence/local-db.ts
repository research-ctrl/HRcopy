import path from "node:path";
import { getLocalPaths } from "@/lib/config/local-paths";

export function getDbFilePaths(root?: string) {
  const paths = getLocalPaths(root);

  return {
    paths,
    documents: path.join(paths.dbDir, "documents.json"),
    versions: path.join(paths.dbDir, "document-versions.json"),
    chunks: path.join(paths.dbDir, "document-chunks.json"),
    sources: path.join(paths.dbDir, "sources.json"),
    threads: path.join(paths.dbDir, "threads.json"),
    feedback: path.join(paths.dbDir, "feedback.json"),
    reviews: path.join(paths.dbDir, "reviews.json"),
    runs: path.join(paths.dbDir, "monitor-runs.json"),
    events: path.join(paths.dbDir, "monitor-events.json"),
    digest: path.join(paths.dbDir, "monitor-digest.json"),
    settings: path.join(paths.dbDir, "settings.json"),
  };
}
