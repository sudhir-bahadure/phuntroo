import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { VRMAvatar } from "./VRMAvatar";
import { OrbitControls } from '@react-three/drei';

// Assuming visemeMapping is defined elsewhere or imported
// If not, we can define a simple one or import it. 
// Since the previous code used visemeMapping[viseme], let's assume it's needed.
// However, in the previous valid code, it was imported or defined.
// Let's check imports. The previous file didn't import it. 
// But VRMAvatar takes visemeIndex.
// Let's define a basic mapping here to be safe, or import it if we know where it is.
// The user's task.md mentioned `visemeMapping.js` utility.
import { visemeMapping } from "../../utils/visemeMapping";

export default function AvatarCanvas({ expression, viseme, avatarState }) {
    return (
        <Canvas
            camera={{ position: [0, 1.4, 1.5], fov: 40 }}
            style={{ width: "100%", height: "100%" }}
        >
            <ambientLight intensity={0.8} />
            <directionalLight position={[2, 2, 2]} intensity={1.2} />
            <Suspense fallback={null}>
                <VRMAvatar
                    expression={expression}
                    visemeIndex={visemeMapping[viseme]}
                    avatarState={avatarState}
                />
            </Suspense>
            <OrbitControls
                target={[0, 1.4, 0]}
                enableZoom={false}
                enablePan={false}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 3}
            />
        </Canvas>
    );
}
