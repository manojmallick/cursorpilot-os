import React, { useState, useCallback } from 'react';
import type { EvidenceState, ActionEvent } from '@cursorpilot/shared';
import { INITIAL_EVIDENCE } from '@cursorpilot/shared';
import { ConsolePage } from './pages/Console';
import { EvidencePage } from './pages/Evidence';
import './styles.css';

export default function App() {
    const [evidence, setEvidence] = useState<EvidenceState>({ ...INITIAL_EVIDENCE });

    const dispatchAction = useCallback(async (event: ActionEvent) => {
        // Optimistic: set running immediately for press events
        if (event.type === 'press') {
            setEvidence((prev) => ({ ...prev, status: 'RUNNING' as const, updatedAt: Date.now() }));
        }
        try {
            const result = await window.api.dispatch(event);
            setEvidence(result);
        } catch (err) {
            setEvidence((prev) => ({
                ...prev,
                status: 'ERROR' as const,
                patchResult: {
                    ok: false,
                    diff: '',
                    applyError: err instanceof Error ? err.message : String(err),
                },
                updatedAt: Date.now(),
            }));
        }
    }, []);

    const handleRotate = useCallback(
        (delta: number) => {
            dispatchAction({ type: 'rotate', delta });
        },
        [dispatchAction],
    );

    const handlePressA = useCallback(() => {
        dispatchAction({ type: 'press', buttonId: 'A' });
    }, [dispatchAction]);

    const handlePressB = useCallback(() => {
        dispatchAction({ type: 'press', buttonId: 'B' });
    }, [dispatchAction]);

    const handleReset = useCallback(async () => {
        try {
            const result = await window.api.reset();
            setEvidence(result);
        } catch (err) {
            console.error('Reset failed:', err);
        }
    }, []);

    return (
        <div className="app-layout">
            <aside className="app-sidebar">
                <ConsolePage
                    evidence={evidence}
                    onRotate={handleRotate}
                    onPressA={handlePressA}
                    onPressB={handlePressB}
                    onReset={handleReset}
                />
            </aside>

            <main className="app-main">
                <header className="app-header">
                    <span className="app-title">CursorPilot OS</span>
                </header>
                <div className="app-content">
                    <EvidencePage evidence={evidence} />
                </div>
            </main>
        </div>
    );
}
