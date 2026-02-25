import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { stat } from 'fs/promises';

export interface CollectedFile {
    path: string;   // relative to repoPath
    content: string;
}

const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', '__pycache__']);
const MAX_FILE_SIZE = 50_000; // skip files > 50KB

/**
 * Recursively collect source files under repoPath/src.
 * Respects basic ignore patterns and file-size limits.
 */
export async function collectFiles(repoPath: string, subDir = 'src'): Promise<CollectedFile[]> {
    const results: CollectedFile[] = [];
    const baseDir = join(repoPath, subDir);

    async function walk(dir: string): Promise<void> {
        let entries;
        try {
            entries = await readdir(dir, { withFileTypes: true });
        } catch {
            return; // directory doesn't exist or not readable
        }

        for (const entry of entries) {
            if (IGNORE_DIRS.has(entry.name)) continue;
            const fullPath = join(dir, entry.name);

            if (entry.isDirectory()) {
                await walk(fullPath);
            } else if (entry.isFile()) {
                const info = await stat(fullPath);
                if (info.size > MAX_FILE_SIZE) continue;
                try {
                    const content = await readFile(fullPath, 'utf-8');
                    results.push({ path: relative(repoPath, fullPath), content });
                } catch {
                    // skip binary / unreadable files
                }
            }
        }
    }

    await walk(baseDir);
    return results;
}
