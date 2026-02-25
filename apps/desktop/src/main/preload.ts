import { contextBridge, ipcRenderer } from 'electron';
import type { ActionEvent, EvidenceState } from '@cursorpilot/shared';
import { IPC } from '@cursorpilot/shared';

/**
 * Expose a safe API to the renderer process via contextBridge.
 * Renderer calls window.api.* — never touches Node directly.
 */
contextBridge.exposeInMainWorld('api', {
    dispatch: (event: ActionEvent): Promise<EvidenceState> =>
        ipcRenderer.invoke(IPC.DISPATCH, event),

    getEvidence: (): Promise<EvidenceState> =>
        ipcRenderer.invoke(IPC.GET_EVIDENCE),

    reset: (): Promise<EvidenceState> =>
        ipcRenderer.invoke(IPC.RESET),
});
