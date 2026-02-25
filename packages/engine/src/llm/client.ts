import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_INSTRUCTION, buildUserPrompt } from './prompts.js';
import type { CollectedFile } from '../git/fileCollector.js';
import dotenv from 'dotenv';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

// Search upward from CWD to find the .env file at the monorepo root
function findEnvFile(): string | undefined {
    let dir = process.cwd();
    for (let i = 0; i < 5; i++) {
        const candidate = join(dir, '.env');
        if (existsSync(candidate)) return candidate;
        const parent = resolve(dir, '..');
        if (parent === dir) break;
        dir = parent;
    }
    return undefined;
}

const envPath = findEnvFile();
if (envPath) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn('GEMINI_API_KEY not set — LLM calls will fail');
}

const genAI = new GoogleGenerativeAI(apiKey ?? '');
const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

/**
 * Clean stray lines between diff file sections and fix hunk line counts.
 */
function cleanDiffBetweenFiles(diff: string): string {
    const lines = diff.split('\n');
    const cleaned: string[] = [];
    let inHunk = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = lines[i + 1] ?? '';

        if (line.startsWith('diff --git')) {
            inHunk = false;
            cleaned.push(line);
            continue;
        }

        if (line.startsWith('@@')) {
            inHunk = true;
            cleaned.push(line);
            continue;
        }

        if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('index ')) {
            cleaned.push(line);
            continue;
        }

        if (inHunk) {
            // Valid hunk line: starts with +, -, space, or is empty (context)
            if (line.startsWith('+') || line.startsWith('-') || line.startsWith(' ') || line === '') {
                // But if this is a lone +/- with empty content right before a new diff section, skip it
                if ((line === '+' || line === '-') && nextLine.startsWith('diff --git')) {
                    continue; // stray added/removed blank line between sections
                }
                cleaned.push(line);
            }
            // Skip any other unexpected line in a hunk
        }
        // Skip lines outside hunks that aren't diff headers
    }

    // Recalculate hunk headers to match actual line counts
    return fixHunkHeaders(cleaned).join('\n');
}

/**
 * Recalculate @@ line counts so they match the actual +/- lines in each hunk.
 */
function fixHunkHeaders(lines: string[]): string[] {
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].startsWith('@@')) {
            result.push(lines[i]);
            continue;
        }

        // Count actual lines in this hunk
        let oldCount = 0;
        let newCount = 0;
        let j = i + 1;
        while (j < lines.length && !lines[j].startsWith('@@') && !lines[j].startsWith('diff --git')) {
            const l = lines[j];
            if (l.startsWith('-')) oldCount++;
            else if (l.startsWith('+')) newCount++;
            else if (l.startsWith(' ') || l === '') { oldCount++; newCount++; }
            j++;
        }

        // Parse the original header to get starting line numbers
        const match = lines[i].match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)/);
        if (match) {
            const header = '@@ -' + match[1] + ',' + oldCount + ' +' + match[2] + ',' + newCount + ' @@' + (match[3] || '');
            result.push(header);
        } else {
            result.push(lines[i]); // keep as-is if can't parse
        }
    }

    return result;
}

/**
 * Sort hunks within each file section by their old-file start line and
 * recalculate the new-file start positions to match the cumulative offset.
 * This fixes the "misordered hunks" error from patch/git apply.
 */
function sortAndRebaseHunks(diff: string): string {
    // Split on "diff --git" boundaries, preserving the delimiter
    const sections = diff.split(/(?=diff --git )/);

    return sections.map(section => {
        const firstHunk = section.search(/^@@/m);
        if (firstHunk === -1) return section;

        const header = section.slice(0, firstHunk);
        const hunkBlock = section.slice(firstHunk);

        // Split into individual hunks, keeping the @@ line with each
        const rawHunks = hunkBlock.split(/(?=^@@)/m).filter(Boolean);

        // Parse start/count values and sort by old-file start line
        const parsed = rawHunks.map(h => {
            const m = h.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
            return {
                oldStart: m ? parseInt(m[1]) : 0,
                oldCount: m ? parseInt(m[2] ?? '1') : 1,
                newCount: m ? parseInt(m[4] ?? '1') : 1,
                raw: h,
            };
        });
        parsed.sort((a, b) => a.oldStart - b.oldStart);

        // Rewrite each hunk's +newStart based on cumulative line-count delta
        let offset = 0;
        const rebased = parsed.map(({ oldStart, oldCount, newCount, raw }) => {
            const newStart = Math.max(1, oldStart + offset);
            offset += newCount - oldCount;
            return raw.replace(/^(@@ -\d+(?:,\d+)? \+)\d+/, '$1' + newStart);
        });

        return header + rebased.join('');
    }).join('');
}

/**
 * When Gemini outputs a standard unified diff without "diff --git" headers,
 * synthesize them from the "--- a/" / "+++ b/" lines so git apply works.
 */
function addMissingGitHeaders(diff: string): string {
    if (diff.includes('diff --git')) return diff;

    const lines = diff.split('\n');
    const result: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const next = lines[i + 1] ?? '';
        if (line.startsWith('--- a/') && next.startsWith('+++ b/')) {
            const path = line.slice(6); // strip "--- a/"
            result.push('diff --git a/' + path + ' b/' + path);
        }
        result.push(line);
    }
    return result.join('\n');
}

/**
 * Strip markdown code fences, preamble text, and normalize the diff output.
 */
function sanitizeGeminiOutput(raw: string): string {
    let text = raw.trim();

    // Remove ```diff ... ``` or ``` ... ``` wrappers
    text = text.replace(/^```(?:diff)?\s*\n?/, '');
    text = text.replace(/\n?```\s*$/, '');

    // Normalize line endings to LF
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // If there's text before the first diff header (git or standard), strip it
    const gitStart = text.indexOf('diff --git');
    const stdStart = text.search(/^--- a\//m);
    const diffStart = gitStart >= 0 ? gitStart : stdStart >= 0 ? stdStart : -1;
    if (diffStart > 0) {
        text = text.substring(diffStart);
    }

    // Synthesize missing "diff --git" headers from "--- a/" / "+++ b/" lines
    text = addMissingGitHeaders(text);

    // Clean up stray lines between diff sections and fix hunk counts
    text = cleanDiffBetweenFiles(text);

    // Sort hunks into ascending line-number order and rebase new-file positions
    text = sortAndRebaseHunks(text);

    text = text.trim();

    // Ensure trailing newline (git apply requires it)
    if (text.length > 0 && !text.endsWith('\n')) {
        text += '\n';
    }

    return text;
}

/**
 * Ask Gemini to generate a unified diff that fixes failing code.
 */
export async function generateDiff(opts: {
    testOutput: string;
    lintOutput?: string;
    files: CollectedFile[];
    mode: string;
}): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: GEMINI_INSTRUCTION,
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
        },
    });

    const userPrompt = buildUserPrompt({
        testOutput: opts.testOutput,
        lintOutput: opts.lintOutput,
        files: opts.files,
        mode: opts.mode,
    });

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const raw = response.text();

    return sanitizeGeminiOutput(raw);
}

/**
 * Ask Gemini to explain what's wrong with the code.
 */
export async function explainIssue(opts: {
    testOutput: string;
    lintOutput?: string;
    files: CollectedFile[];
}): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: 'You are an expert software engineer. Explain concisely what is wrong and how to fix it.',
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
        },
    });

    const userPrompt = buildUserPrompt({
        testOutput: opts.testOutput,
        lintOutput: opts.lintOutput,
        files: opts.files,
        mode: 'explain',
    });

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    return response.text().trim();
}
