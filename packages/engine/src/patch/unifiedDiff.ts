/**
 * Parse a unified diff string into individual file diffs.
 */
export interface FileDiff {
    fromPath: string;
    toPath: string;
    hunks: string;
}

export function parseUnifiedDiff(diff: string): FileDiff[] {
    const results: FileDiff[] = [];
    const parts = diff.split(/(?=^diff --git)/m);

    for (const part of parts) {
        if (!part.trim()) continue;

        const headerMatch = part.match(/^diff --git a\/(.+?) b\/(.+)/);
        if (!headerMatch) continue;

        results.push({
            fromPath: headerMatch[1],
            toPath: headerMatch[2],
            hunks: part,
        });
    }

    return results;
}

/**
 * Format file diffs back into a unified diff string.
 */
export function formatUnifiedDiff(fileDiffs: FileDiff[]): string {
    return fileDiffs.map((fd) => fd.hunks).join('\n');
}
