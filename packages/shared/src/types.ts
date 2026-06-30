// ── Modes ──────────────────────────────────────────────
export type Mode = 'SAFE' | 'PERF' | 'SEC' | 'REFACTOR';

export const ALL_MODES: Mode[] = ['SAFE', 'PERF', 'SEC', 'REFACTOR'];

// ── Action Events (simulated console) ──────────────────
export type ActionName = 'rotate' | 'press';

export interface RotateEvent {
    type: 'rotate';
    delta: number; // positive = clockwise
}

export interface PressEvent {
    type: 'press';
    buttonId: 'A' | 'B';
}

export type ActionEvent = RotateEvent | PressEvent;

// ── Patch / Run results ────────────────────────────────
export interface PatchResult {
    ok: boolean;
    diff: string;
    applyError?: string;
    validateError?: string;
}

export interface RunResult {
    ok: boolean;
    exitCode: number;
    stdout: string;
    stderr: string;
}

// ── Evidence (what the UI shows) ───────────────────────
export interface EvidenceState {
    mode: Mode;
    status: 'IDLE' | 'RUNNING' | 'PASS' | 'FAIL' | 'ERROR';
    lastEvent?: ActionEvent;
    diff: string | null;
    patchResult: PatchResult | null;
    testResult: RunResult | null;
    lintResult: RunResult | null;
    explanation: string | null;
    updatedAt: number;
}

export const INITIAL_EVIDENCE: EvidenceState = {
    mode: 'SAFE',
    status: 'IDLE',
    diff: null,
    patchResult: null,
    testResult: null,
    lintResult: null,
    explanation: null,
    updatedAt: Date.now(),
};

// ── LLM settings (user-supplied Gemini key + model) ────
export type KeySource = 'user' | 'env' | 'none';

/** Effective LLM settings shown to the UI. Never includes the raw key — only a mask. */
export interface LlmSettings {
    model: string;
    availableModels: string[];
    hasKey: boolean;
    keySource: KeySource;
    keyMask: string;
}

/** Changes requested by the UI. Empty apiKey clears the user key (falls back to env). */
export interface LlmSettingsInput {
    apiKey?: string;
    model?: string;
}

// ── IPC channel names ──────────────────────────────────
export const IPC = {
    DISPATCH: 'engine:dispatch',
    GET_EVIDENCE: 'engine:getEvidence',
    RESET: 'engine:resetRepo',
    GET_SETTINGS: 'engine:getSettings',
    SET_SETTINGS: 'engine:setSettings',
} as const;
