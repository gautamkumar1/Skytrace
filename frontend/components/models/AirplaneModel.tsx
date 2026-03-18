"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Float } from "@react-three/drei";
import { A320Model } from "./A320";

type PartStatus = "green" | "amber" | "red";

interface AirplaneModelProps {
    status: {
        undercarriage: PartStatus;
        wings: PartStatus;
        engines: PartStatus;
    };
    onPartClick: (part: string) => void;
    activePart: string | null;
}

const Airplane = ({ status, onPartClick, activePart }: AirplaneModelProps) => {
    return (
        <Float
            speed={1.5}
            rotationIntensity={0.2}
            floatIntensity={0.5}
            floatingRange={[-0.1, 0.1]}
        >
            <A320Model
                status={status}
                onPartClick={onPartClick}
                activePart={activePart}
            />
        </Float>
    );
};

export default function AirplaneCanvas({ status, onPartClick, activePart }: AirplaneModelProps) {
    const cameraSettings = React.useMemo(() => ({ position: [30, 15, 30] as [number, number, number], fov: 35 }), []);

    return (
        <div className="w-full h-full bg-white relative overflow-hidden">
            <Canvas camera={cameraSettings} shadows>
                <color attach="background" args={['#ffffff']} />

                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, 5, -10]} intensity={1} color="#ffffff" />
                <pointLight position={[0, -5, 5]} intensity={0.5} color="#ffffff" />

                <spotLight
                    position={[15, 20, 5]}
                    angle={0.3}
                    penumbra={1}
                    intensity={3}
                    castShadow
                    color="#ffffff"
                />

                <Suspense fallback={null}>
                    <Environment preset="night" />
                    <Airplane status={status} onPartClick={onPartClick} activePart={activePart} />

                    <ContactShadows
                        position={[0, -4, 0]}
                        opacity={0.4}
                        scale={40}
                        blur={2}
                        far={10}
                        color="#000000"
                    />
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    enableRotate={true}
                    enableZoom={true}
                    minDistance={10}
                    maxDistance={40}
                    enableDamping={true}
                    dampingFactor={0.05}
                    target={[0, 0, 0]}
                    makeDefault
                />
            </Canvas>

            {/* Minimal interaction hint */}
            {!activePart && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md text-[10px] font-mono text-slate-400/80 uppercase tracking-widest pointer-events-none z-10 transition-opacity duration-500">
                    Drag to rotate · Scroll to zoom
                </div>
            )}
        </div>
    );
}
