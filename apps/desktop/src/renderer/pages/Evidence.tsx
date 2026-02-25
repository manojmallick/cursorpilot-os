import React from 'react';
import type { EvidenceState } from '@cursorpilot/shared';
import { DiffViewer } from '../components/DiffViewer';
import { TestPanel } from '../components/TestPanel';
import { ModeBadge } from '../components/ModeBadge';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

interface EvidencePageProps {
    evidence: EvidenceState;
}

const STATUS_LABELS: Record<string, { icon: string; label: string }> = {
    IDLE: { icon: '⏸', label: 'Idle' },
    RUNNING: { icon: '⏳', label: 'Running…' },
    PASS: { icon: '✅', label: 'All Passed' },
    FAIL: { icon: '❌', label: 'Failed' },
    ERROR: { icon: '⚠️', label: 'Error' },
};

export const EvidencePage: React.FC<EvidencePageProps> = ({ evidence }) => {
    const statusInfo = STATUS_LABELS[evidence.status] ?? STATUS_LABELS.IDLE;

    return (
        <div className="evidence-grid">
            <div className="evidence-header">
                <ModeBadge mode={evidence.mode} />
                <span className={'status-badge status-badge--' + evidence.status.toLowerCase()}>
                    <span className="status-icon">{statusInfo.icon}</span>
                    {statusInfo.label}
                </span>
            </div>

            {evidence.status === 'IDLE' && !evidence.diff && !evidence.explanation && (
                <div className="evidence-empty">
                    <span className="evidence-empty-icon">🚀</span>
                    <span className="evidence-empty-text">
                        Press <strong>Execute (A)</strong> to fix code or <strong>Explain (B)</strong> to analyze
                    </span>
                </div>
            )}

            {evidence.patchResult && !evidence.patchResult.ok && (evidence.patchResult.applyError || evidence.patchResult.validateError) && (
                <div className="panel">
                    <div className="panel-header">
                        <span className="panel-title">
                            <span>⚠️</span>
                            {evidence.patchResult.validateError ? 'Validation Error' : 'Patch Error'}
                        </span>
                    </div>
                    <div className="panel-body error-body">
                        <pre className="error-pre">{evidence.patchResult.validateError || evidence.patchResult.applyError}</pre>
                    </div>
                </div>
            )}

            <DiffViewer diff={evidence.diff} />

            <TestPanel title="Test Results" result={evidence.testResult} icon="🧪" />
            <TestPanel title="Lint Results" result={evidence.lintResult} icon="🔍" />

            {evidence.explanation && (
                <div className="panel">
                    <div className="panel-header">
                        <span className="panel-title">
                            <span>💡</span>
                            <span>Explanation</span>
                        </span>
                    </div>
                    <div className="panel-body explanation-body">
                        <MarkdownRenderer text={evidence.explanation} />
                    </div>
                </div>
            )}
        </div>
    );
};
