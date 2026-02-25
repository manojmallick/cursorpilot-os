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

// ── IPC channel names ──────────────────────────────────
export const IPC = {
    DISPATCH: 'engine:dispatch',
    GET_EVIDENCE: 'engine:getEvidence',
    RESET: 'engine:resetRepo',
} as const;
