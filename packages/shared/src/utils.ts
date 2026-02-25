/** Truncate a string to maxLen, appending "…" if truncated. */
export function truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 1) + '…';
}

/** Sleep for ms milliseconds. */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
