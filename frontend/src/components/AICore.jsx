import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ── Layer 1: Outer Ring — Rotating clockwise, segmented ── */
const OuterRing = ({ agentState }) => {
    const ref = useRef();
    const speed = agentState === 'search' ? 1.2 : 0.3;

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.z = clock.getElapsedTime() * speed;
            ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
        }
    });

    const segments = useMemo(() => {
        const segs = [];
        const count = 8;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const gap = i % 3 === 0 ? 0.06 : 0.12;
            segs.push({ angle, length: Math.PI * 2 / count - gap });
        }
        return segs;
    }, []);

    return (
        <group ref={ref}>
            {segments.map((seg, i) => (
                <mesh key={i} rotation={[Math.PI / 2, 0, seg.angle]}>
                    <torusGeometry args={[2.2, 0.015, 8, 32, seg.length]} />
                    <meshBasicMaterial color="#A855F7" transparent opacity={0.4} />
                </mesh>
            ))}
        </group>
    );
};

/* ── Layer 2: Middle Ring — Counter-clockwise with energy waves ── */
const MiddleRing = ({ agentState }) => {
    const ref = useRef();
    const matRef = useRef();
    const speed = agentState === 'scrape' ? 0.8 : 0.4;

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.z = -clock.getElapsedTime() * speed;
            ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
        }
        if (matRef.current) {
            matRef.current.opacity = 0.25 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
        }
    });

    return (
        <group ref={ref}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.6, 0.02, 8, 64]} />
                <meshBasicMaterial ref={matRef} color="#22D3EE" transparent opacity={0.3} />
            </mesh>
        </group>
    );
};

/* ── Layer 3: Inner Ring — Pulsing ── */
const InnerRing = ({ agentState }) => {
    const ref = useRef();

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.getElapsedTime();
            const scale = 1 + Math.sin(t * 1.5) * 0.08;
            ref.current.scale.set(scale, scale, scale);
            ref.current.rotation.z = t * 0.2;
        }
    });

    return (
        <group ref={ref}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.0, 0.025, 8, 48]} />
                <meshBasicMaterial color="#C084FC" transparent opacity={0.35} />
            </mesh>
        </group>
    );
};

/* ── Layer 4: Core Energy Sphere ── */
const CoreSphere = ({ agentState }) => {
    const meshRef = useRef();

    const color = useMemo(() => {
        switch (agentState) {
            case 'search': return '#22D3EE';
            case 'scrape': return '#34D399';
            case 'write': return '#A855F7';
            case 'critique': return '#C084FC';
            case 'completed': return '#10B981';
            case 'failed': return '#EF4444';
            default: return '#64748B';
        }
    }, [agentState]);

    return (
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
            <mesh>
                <sphereGeometry args={[0.55, 64, 64]} />
                <MeshDistortMaterial
                    ref={meshRef}
                    color={color}
                    distort={0.3}
                    speed={3}
                    roughness={0.1}
                    metalness={0.9}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </mesh>
        </Float>
    );
};

/* ── Layer 5: Particle Field ── */
const ParticleField = ({ count = 800 }) => {
    const ref = useRef();

    const [positions, sizes] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const sz = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            // Spherical distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 1.5 + Math.random() * 2.5;
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
            sz[i] = Math.random() * 2 + 0.5;
        }
        return [pos, sz];
    }, [count]);

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.y = clock.getElapsedTime() * 0.05;
            ref.current.rotation.x = clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
            </bufferGeometry>
            <pointsMaterial
                color="#8B5CF6"
                size={0.02}
                transparent
                opacity={0.5}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

/* ── Layer 6: Energy Arcs ── */
const EnergyArc = ({ startAngle, radius, color }) => {
    const ref = useRef();

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.material.opacity = 0.15 + Math.sin(clock.getElapsedTime() * 3 + startAngle) * 0.15;
        }
    });

    return (
        <mesh ref={ref} rotation={[Math.PI / 2, 0, startAngle]}>
            <torusGeometry args={[radius, 0.008, 4, 16, Math.PI * 0.4]} />
            <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </mesh>
    );
};

const EnergyArcs = () => {
    const arcs = useMemo(() => {
        const result = [];
        const colors = ['#A855F7', '#22D3EE', '#67E8F9', '#C084FC'];
        for (let i = 0; i < 6; i++) {
            result.push({
                startAngle: (i / 6) * Math.PI * 2 + Math.random(),
                radius: 1.3 + Math.random() * 1.2,
                color: colors[i % colors.length],
            });
        }
        return result;
    }, []);

    return (
        <group>
            {arcs.map((arc, i) => (
                <EnergyArc key={i} {...arc} />
            ))}
        </group>
    );
};

/* ── Layer 7: Data Streams ── */
const DataStream = ({ index }) => {
    const ref = useRef();
    const angle = (index / 4) * Math.PI * 2;

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.getElapsedTime();
            const progress = ((t * 0.5 + index * 0.5) % 3) / 3;
            const r = 0.8 + progress * 2;
            ref.current.position.x = Math.cos(angle + t * 0.3) * r;
            ref.current.position.y = Math.sin(angle + t * 0.3) * r;
            ref.current.position.z = Math.sin(t + index) * 0.3;
            ref.current.material.opacity = 1 - progress;
            const s = 0.04 * (1 - progress * 0.5);
            ref.current.scale.set(s * 30, s * 30, s * 30);
        }
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#67E8F9" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </mesh>
    );
};

const DataStreams = () => (
    <group>
        {Array.from({ length: 8 }, (_, i) => (
            <DataStream key={i} index={i} />
        ))}
    </group>
);

/* ── Main AICore Component ── */
const AICore = ({ state = 'pending' }) => {
    return (
        <div className="ai-core-container">
            <div className="ai-core-glow" />
            <Canvas camera={{ position: [0, 0, 5.5], fov: 40 }} style={{ width: '100%', height: '100%' }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 5, 5]} intensity={0.6} color="#A855F7" />
                <pointLight position={[-5, -3, 3]} intensity={0.4} color="#22D3EE" />

                <OuterRing agentState={state} />
                <MiddleRing agentState={state} />
                <InnerRing agentState={state} />
                <CoreSphere agentState={state} />
                <ParticleField count={800} />
                <EnergyArcs />
                <DataStreams />
            </Canvas>
        </div>
    );
};

export default AICore;
