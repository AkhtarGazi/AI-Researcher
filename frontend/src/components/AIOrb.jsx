import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const PulsingOrb = ({ state = 'pending' }) => {
    const mesh = useRef();

    // Decide color based on research phase
    const orbColor = useMemo(() => {
        switch (state) {
            case 'search': return '#22D3EE'; // Cyan
            case 'scrape': return '#34D399'; // Green/Cyan
            case 'write': return '#8B5CF6';  // Violet
            case 'critique': return '#A78BFA'; // Light Violet
            case 'completed': return '#10B981'; // Success Green
            case 'failed': return '#EF4444';     // Error Red
            default: return '#64748B';           // Gray
        }
    }, [state]);

    useFrame((time) => {
        if (mesh.current) {
            const t = time.clock.getElapsedTime();
            mesh.current.distort = 0.3 + Math.sin(t) * 0.1;
            mesh.current.speed = state === 'write' ? 5 : 2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere args={[1, 100, 200]}>
                <MeshDistortMaterial
                    ref={mesh}
                    color={orbColor}
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0}
                    metalness={0.8}
                />
            </Sphere>
        </Float>
    );
};

const Particles = ({ count = 500 }) => {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 10;
            p[i * 3 + 1] = (Math.random() - 0.5) * 10;
            p[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return p;
    }, [count]);

    const ref = useRef();
    useFrame((state) => {
        const t = state.clock.getElapsedTime() * 0.1;
        ref.current.rotation.y = t;
        ref.current.rotation.x = t * 0.5;
    });

    return (
        <Points ref={ref} positions={points}>
            <PointMaterial
                transparent
                color="#8B5CF6"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </Points>
    );
};

const AIOrb = ({ state }) => {
    return (
        <div className="orb-container glass-card">
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <PulsingOrb state={state} />
                <Particles count={200} />
            </Canvas>
        </div>
    );
};

export default AIOrb;
