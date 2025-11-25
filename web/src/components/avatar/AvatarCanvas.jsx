import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { VRMAvatar } from "./VRMAvatar";
import { OrbitControls } from '@react-three/drei';

export default function AvatarCanvas({ expression, visemes, avatarState, url }) {
    const [visemeIndex, setVisemeIndex] = useState(0);

    useEffect(() => {
        if (!visemes) return;

        const interval = setInterval(() => {
            if (visemes.length > 0) {
                const v = visemes.shift();
                setVisemeIndex(v);
            } else {
                setVisemeIndex(0); // Reset to neutral if queue empty
            }
        }, 50); // Update every 50ms

        return () => clearInterval(interval);
    }, [visemes]);

    return (
        <Canvas
            camera={{ position: [0, 0.85, 2.1], fov: 35 }}
            style={{ width: "100%", height: "100%" }}
        >
            <ambientLight intensity={0.8} />
            <directionalLight position={[2, 2, 2]} intensity={1.2} />
            <Suspense fallback={null}>
                <VRMAvatar
                    expression={expression}
                    visemeIndex={visemeIndex}
                    avatarState={avatarState}
                    url={url}
                />
            </Suspense>
            <OrbitControls
                target={[0, 0.85, 0]}
                enableZoom={true}
                enablePan={false}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 4}
                minDistance={1.0}
                maxDistance={4.0}
            />
        </Canvas>
    );
}
