import React from 'react';
import type { Mode } from '@cursorpilot/shared';
import { ModeBadge } from './ModeBadge';

interface VirtualConsoleProps {
    mode: Mode;
    isRunning: boolean;
    onRotate: (delta: number) => void;
    onPressA: () => void;
    onPressB: () => void;
    onReset: () => void;
}

const MODE_COLORS: Record<Mode, string> = {
    SAFE: '#22c55e',
    PERF: '#f59e0b',
    SEC: '#ef4444',
    REFACTOR: '#06b6d4',
};

export const VirtualConsole: React.FC<VirtualConsoleProps> = ({
    mode,
    isRunning,
    onRotate,
    onPressA,
    onPressB,
    onReset,
}) => {
    const modeColor = MODE_COLORS[mode] ?? '#4f8fff';

    return (
        <div className="vc">
            <div className="vc-label">
                <span className="vc-label-dot" />
                <span>Control Center</span>
            </div>

            {/* ── Ring ── */}
            <div className="vc-ring-wrap">
                <div
                    className={`vc-ring${isRunning ? ' vc-ring--spinning' : ''}`}
                    style={{ '--ring-color': modeColor } as React.CSSProperties}
                >
                    <div className="vc-ring-glow" />
                    <div className="vc-ring-inner">
                        <ModeBadge mode={mode} />
                    </div>
                </div>
            </div>

            {/* ── Mode switcher ── */}
            <div className="vc-nav">
                <button className="vc-nav-btn" onClick={() => onRotate(-1)} disabled={isRunning} title="Previous mode">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <span className="vc-nav-label">{mode.toUpperCase()}</span>
                <button className="vc-nav-btn" onClick={() => onRotate(1)} disabled={isRunning} title="Next mode">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
            </div>

            {/* ── Action buttons ── */}
            <div className="vc-actions">
                <button className="vc-btn vc-btn--primary" onClick={onPressA} disabled={isRunning}>
                    {isRunning ? (
                        <><span className="spinner" /> Analyzing…</>
                    ) : (
                        <><span className="vc-btn-icon">⚡</span> Execute</>
                    )}
                </button>
                <button className="vc-btn vc-btn--ghost" onClick={onPressB} disabled={isRunning}>
                    <span className="vc-btn-icon">💬</span> Explain
                </button>
            </div>

            {/* ── Reset ── */}
            <button className="vc-reset" onClick={onReset} disabled={isRunning}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                <span>Reset Demo Repo</span>
            </button>
        </div>
    );
};
