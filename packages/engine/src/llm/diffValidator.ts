export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

const BLOCKED_PATHS = ['package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'];
const MAX_LINES = 3000;

/**
 * Validate that the LLM output is a well-formed unified diff
 * and doesn't touch forbidden files.
 */
export function validateDiff(diff: string): ValidationResult {
  if (!diff || diff.trim().length === 0) {
    return { ok: false, reason: 'Empty diff output' };
  }

  // Must contain diff --git header
  if (!diff.includes('diff --git')) {
    return { ok: false, reason: 'Missing "diff --git" header — not a valid unified diff' };
  }

  // Must not contain markdown code fences
  if (diff.includes('```')) {
    return { ok: false, reason: 'Contains markdown code fences — must be raw diff only' };
  }

  // Line count limit
  const lineCount = diff.split('\n').length;
  if (lineCount > MAX_LINES) {
    return { ok: false, reason: 'Diff has ' + lineCount + ' lines, exceeds limit of ' + MAX_LINES };
  }

  // Extract changed file paths from diff headers
  const pathPattern = /diff --git a\/(.+?) b\/(.+)/g;
  let match;
  while ((match = pathPattern.exec(diff)) !== null) {
    const filePath = match[2];

    // Only allow changes under src/
    if (!filePath.startsWith('src/')) {
      return { ok: false, reason: 'Change to "' + filePath + '" not allowed — only src/ is permitted' };
    }

    // Block specific files
    const fileName = filePath.split('/').pop() ?? '';
    if (BLOCKED_PATHS.includes(fileName)) {
      return { ok: false, reason: 'Change to "' + fileName + '" is blocked' };
    }

    // Block test files
    if (filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.')) {
      return { ok: false, reason: 'Change to test file "' + filePath + '" is blocked' };
    }
  }

  return { ok: true };
}
