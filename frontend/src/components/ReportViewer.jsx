import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/* ── Safe Markdown Renderer ── */
const MD = ({ children }) => {
    if (!children || typeof children !== 'string') return null;
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {children}
        </ReactMarkdown>
    );
};

/* ── Collapsible Report Section ── */
const ReportSection = ({ icon, label, accentColor, defaultOpen = true, children }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <section className="nb-section">
            <button
                className="nb-section-header"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
            >
                <span className="nb-section-icon" style={{ background: accentColor + '22', color: accentColor }}>
                    {icon}
                </span>
                <span className="nb-section-label">{label}</span>
                <span className={`nb-section-chevron ${open ? 'open' : ''}`}>›</span>
            </button>
            {open && (
                <div className="nb-section-body">
                    {children}
                </div>
            )}
        </section>
    );
};

/* ── Source Card ── */
const SourceItem = ({ source, index }) => {
    // source may be a string (URL or plain text) or an object { url, title }
    const url = typeof source === 'object' ? source.url : source;
    const title = typeof source === 'object' ? source.title : null;
    const isUrl = /^https?:\/\//.test(url);

    return (
        <div className="nb-source-item">
            <span className="nb-source-num">{index + 1}</span>
            {isUrl ? (
                <a
                    href={url}
                    className="nb-source-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {title || url}
                </a>
            ) : (
                <span className="nb-source-text">{title || url}</span>
            )}
        </div>
    );
};

/* ── Parse source lines from a raw sources string ── */
const parseSources = (raw) => {
    if (!raw || typeof raw !== 'string') return [];
    return raw
        .split('\n')
        .map(line => line.trim().replace(/^[-*\d.]+\s*/, ''))
        .filter(Boolean);
};

/* ── Main ReportViewer ── */
const ReportViewer = ({ report }) => {
    if (!report) return null;

    const {
        summary,
        introduction,
        findings,
        sections,       // may be an array of { title, body } objects
        conclusion,
        sources,        // string (raw) or array
        full_text,
    } = report;

    const sourceList = Array.isArray(sources)
        ? sources
        : parseSources(sources);

    const summaryText = summary || introduction || '';
    const findingsText = findings || '';

    return (
        <article className="nb-report">
            {/* ── Summary / Introduction ── */}
            {summaryText && (
                <ReportSection icon="📋" label="Summary" accentColor="var(--primary)" defaultOpen>
                    <div className="nb-prose">
                        <MD>{summaryText}</MD>
                    </div>
                </ReportSection>
            )}

            {/* ── Sections (structured array) ── */}
            {Array.isArray(sections) && sections.length > 0 && sections.map((sec, i) => (
                <ReportSection
                    key={i}
                    icon="🔍"
                    label={sec.title || `Section ${i + 1}`}
                    accentColor="var(--accent)"
                    defaultOpen={i === 0}
                >
                    <div className="nb-prose">
                        <MD>{sec.body || sec.content || ''}</MD>
                    </div>
                </ReportSection>
            ))}

            {/* ── Key Findings (flat string) ── */}
            {!Array.isArray(sections) && findingsText && (
                <ReportSection icon="💡" label="Key Findings" accentColor="var(--accent)" defaultOpen>
                    <div className="nb-prose">
                        <MD>{findingsText}</MD>
                    </div>
                </ReportSection>
            )}

            {/* ── Conclusion ── */}
            {conclusion && (
                <ReportSection icon="🎯" label="Conclusion" accentColor="#10B981" defaultOpen>
                    <div className="nb-prose">
                        <MD>{conclusion}</MD>
                    </div>
                </ReportSection>
            )}

            {/* ── Sources ── */}
            {sourceList.length > 0 && (
                <ReportSection
                    icon="📚"
                    label={`Sources & References (${sourceList.length})`}
                    accentColor="#F59E0B"
                    defaultOpen={false}
                >
                    <div className="nb-sources-list">
                        {sourceList.map((src, i) => (
                            <SourceItem key={i} source={src} index={i} />
                        ))}
                    </div>
                </ReportSection>
            )}

            {/* ── Fallback: full_text if no structured data ── */}
            {!summaryText && !findingsText && !conclusion && full_text && (
                <ReportSection icon="📄" label="Full Report" accentColor="var(--primary)" defaultOpen>
                    <div className="nb-prose">
                        <MD>{full_text}</MD>
                    </div>
                </ReportSection>
            )}
        </article>
    );
};

export default ReportViewer;
