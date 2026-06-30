import type { ActionEvent, EvidenceState, LlmSettings, LlmSettingsInput } from '@cursorpilot/shared';

/** Type declaration for the API exposed by preload. */
export interface CursorPilotAPI {
    dispatch: (event: ActionEvent) => Promise<EvidenceState>;
    getEvidence: () => Promise<EvidenceState>;
    reset: () => Promise<EvidenceState>;
    getSettings: () => Promise<LlmSettings>;
    setSettings: (input: LlmSettingsInput) => Promise<LlmSettings>;
}

declare global {
    interface Window {
        api: CursorPilotAPI;
    }
}
