import simpleGit, { type SimpleGit, type StatusResult } from 'simple-git';
import { readFile as fsReadFile } from 'fs/promises';
import { join } from 'path';

export interface RepoStatus {
    branch: string;
    isDirty: boolean;
    latestCommit: string;
    files: StatusResult['files'];
}

/**
 * Get high-level repo status (branch, dirty state, latest commit).
 */
export async function getRepoStatus(repoPath: string): Promise<RepoStatus> {
    const git: SimpleGit = simpleGit(repoPath);
    const [status, log] = await Promise.all([
        git.status(),
        git.log({ maxCount: 1 }),
    ]);

    return {
        branch: status.current ?? 'HEAD',
        isDirty: !status.isClean(),
        latestCommit: log.latest?.hash ?? 'unknown',
        files: status.files,
    };
}

/**
 * Get the current git diff (unstaged + staged).
 */
export async function getDiff(repoPath: string): Promise<string> {
    const git: SimpleGit = simpleGit(repoPath);
    const [unstaged, staged] = await Promise.all([
        git.diff(),
        git.diff(['--cached']),
    ]);
    return [unstaged, staged].filter(Boolean).join('\n');
}

/**
 * Read a single file from the repo.
 */
export async function readFile(repoPath: string, relativePath: string): Promise<string> {
    const fullPath = join(repoPath, relativePath);
    return fsReadFile(fullPath, 'utf-8');
}
