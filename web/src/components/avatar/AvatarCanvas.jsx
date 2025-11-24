import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { VRMAvatar } from "./VRMAvatar";
import { Environment, OrbitControls } from '@react-three/drei';

export const AvatarCanvas = ({ speaking, visemeStream }) => {
    const [visemeIndex, setVisemeIndex] = useState(null);

    useEffect(() => {
        if (!speaking) {
            setVisemeIndex(null);
            return;
        }

        const interval = setInterval(() => {
            if (visemeStream.length > 0) {
                const v = visemeStream.shift();
                setVisemeIndex(v);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [speaking, visemeStream]);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <Canvas camera={{ position: [0, 1.4, 1.5], fov: 50 }} shadows>
                <ambientLight intensity={0.8} />
                <directionalLight position={[2, 3, 2]} intensity={1.5} castShadow />
                <Environment preset="city" />
                <VRMAvatar visemeIndex={visemeIndex} />
                <OrbitControls target={[0, 1.3, 0]} enableDamping dampingFactor={0.05} />
            </Canvas>
        </div>
    );
};
