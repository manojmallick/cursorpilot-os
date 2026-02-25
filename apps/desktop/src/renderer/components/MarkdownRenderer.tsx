import React, { useMemo } from 'react';

/* ─── Types ─────────────────────────────────────────── */
interface MarkdownRendererProps { text: string; }

interface ParsedBlock {
    type: 'heading' | 'code' | 'bullet' | 'paragraph';
    content: string;
    language?: string;
    level?: number;
    indent?: number;
}

interface Section {
    title: string | null;
    icon: string;
    accent: string;        // CSS color
    accentBg: string;      // CSS background
    blocks: ParsedBlock[];
}

/* ─── Component ─────────────────────────────────────── */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
    const blocks = useMemo(() => parseBlocks(text), [text]);
    const sections = useMemo(() => groupSections(blocks), [blocks]);

    /* summary counts */
    const fileCount = blocks.filter(b => b.type === 'heading' && b.level === 3).length;
    const issueCount = sections.find(s => s.title?.toLowerCase().includes('issue'))
        ?.blocks.filter(b => b.type === 'bullet').length ?? 0;

    return (
        <div className="expl">
            {/* ── Top summary bar ── */}
            {issueCount > 0 && (
                <div className="expl-summary">
                    <span className="expl-chip expl-chip--red">{issueCount} issue{issueCount !== 1 ? 's' : ''}</span>
                    <span className="expl-chip expl-chip--blue">{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
                </div>
            )}

            {/* ── Sections ── */}
            {sections.map((sec, si) =>
                sec.title ? (
                    <div key={si} className="expl-card" style={{ '--card-accent': sec.accent, '--card-bg': sec.accentBg } as React.CSSProperties}>
                        <div className="expl-card-head">
                            <span className="expl-card-icon">{sec.icon}</span>
                            <span className="expl-card-title">{sec.title}</span>
                        </div>
                        <div className="expl-card-body">
                            {sec.blocks.map((b, bi) => renderBlock(b, bi))}
                        </div>
                    </div>
                ) : (
                    <div key={si}>
                        {sec.blocks.map((b, bi) => renderBlock(b, bi))}
                    </div>
                )
            )}
        </div>
    );
};

/* ─── Section detection ─────────────────────────────── */
function detectSection(title: string): Omit<Section, 'blocks' | 'title'> {
    const t = title.toLowerCase();
    if (t.includes('issue') || t.includes('problem') || t.includes('bug'))
        return { icon: '⚠️', accent: '#ef4444', accentBg: 'rgba(239,68,68,0.06)' };
    if (t.includes('fix') || t.includes('solution') || t.includes('change'))
        return { icon: '✅', accent: '#22c55e', accentBg: 'rgba(34,197,94,0.06)' };
    return { icon: '📌', accent: '#4f8fff', accentBg: 'rgba(79,143,255,0.06)' };
}

function groupSections(blocks: ParsedBlock[]): Section[] {
    const out: Section[] = [];
    let cur: Section = { title: null, icon: '', accent: '', accentBg: '', blocks: [] };

    for (const b of blocks) {
        if (b.type === 'heading' && b.level === 2) {
            if (cur.blocks.length || cur.title) out.push(cur);
            const meta = detectSection(b.content);
            cur = { title: b.content, ...meta, blocks: [] };
        } else {
            cur.blocks.push(b);
        }
    }
    if (cur.blocks.length || cur.title) out.push(cur);
    return out;
}

/* ─── Block rendering ───────────────────────────────── */
function renderBlock(b: ParsedBlock, key: number): React.ReactElement {
    switch (b.type) {
        case 'heading':
            return b.level === 3
                ? <div key={key} className="expl-file-tab"><span className="expl-file-dot" /><span>{renderInline(b.content)}</span></div>
                : <div key={key} className={`expl-h expl-h--${b.level}`}>{renderInline(b.content)}</div>;
        case 'code':
            return (
                <div key={key} className="expl-code-wrap">
                    {b.language && <span className="expl-code-lang">{b.language}</span>}
                    <pre className="expl-code"><code>{b.content}</code></pre>
                </div>
            );
        case 'bullet':
            return (
                <div key={key} className={`expl-li${b.indent ? ' expl-li--nested' : ''}`}>
                    <span className="expl-li-marker" />
                    <span className="expl-li-text">{renderInline(b.content)}</span>
                </div>
            );
        default:
            return <p key={key} className="expl-p">{renderInline(b.content)}</p>;
    }
}

/* ─── Markdown parser ───────────────────────────────── */
function parseBlocks(text: string): ParsedBlock[] {
    const out: ParsedBlock[] = [];
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) { i++; continue; }

        // code fence
        if (line.trim().startsWith('```')) {
            const lang = line.trim().replace(/^```/, '').trim();
            const code: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) { code.push(lines[i]); i++; }
            out.push({ type: 'code', content: code.join('\n'), language: lang });
            i++;
            continue;
        }

        // heading
        const hm = line.match(/^(#{1,3})\s+(.*)/);
        if (hm) { out.push({ type: 'heading', content: hm[2], level: hm[1].length }); i++; continue; }

        // bullet
        const bm = line.match(/^(\s*)[*\-•]\s+(.*)/);
        if (bm) { out.push({ type: 'bullet', content: bm[2], indent: Math.floor(bm[1].length / 2) }); i++; continue; }

        // paragraph
        const para: string[] = [];
        while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('```')
            && !lines[i].match(/^#{1,3}\s/) && !lines[i].match(/^\s*[*\-•]\s/)) {
            para.push(lines[i]); i++;
        }
        if (para.length) out.push({ type: 'paragraph', content: para.join(' ') });
    }
    return out;
}

/* ─── Inline formatting ─────────────────────────────── */
function renderInline(text: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    const rx = /(\*\*[^*]+\*\*|`[^`]+`|→)/g;
    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = rx.exec(text)) !== null) {
        if (m.index > last) nodes.push(text.slice(last, m.index));
        const tok = m[1];
        if (tok.startsWith('**'))
            nodes.push(<strong key={m.index} className="expl-bold">{tok.slice(2, -2)}</strong>);
        else if (tok.startsWith('`'))
            nodes.push(<code key={m.index} className="expl-ic">{tok.slice(1, -1)}</code>);
        else if (tok === '→')
            nodes.push(<span key={m.index} className="expl-arrow">→</span>);
        last = m.index + tok.length;
    }
    if (last < text.length) nodes.push(text.slice(last));
    return nodes;
}
