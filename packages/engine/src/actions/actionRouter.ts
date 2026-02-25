import type { ActionEvent, EvidenceState } from '@cursorpilot/shared';
import { INITIAL_EVIDENCE } from '@cursorpilot/shared';
import { rotateMode } from './modes.js';
import { collectFiles } from '../git/fileCollector.js';
import { runTests } from '../run/testRunner.js';
import { runLint } from '../run/lintRunner.js';
import { generateDiff, explainIssue } from '../llm/client.js';
import { validateDiff } from '../llm/diffValidator.js';
import { applyPatch, revertChanges } from '../patch/applyPatch.js';

let evidence: EvidenceState = { ...INITIAL_EVIDENCE };

/** Get the current evidence state. */
export function getEvidence(): EvidenceState {
    return { ...evidence };
}

/** Reset the demo repo and evidence state. */
export async function resetDemo(repoPath: string): Promise<EvidenceState> {
    await revertChanges(repoPath);
    evidence = { ...INITIAL_EVIDENCE, updatedAt: Date.now() };
    return getEvidence();
}

/**
 * Main dispatch: routes an ActionEvent to the appropriate handler
 * and returns the updated EvidenceState.
 */
export async function dispatch(
    event: ActionEvent,
    repoPath: string,
): Promise<EvidenceState> {
    if (event.type === 'rotate') {
        const direction = event.delta > 0 ? 1 : -1;
        evidence = {
            ...evidence,
            mode: rotateMode(evidence.mode, direction),
            lastEvent: event,
            updatedAt: Date.now(),
        };
        return getEvidence();
    }

    // Press events
    if (event.type === 'press') {
        if (event.buttonId === 'A') {
            return handleFixAction(repoPath);
        }
        if (event.buttonId === 'B') {
            return handleExplainAction(repoPath);
        }
    }

    return getEvidence();
}

/**
 * Button A: Generate diff → validate → apply → run tests → run lint.
 */
async function handleFixAction(repoPath: string): Promise<EvidenceState> {
    evidence = { ...evidence, status: 'RUNNING', updatedAt: Date.now() };

    try {
        // 1. Run tests and lint to get current failure output
        const initialTest = await runTests(repoPath);
        const initialLint = await runLint(repoPath);

        // Early exit: nothing to fix
        if (initialTest.ok && initialLint.ok) {
            evidence = {
                ...evidence,
                status: 'PASS',
                testResult: initialTest,
                lintResult: initialLint,
                diff: null,
                patchResult: null,
                updatedAt: Date.now(),
            };
            return getEvidence();
        }

        // 2. Collect source files for context
        const files = await collectFiles(repoPath);

        // 3. Ask Gemini for a fix (include both test + lint output)
        let rawDiff = await generateDiff({
            testOutput: initialTest.stdout + '\n' + initialTest.stderr,
            lintOutput: initialLint.stdout + '\n' + initialLint.stderr,
            files,
            mode: evidence.mode,
        });

        // Ensure diff ends with newline (prevents corrupt patch)
        if (rawDiff.length > 0 && !rawDiff.endsWith('\n')) {
            rawDiff += '\n';
        }

        // 4. Validate the diff
        const validation = validateDiff(rawDiff);
        if (!validation.ok) {
            evidence = {
                ...evidence,
                status: 'ERROR',
                diff: rawDiff,
                patchResult: { ok: false, diff: rawDiff, validateError: validation.reason },
                updatedAt: Date.now(),
            };
            return getEvidence();
        }

        // 5. Apply patch
        const patchResult = await applyPatch(repoPath, rawDiff);
        if (!patchResult.ok) {
            evidence = {
                ...evidence,
                status: 'ERROR',
                diff: rawDiff,
                patchResult,
                updatedAt: Date.now(),
            };
            return getEvidence();
        }

        // 6. Run tests again
        const testResult = await runTests(repoPath);

        // 7. Run lint
        const lintResult = await runLint(repoPath);

        const allPassed = testResult.ok && lintResult.ok;

        evidence = {
            ...evidence,
            status: allPassed ? 'PASS' : 'FAIL',
            diff: rawDiff,
            patchResult,
            testResult,
            lintResult,
            updatedAt: Date.now(),
        };
    } catch (err) {
        evidence = {
            ...evidence,
            status: 'ERROR',
            patchResult: {
                ok: false,
                diff: '',
                applyError: err instanceof Error ? err.message : String(err),
            },
            updatedAt: Date.now(),
        };
    }

    return getEvidence();
}

/**
 * Button B: Explain what's wrong without applying a fix.
 */
async function handleExplainAction(repoPath: string): Promise<EvidenceState> {
    evidence = { ...evidence, status: 'RUNNING', updatedAt: Date.now() };

    try {
        const testResult = await runTests(repoPath);
        const lintResult = await runLint(repoPath);
        const files = await collectFiles(repoPath);

        const explanation = await explainIssue({
            testOutput: testResult.stdout + '\n' + testResult.stderr,
            lintOutput: lintResult.stdout + '\n' + lintResult.stderr,
            files,
        });

        evidence = {
            ...evidence,
            status: 'IDLE',
            explanation,
            testResult,
            updatedAt: Date.now(),
        };
    } catch (err) {
        evidence = {
            ...evidence,
            status: 'ERROR',
            explanation: err instanceof Error ? err.message : String(err),
            updatedAt: Date.now(),
        };
    }

    return getEvidence();
}
