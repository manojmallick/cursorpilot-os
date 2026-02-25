import React from 'react';
import type { Mode } from '@cursorpilot/shared';

interface ModeBadgeProps {
    mode: Mode;
}

const MODE_CONFIG: Record<Mode, { icon: string; label: string }> = {
    SAFE: { icon: '🛡️', label: 'Safe' },
    PERF: { icon: '⚡', label: 'Perf' },
    SEC: { icon: '🔒', label: 'Security' },
    REFACTOR: { icon: '♻️', label: 'Refactor' },
};

export const ModeBadge: React.FC<ModeBadgeProps> = ({ mode }) => {
    const config = MODE_CONFIG[mode];
    return (
        <span className={'mode-badge mode-badge--' + mode.toLowerCase()}>
            <span className="dot" />
            {config.icon} {config.label}
        </span>
    );
};
