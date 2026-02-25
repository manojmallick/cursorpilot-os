import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import simpleGit from 'simple-git';
import type { PatchResult } from '@cursorpilot/shared';

// Use /tmp directly to avoid macOS EPERM issues with os.tmpdir()
const TEMP_DIR = '/tmp';

/**
 * Write the diff to a temp file after normalizing it.
 */
async function writePatchFile(diff: string): Promise<string> {
  const tempPath = join(TEMP_DIR, 'cursorpilot-' + randomUUID() + '.patch');
  const normalizedDiff = diff
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter(line => !line.startsWith('index '))
    .join('\n');
  await writeFile(tempPath, normalizedDiff, { encoding: 'utf-8', mode: 0o644 });
  return tempPath;
}

/**
 * Fallback: use the `patch` command which is more forgiving than `git apply`.
 */
function applyWithPatchCmd(repoPath: string, patchPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('patch', ['-p1', '--batch', '--silent', '-i', patchPath], {
      cwd: repoPath,
      env: { ...process.env, TMPDIR: '/tmp' },
    });
    let stderr = '';
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error('patch command failed (exit ' + code + '): ' + stderr.trim()));
    });
  });
}

/**
 * Apply a unified diff to the repository.
 * Strategy: try `git apply -C0` first, fall back to `patch -p1` if it fails.
 */
export async function applyPatch(repoPath: string, diff: string): Promise<PatchResult> {
  const tempPath = await writePatchFile(diff);
  const git = simpleGit(repoPath);

  try {
    // Try git apply with minimal context matching (-C0)
    await git.raw(['apply', '--whitespace=nowarn', '--ignore-whitespace', '-C0', '--unidiff-zero', tempPath]);
    return { ok: true, diff };
  } catch {
    // Fallback: use the patch command which is more lenient
    try {
      await applyWithPatchCmd(repoPath, tempPath);
      return { ok: true, diff };
    } catch (fallbackErr) {
      const message = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      return { ok: false, diff, applyError: message };
    }
  } finally {
    try { await unlink(tempPath); } catch { /* cleanup best-effort */ }
  }
}

/**
 * Revert all uncommitted changes in the repo (restore to last commit).
 */
export async function revertChanges(repoPath: string): Promise<void> {
  const git = simpleGit(repoPath);
  await git.raw(['checkout', '--', '.']);
  await git.raw(['clean', '-fd']);
}
