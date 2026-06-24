import React, { useEffect, useRef, useMemo } from 'react';

/**
 * NeuralCore component: Pure Canvas 2D engine.
 * Features:
 * 1. "Grooming" nodes that drift and pulse sequentially.
 * 2. Interconnected "Network Cluster" (6-8 core nodes) that shift over time.
 * 3. 100% Opacity edges with dynamic jitter.
 */
const NeuralCore = ({ agentState = 'idle' }) => {
    const canvasRef = useRef(null);
    const nodesRef = useRef([]);
    const particlesRef = useRef([]);
    const clusterIndicesRef = useRef([]);
    const activeNodeIndexRef = useRef(0);
    const lastActivationTimeRef = useRef(0);
    const lastClusterShiftTimeRef = useRef(0);

    const colors = useMemo(() => ({
        idle: { primary: '#A855F7', secondary: 'rgba(168, 85, 247, 1.0)', glow: 'rgba(168, 85, 247, 0.2)' },
        running: { primary: '#22D3EE', secondary: 'rgba(34, 211, 238, 1.0)', glow: 'rgba(34, 211, 238, 0.4)' },
        completed: { primary: '#10B981', secondary: 'rgba(16, 185, 129, 1.0)', glow: 'rgba(16, 185, 129, 0.4)' },
        failed: { primary: '#EF4444', secondary: 'rgba(239, 68, 68, 1.0)', glow: 'rgba(239, 68, 68, 0.4)' }
    }), []);

    const theme = colors[agentState] || colors.idle;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const nodeCount = 18; // Increased slightly for more pool
        const width = 320;
        const height = 300;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        // Initialize Nodes
        if (nodesRef.current.length === 0) {
            for (let i = 0; i < nodeCount; i++) {
                nodesRef.current.push({
                    x: width / 2 + (Math.random() - 0.5) * 140,
                    y: height / 2 + (Math.random() - 0.5) * 140,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    radius: 1.5 + Math.random() * 2.5,
                    pulse: 0
                });
            }
            // Initial Cluster (7 nodes as requested range 6-8)
            clusterIndicesRef.current = [0, 1, 2, 3, 4, 5, 6];
        }

        // Initialize Particles
        if (particlesRef.current.length === 0) {
            for (let i = 0; i < 40; i++) {
                particlesRef.current.push({
                    angle: Math.random() * Math.PI * 2,
                    radius: 30 + Math.random() * 75,
                    speed: 0.004 + Math.random() * 0.012,
                    size: 0.8 + Math.random() * 1.5,
                    opacity: 0.15 + Math.random() * 0.35
                });
            }
        }

        const animate = (time) => {
            ctx.clearRect(0, 0, width, height);

            // 1. Shift Cluster membership frequently (every 1.8s)
            if (time - lastClusterShiftTimeRef.current > 1800) {
                // Swap 2 nodes for more "different edges will changes" feel
                for (let s = 0; s < 2; s++) {
                    const swapIdx = Math.floor(Math.random() * clusterIndicesRef.current.length);
                    let newNodeIdx;
                    let attempts = 0;
                    do {
                        newNodeIdx = Math.floor(Math.random() * nodeCount);
                        attempts++;
                    } while (clusterIndicesRef.current.includes(newNodeIdx) && attempts < 20);
                    clusterIndicesRef.current[swapIdx] = newNodeIdx;
                }
                lastClusterShiftTimeRef.current = time;
            }

            // 2. Sequential Grooming Activation (700ms)
            if (time - lastActivationTimeRef.current > 700) {
                activeNodeIndexRef.current = clusterIndicesRef.current[Math.floor(Math.random() * clusterIndicesRef.current.length)];
                lastActivationTimeRef.current = time;
            }

            const centerX = width / 2;
            const centerY = height / 2;

            // Particles
            particlesRef.current.forEach(p => {
                p.angle += p.speed;
                const px = centerX + Math.cos(p.angle) * p.radius;
                const py = centerY + Math.sin(p.angle) * p.radius;
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fillStyle = theme.primary;
                ctx.globalAlpha = p.opacity;
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;

            // Nodes & Network
            nodesRef.current.forEach((node, i) => {
                node.x += node.vx;
                node.y += node.vy;

                const dx = node.x - centerX;
                const dy = node.y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 110) {
                    node.vx -= dx * 0.0006;
                    node.vy -= dy * 0.0006;
                }

                const isInCluster = clusterIndicesRef.current.includes(i);
                const isActive = i === activeNodeIndexRef.current;

                if (isActive) node.pulse = Math.sin(time / 100) * 0.5 + 0.5;
                else node.pulse *= 0.94;

                // Draw Cluster Connections - 100% Opacity + Dynamic Shift
                if (isInCluster) {
                    clusterIndicesRef.current.forEach(otherIdx => {
                        if (otherIdx > i) {
                            const other = nodesRef.current[otherIdx];
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(other.x, other.y);
                            ctx.strokeStyle = theme.primary;
                            ctx.lineWidth = 0.5 + (Math.random() * 0.5); // Thickness jitter
                            ctx.globalAlpha = 1.0; // Solid Alpha as requested
                            ctx.stroke();
                        }
                    });
                }

                // Node Point
                ctx.globalAlpha = 1.0;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + (isActive ? node.pulse * 5 : 0), 0, Math.PI * 2);
                if (isInCluster || isActive) {
                    ctx.shadowBlur = isActive ? 15 : 6;
                    ctx.shadowColor = theme.primary;
                    ctx.fillStyle = isActive ? "#FFF" : theme.primary;
                } else {
                    ctx.fillStyle = "rgba(120, 120, 120, 0.4)";
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0;

                if (isActive) {
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(node.x, node.y);
                    ctx.strokeStyle = "#FFF";
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = 0.4;
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                }
            });

            // Center Pulse
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = "#FFF";
            ctx.shadowBlur = 12;
            ctx.shadowColor = theme.primary;
            ctx.fill();

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [theme]);

    return (
        <div className="neural-core-container">
            <canvas ref={canvasRef} className="neural-canvas" />
            <div className="neural-overlay-glow" style={{ background: `radial-gradient(circle, ${theme.glow} 0%, transparent 80%)` }} />
        </div>
    );
};

export default NeuralCore;
