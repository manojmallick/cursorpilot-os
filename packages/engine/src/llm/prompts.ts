import type { CollectedFile } from '../git/fileCollector.js';

export const GEMINI_INSTRUCTION = [
  'You are an expert software engineer. Your ONLY job is to output a unified diff that fixes the failing code.',
  '',
  'Rules:',
  '1. Output ONLY a valid unified diff (git diff format). Nothing else.',
  '2. Do NOT wrap the output in markdown code fences or backticks.',
  '3. Do NOT add any explanation, commentary, or notes before or after the diff.',
  '4. The diff must start with "diff --git" and each file section must be complete.',
  '5. Only modify files under the src/ directory.',
  '6. Do NOT modify package.json, lock files, test files, or jest config.',
  '7. Keep changes minimal and focused on fixing the specific issue.',
  '8. Make the minimal safe changes to make npm test and npm run lint pass.',
  '9. Do NOT change the module system: keep require() and module.exports as-is. Do NOT convert to import/export.',
  '10. Every hunk must have complete context lines. Never truncate a line mid-text.',
  '11. End the diff with a final newline character.',
  '12. Output the COMPLETE diff for ALL files that need changes. Do not stop mid-file.',
].join('\n');

/**
 * Build the user prompt with test output and source file context.
 */
export function buildUserPrompt(opts: {
  testOutput: string;
  lintOutput?: string;
  files: CollectedFile[];
  mode: string;
}): string {
  const { testOutput, lintOutput, files, mode } = opts;

  const fileContext = files
    .map((f) => '--- ' + f.path + ' ---\n' + f.content)
    .join('\n\n');

  if (mode === 'explain') {
    return [
      'Here are the source files:\n\n' + fileContext,
      '\n\nHere is the test output:\n\n' + testOutput,
      lintOutput ? '\n\nHere is the lint output:\n\n' + lintOutput : '',
      '\n\nAnalyze the code and produce a STRUCTURED explanation using this exact format:',
      '',
      '## Issues Found',
      '',
      'For EACH file that has problems, write:',
      '',
      '### `filename.js`',
      '- Bullet describing each issue',
      '- Use `inline code` for variable/function names',
      '',
      '## Fixes',
      '',
      'For EACH file that needs fixing, write:',
      '',
      '### `filename.js`',
      '- Describe each fix clearly',
      '- Show the before → after using `old code` → `new code`',
      '',
      'If a file has no issues, mention it briefly at the end.',
      'Be concise but thorough. Use markdown formatting (##, ###, `, **, -).',
    ].join('\n');
  }

  let prompt = 'Here are the source files:\n\n' + fileContext;
  prompt += '\n\nHere is the failing test output:\n\n' + testOutput;
  if (lintOutput) {
    prompt += '\n\nHere is the lint output:\n\n' + lintOutput;
  }
  prompt += '\n\nIMPORTANT: These files use CommonJS (require/module.exports). Do NOT convert to ES modules.';
  prompt += '\n\nGenerate a COMPLETE unified diff that fixes ALL the issues above. Mode: ' + mode;
  return prompt;
}
