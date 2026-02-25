import React, { useState, useMemo } from 'react';
import type { RunResult } from '@cursorpilot/shared';

interface TestPanelProps {
    title: string;
    result: RunResult | null;
    icon?: string;
}

interface OutputLine {
    text: string;
    type: 'pass' | 'fail' | 'info' | 'plain' | 'heading';
}

function classifyLine(line: string): OutputLine['type'] {
    const t = line.trim();
    if (t.startsWith('✓') || t.startsWith('✔') || t.startsWith('PASS') || t.includes('passed')) return 'pass';
    if (t.startsWith('✗') || t.startsWith('✘') || t.startsWith('FAIL') || t.includes('failed') || t.includes('Error')) return 'fail';
    if (t.startsWith('Test Suites:') || t.startsWith('Tests:') || t.startsWith('Time:') || t.startsWith('>')) return 'info';
    if (/^\s*(PASS|FAIL)\s/.test(t)) return t.startsWith('PASS') ? 'pass' : 'fail';
    if (/problems?\s*\(/.test(t) || /errors?\s/.test(t) || /warnings?\s/.test(t)) return 'fail';
    return 'plain';
}

function parseOutput(raw: string): OutputLine[] {
    return raw.split('\n').map(text => ({
        text,
        type: classifyLine(text),
    }));
}

export const TestPanel: React.FC<TestPanelProps> = ({ title, result, icon = '🧪' }) => {
    const [isOpen, setIsOpen] = useState(true);

    const outputLines = useMemo(() => {
        if (!result) return [];
        const combined = [result.stdout, result.stderr].filter(Boolean).join('\n');
        return parseOutput(combined);
    }, [result]);

    if (!result) return null;

    return (
        <div className={`panel panel--${result.ok ? 'pass' : 'fail'}`}>
            <div className="panel-header" onClick={() => setIsOpen(!isOpen)}>
                <span className="panel-title">
                    <span>{icon}</span>
                    <span>{title}</span>
                    {result.ok ? (
                        <span className="panel-badge panel-badge--pass">✓ PASS</span>
                    ) : (
                        <span className="panel-badge panel-badge--fail">✗ FAIL (exit {result.exitCode})</span>
                    )}
                </span>
                <span className={`panel-toggle ${isOpen ? 'panel-toggle--open' : ''}`}>▶</span>
            </div>
            {isOpen && (
                <div className="panel-body">
                    {outputLines.map((line, i) => (
                        <div key={i} className={`output-line output-line--${line.type}`}>
                            <span className="output-line-number">{i + 1}</span>
                            <span className="output-line-text">{line.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
