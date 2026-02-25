import React from 'react';
import type { EvidenceState } from '@cursorpilot/shared';
import { VirtualConsole } from '../components/VirtualConsole';

interface ConsolePageProps {
    evidence: EvidenceState;
    onRotate: (delta: number) => void;
    onPressA: () => void;
    onPressB: () => void;
    onReset: () => void;
}

export const ConsolePage: React.FC<ConsolePageProps> = ({
    evidence,
    onRotate,
    onPressA,
    onPressB,
    onReset,
}) => {
    return (
        <VirtualConsole
            mode={evidence.mode}
            isRunning={evidence.status === 'RUNNING'}
            onRotate={onRotate}
            onPressA={onPressA}
            onPressB={onPressB}
            onReset={onReset}
        />
    );
};
