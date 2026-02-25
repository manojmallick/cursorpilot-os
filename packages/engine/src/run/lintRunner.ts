import { spawn } from 'child_process';
import type { RunResult } from '@cursorpilot/shared';
import { truncate } from '@cursorpilot/shared';

const MAX_OUTPUT = 8_000;
const TIMEOUT_MS = 30_000;

/**
 * Run `npm run lint` in the target repo and return structured results.
 */
export async function runLint(repoPath: string): Promise<RunResult> {
    return new Promise((resolve) => {
        const child = spawn('npm', ['run', 'lint'], {
            cwd: repoPath,
            shell: true,
            timeout: TIMEOUT_MS,
            env: { ...process.env, CI: 'true', TMPDIR: '/tmp' },
        });

        let stdout = '';
        let stderr = '';

        child.stdout?.on('data', (chunk: Buffer) => {
            stdout += chunk.toString();
        });

        child.stderr?.on('data', (chunk: Buffer) => {
            stderr += chunk.toString();
        });

        child.on('close', (code) => {
            resolve({
                ok: code === 0,
                exitCode: code ?? 1,
                stdout: truncate(stdout, MAX_OUTPUT),
                stderr: truncate(stderr, MAX_OUTPUT),
            });
        });

        child.on('error', (err) => {
            resolve({
                ok: false,
                exitCode: 1,
                stdout: '',
                stderr: truncate(err.message, MAX_OUTPUT),
            });
        });
    });
}
