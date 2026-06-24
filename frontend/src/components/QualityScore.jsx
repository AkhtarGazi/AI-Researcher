import React, { useEffect, useRef } from 'react';

const getScoreColor = (score) => {
    if (score === null || score === undefined) return '#64748B';
    if (score >= 8) return '#10B981';   // green
    if (score >= 5) return '#F59E0B';   // orange
    return '#EF4444';                    // red
};

const getScoreLabel = (score) => {
    if (score === null || score === undefined) return 'N/A';
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Work';
};

const QualityScore = ({ score }) => {
    const canvasRef = useRef(null);
    const numericScore = typeof score === 'number' ? score : parseFloat(score);
    const valid = !isNaN(numericScore);
    const color = getScoreColor(valid ? numericScore : null);
    const pct = valid ? Math.min(numericScore / 10, 1) : 0;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const size = 100;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const r = 38;
        const startAngle = Math.PI * 0.75;
        const endAngle = Math.PI * 2.25;
        const fullSweep = endAngle - startAngle;

        // Track (background arc)
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (valid && pct > 0) {
            // Filled arc with gradient
            const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
            if (numericScore >= 8) {
                grad.addColorStop(0, '#22D3EE');
                grad.addColorStop(1, '#10B981');
            } else if (numericScore >= 5) {
                grad.addColorStop(0, '#F59E0B');
                grad.addColorStop(1, '#EF4444');
            } else {
                grad.addColorStop(0, '#EF4444');
                grad.addColorStop(1, '#DC2626');
            }
            ctx.beginPath();
            ctx.arc(cx, cy, r, startAngle, startAngle + fullSweep * pct);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }, [pct, valid, numericScore]);

    return (
        <div className="quality-score-wrap">
            <div className="quality-score-label">Research Quality</div>
            <div className="quality-score-body">
                <canvas ref={canvasRef} className="quality-score-canvas" />
                <div className="quality-score-center">
                    <div className="quality-score-num" style={{ color }}>
                        {valid ? numericScore.toFixed(1) : '—'}
                    </div>
                    <div className="quality-score-denom">/10</div>
                </div>
            </div>
            <div className="quality-score-tag" style={{ color }}>
                {valid ? getScoreLabel(numericScore) : 'Score pending'}
            </div>
        </div>
    );
};

export default QualityScore;
