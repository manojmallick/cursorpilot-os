import React, { useMemo, useState } from 'react';

/* ─── Types ─── */
interface DiffViewerProps { diff: string | null; }

interface DiffFile { filename: string; hunks: DiffHunk[]; added: number; removed: number; }
interface DiffHunk { header: string; lines: DiffLine[]; }
interface DiffLine {
    type: 'add' | 'remove' | 'context';
    content: string;
    oldNum: number | null;
    newNum: number | null;
}

/* ─── Parser ─── */
function parseDiff(raw: string): DiffFile[] {
    const files: DiffFile[] = [];
    const lines = raw.split('\n');
    let cur: DiffFile | null = null;
    let hunk: DiffHunk | null = null;
    let oLine = 0, nLine = 0;

    for (const line of lines) {
        if (line.startsWith('diff --git')) {
            const m = line.match(/diff --git a\/(.*) b\/(.*)/);
            cur = { filename: m ? m[2] : line, hunks: [], added: 0, removed: 0 };
            files.push(cur);
            hunk = null;
            continue;
        }
        if (!cur) continue;
        if (line.startsWith('index ') || line.startsWith('--- ') || line.startsWith('+++ ')) continue;

        if (line.startsWith('@@')) {
            const m = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)/);
            oLine = m ? parseInt(m[1], 10) : 0;
            nLine = m ? parseInt(m[2], 10) : 0;
            hunk = { header: line, lines: [] };
            cur.hunks.push(hunk);
            continue;
        }
        if (!hunk) continue;

        if (line.startsWith('+')) {
            cur.added++;
            hunk.lines.push({ type: 'add', content: line.substring(1), oldNum: null, newNum: nLine++ });
        } else if (line.startsWith('-')) {
            cur.removed++;
            hunk.lines.push({ type: 'remove', content: line.substring(1), oldNum: oLine++, newNum: null });
        } else {
            hunk.lines.push({ type: 'context', content: line.startsWith(' ') ? line.substring(1) : line, oldNum: oLine++, newNum: nLine++ });
        }
    }
    return files;
}

/* ─── Component ─── */
export const DiffViewer: React.FC<DiffViewerProps> = ({ diff }) => {
    const files = useMemo(() => (diff ? parseDiff(diff) : []), [diff]);
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

    if (!diff) {
        return (
            <div className="dv">
                <div className="dv-bar"><span className="dv-bar-title"><span>📝</span> Diff</span></div>
                <div className="dv-empty">
                    <div className="dv-empty-icon">📝</div>
                    <span>No diff generated yet</span>
                </div>
            </div>
        );
    }

    const totalAdded = files.reduce((s, f) => s + f.added, 0);
    const totalRemoved = files.reduce((s, f) => s + f.removed, 0);

    return (
        <div className="dv">
            {/* ── Top bar ── */}
            <div className="dv-bar">
                <span className="dv-bar-title"><span>📝</span> Generated Diff</span>
                <div className="dv-bar-stats">
                    <span className="dv-chip dv-chip--green">+{totalAdded}</span>
                    <span className="dv-chip dv-chip--red">−{totalRemoved}</span>
                    <span className="dv-chip dv-chip--blue">{files.length} file{files.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* ── Files ── */}
            <div className="dv-scroll">
                {files.map((file, fi) => {
                    const isCollapsed = collapsed[fi] ?? false;
                    return (
                        <div key={fi} className="dv-file">
                            <button className="dv-file-head" onClick={() => setCollapsed({ ...collapsed, [fi]: !isCollapsed })}>
                                <span className="dv-file-chevron">{isCollapsed ? '▶' : '▼'}</span>
                                <span className="dv-file-dot" />
                                <span className="dv-file-name">{file.filename}</span>
                                <span className="dv-file-stats">
                                    {file.added > 0 && <span className="dv-file-add">+{file.added}</span>}
                                    {file.removed > 0 && <span className="dv-file-rm">−{file.removed}</span>}
                                </span>
                            </button>

                            {!isCollapsed && (
                                <div className="dv-file-body">
                                    {file.hunks.map((hunk, hi) => (
                                        <div key={hi} className="dv-hunk">
                                            <div className="dv-row dv-row--hunk">
                                                <span className="dv-gutter">⋯</span>
                                                <span className="dv-gutter">⋯</span>
                                                <span className="dv-hunk-text">{hunk.header}</span>
                                            </div>
                                            {hunk.lines.map((line, li) => (
                                                <div key={li} className={`dv-row dv-row--${line.type}`}>
                                                    <span className="dv-gutter">{line.oldNum ?? ''}</span>
                                                    <span className="dv-gutter">{line.newNum ?? ''}</span>
                                                    <span className="dv-prefix">
                                                        {line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ' '}
                                                    </span>
                                                    <span className="dv-code">{line.content || '\u00A0'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
