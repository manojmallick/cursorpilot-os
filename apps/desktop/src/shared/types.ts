import type { ActionEvent, EvidenceState } from '@cursorpilot/shared';

/** Type declaration for the API exposed by preload. */
export interface CursorPilotAPI {
    dispatch: (event: ActionEvent) => Promise<EvidenceState>;
    getEvidence: () => Promise<EvidenceState>;
    reset: () => Promise<EvidenceState>;
}

declare global {
    interface Window {
        api: CursorPilotAPI;
    }
}
