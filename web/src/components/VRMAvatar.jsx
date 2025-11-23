import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import './VRMAvatar.css';

/* ====================== */
/*  VRM Avatar Model      */
/* ====================== */

function VRMAvatarModel({ expression = 'neutral', isTalking = false, viseme = 'neutral' }) {
    const vrmRef = useRef(null);
    const [vrm, setVrm] = useState(null);

    useEffect(() => {
        const loader = new GLTFLoader();

        // Register VRM Loader Plugin
        loader.register((parser) => new VRMLoaderPlugin(parser));

        const vrmUrls = [
            '/models/avatar.vrm',
            'https://pixiv.github.io/three-vrm/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm'
        ];

        async function loadVRM() {
            for (const url of vrmUrls) {
                try {
                    const gltf = await loader.loadAsync(url);
                    const vrmModel = gltf.userData.vrm;

                    if (vrmModel) {
                        VRMUtils.rotateVRM0(vrmModel);
                        vrmModel.scene.traverse(obj => obj.frustumCulled = false);

                        setVrm(vrmModel);
                        console.log("VRM Loaded:", url);
                        break;
                    }
                } catch (err) {
                    console.warn("VRM Load error:", err);
                }
            }
        }

        loadVRM();
    }, []);

    /* ======== Expression Logic ======== */

    const expressions = {
        neutral: {},
        happy: { happy: 1.0, mouthSmile: 0.8 },
        sad: { sad: 1.0, mouthFrown: 0.7 },
        surprised: { surprised: 1.0, mouthO: 0.8 },
        angry: { angry: 0.8, mouthAngry: 0.6 },
        relaxed: { relaxed: 0.7 }
    };

    const visemes = {
        neutral: {},
        a: { aa: 1.0 },
        e: { e: 1.0 },
        i: { ih: 1.0 },
        o: { oh: 1.0 },
        u: { ou: 1.0 }
    };

    useFrame((state, delta) => {
        if (!vrm) return;

        const manager = vrm.expressionManager;
        if (!manager) return;

        // Reset all blendshapes
        Object.keys(manager.expressionMap).forEach(name => manager.setValue(name, 0));

        // Apply emotion
        const exp = expressions[expression] || {};
        Object.entries(exp).forEach(([k, v]) => manager.setValue(k, v));

        // Apply viseme while talking
        if (isTalking && viseme !== 'neutral') {
            const vsm = visemes[viseme] || {};
            Object.entries(vsm).forEach(([k, v]) => manager.setValue(k, v * 0.7));
        }

        // Blink
        if (Math.sin(state.clock.elapsedTime * 3) > 0.98) {
            manager.setValue('blink', 1.0);
        }

        // ==============================
        // PROCEDURAL BODY ANIMATIONS
        // ==============================
        const t = state.clock.elapsedTime;
        const humanoid = vrm.humanoid;

        if (humanoid) {
            // 1. Breathing (Spine & Chest)
            const spine = humanoid.getNormalizedBoneNode('spine');
            if (spine) {
                spine.rotation.x = Math.sin(t * 1) * 0.05; // Breathe in/out
                spine.rotation.y = Math.sin(t * 0.5) * 0.02; // Subtle sway
            }

            // 2. Head Movement (Idle vs Talking)
            const neck = humanoid.getNormalizedBoneNode('neck');
            if (neck) {
                if (isTalking) {
                    // Active head bobbing while talking
                    neck.rotation.x = Math.sin(t * 10) * 0.05;
                    neck.rotation.y = Math.sin(t * 5) * 0.05;
                    neck.rotation.z = Math.sin(t * 3) * 0.02;
                } else {
                    // Slow idle look around
                    neck.rotation.x = Math.sin(t * 0.5) * 0.02;
                    neck.rotation.y = Math.sin(t * 0.3) * 0.05;
                }
            }

            // 3. Arm Gestures (Subtle)
            const leftArm = humanoid.getNormalizedBoneNode('leftUpperArm');
            const rightArm = humanoid.getNormalizedBoneNode('rightUpperArm');

            if (leftArm && rightArm) {
                // Arms relax down
                leftArm.rotation.z = Math.PI / 3; // 60 degrees down
                rightArm.rotation.z = -Math.PI / 3;

                // Subtle sway
                leftArm.rotation.x = Math.sin(t * 1) * 0.05;
                rightArm.rotation.x = Math.sin(t * 1 + Math.PI) * 0.05;

                if (isTalking) {
                    // Gestures while talking
                    rightArm.rotation.z = -Math.PI / 3 + Math.sin(t * 5) * 0.1;
                    rightArm.rotation.x = Math.sin(t * 3) * 0.2;
                }
            }
        }

        vrm.update(delta);
    });

    if (!vrm) {
        return (
            <group>
                <mesh>
                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                    <meshStandardMaterial color="#999" />
                </mesh>
            </group>
        );
    }

    return (
        <group ref={vrmRef}>
            <primitive object={vrm.scene} />
        </group>
    );
}

/* ====================== */
/*  PHUNTROO VRM Avatar   */
/* ====================== */

export default function VRMAvatar({
    expression = 'neutral',
    isTalking = false,
    viseme = 'neutral',
    className = ''
}) {
    const [expr, setExpr] = useState(expression);
    const [vis, setVis] = useState(viseme);

    useEffect(() => setExpr(expression), [expression]);
    useEffect(() => setVis(viseme), [viseme]);

    return (
        <div className={`vrm-avatar-container ${className}`}>
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 1.4, 1.5]} fov={50} />

                <ambientLight intensity={0.6} />
                <directionalLight position={[3, 3, 3]} intensity={1.5} castShadow />
                <directionalLight position={[-3, 2, -2]} intensity={0.5} />

                {/* FIX: "apartment" removed — use "city" or "sunset" */}
                <Environment preset="city" />

                <VRMAvatarModel expression={expr} isTalking={isTalking} viseme={vis} />

                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[10, 10]} />
                    <shadowMaterial opacity={0.25} />
                </mesh>

                <OrbitControls target={[0, 1, 0]} enableDamping dampingFactor={0.05} />
            </Canvas>

            <div className="expression-controls">
                <button onClick={() => setExpr('happy')}>😊</button>
                <button onClick={() => setExpr('sad')}>😢</button>
                <button onClick={() => setExpr('surprised')}>😲</button>
                <button onClick={() => setExpr('angry')}>😠</button>
                <button onClick={() => setExpr('neutral')}>😐</button>
            </div>
        </div>
    );
}
