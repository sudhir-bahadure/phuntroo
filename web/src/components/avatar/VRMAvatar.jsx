import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VRMUtils, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTFLoader } from 'three-stdlib';

const VISEME_NAMES = ["aa", "ih", "ou", "ee", "oh", "sil"];

export const VRMAvatar = ({ visemeIndex, avatarState }) => {
    const vrmRef = useRef(null);
    const mixerRef = useRef(null);
    const [loadedScene, setLoadedScene] = useState(null);

    // Mouse / pointer tracking
    const pointer = useRef({ x: 0, y: 0 });
    useEffect(() => {
        const handler = (e) => {
            pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener("pointermove", handler);
        return () => window.removeEventListener("pointermove", handler);
    }, []);

    // Blinking timer
    const blinkTimer = useRef(0);
    const blinkValue = useRef(0);

    // Breathing
    const breatheTime = useRef(0);

    // Physics state
    const physicsState = useRef({
        offset: new THREE.Vector2(0, 0),
        velocity: new THREE.Vector2(0, 0),
    });

    // Load VRM
    useEffect(() => {
        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));

        // Use absolute path or base URL logic
        const modelPath = `${import.meta.env.BASE_URL}models/avatar.vrm`;

        loader.load(
            modelPath,
            (gltf) => {
                VRMUtils.rotateVRM0(gltf.scene);
                const vrm = gltf.userData.vrm;

                vrmRef.current = vrm;
                setLoadedScene(vrm.scene);

                mixerRef.current = new THREE.AnimationMixer(vrm.scene);

                // Ensure meshes are visible
                vrm.scene.traverse(obj => obj.frustumCulled = false);

                console.log("✅ VRM Loaded (Realistic Mode)");
            },
            undefined,
            (err) => console.error("VRM load error:", err)
        );
    }, []);

    useFrame((state, delta) => {
        const vrm = vrmRef.current;
        if (!vrm) return;

        const t = state.clock.elapsedTime;

        // ==== AUTONOMOUS GAZE & HEAD TRACKING ====
        // Calculate target based on state
        let targetLookAt = { x: 0, y: 0 };

        if (avatarState === 'listening') {
            // Look at user (camera)
            targetLookAt = { x: 0, y: 0 };
        } else if (avatarState === 'thinking') {
            // Look up/away
            targetLookAt = { x: 0.5, y: 0.5 };
        } else if (avatarState === 'talking') {
            // Look at user but with some natural motion
            targetLookAt = {
                x: Math.sin(t * 0.5) * 0.1,
                y: Math.sin(t * 0.3) * 0.05
            };
        } else {
            // Idle: Look around randomly
            // We can use noise or simple sine waves for now
            targetLookAt = {
                x: Math.sin(t * 0.2) * 0.3 + Math.sin(t * 1.5) * 0.1,
                y: Math.sin(t * 0.15) * 0.1
            };
        }

        // Smoothly interpolate current pointer/lookAt
        pointer.current.x += (targetLookAt.x - pointer.current.x) * 0.05;
        pointer.current.y += (targetLookAt.y - pointer.current.y) * 0.05;

        // Apply to head
        const head = vrm.humanoid?.getNormalizedBoneNode("head");
        if (head) {
            head.rotation.y = pointer.current.x * 0.6;
            head.rotation.x = pointer.current.y * 0.4;
        }

        // ==== BLINKING ====
        blinkTimer.current += delta;
        // Blink more often when talking or thinking
        const blinkThreshold = avatarState === 'thinking' ? 2 : 4;
        if (blinkTimer.current > blinkThreshold + Math.random() * 2) {
            blinkTimer.current = 0;
            blinkValue.current = 1;
        }
        if (blinkValue.current > 0) {
            blinkValue.current = Math.max(0, blinkValue.current - delta * 10); // Faster blink
        }
        if (vrm.expressionManager) {
            vrm.expressionManager.setValue("blink", blinkValue.current);
        }

        // ==== BREATHING & BODY SWAY ====
        // Breathe faster when talking
        const breatheSpeed = avatarState === 'talking' ? 2.5 : 1.2;
        breatheTime.current += delta * breatheSpeed;

        const breathe = (Math.sin(breatheTime.current) + 1) * 0.02;
        const chest = vrm.humanoid?.getNormalizedBoneNode("chest");
        if (chest) {
            chest.position.y = breathe;
        }

        // ==== INTERACTION PHYSICS / IDLE MOTION ====
        const spine = vrm.humanoid?.getNormalizedBoneNode("spine");
        const leftArm = vrm.humanoid?.getNormalizedBoneNode("leftUpperArm");
        const rightArm = vrm.humanoid?.getNormalizedBoneNode("rightUpperArm");

        if (spine && leftArm && rightArm) {
            // Base sway
            const swayAmount = avatarState === 'talking' ? 0.05 : 0.02;
            const swayX = Math.sin(t * 0.5) * swayAmount;
            const swayY = Math.cos(t * 0.3) * swayAmount;

            spine.rotation.z = swayX;
            spine.rotation.x = swayY;

            // Arms
            // Natural hang
            let leftArmTargetZ = -1.4; // ~80 deg down
            let rightArmTargetZ = 1.4;

            // Gestures when talking
            if (avatarState === 'talking') {
                leftArmTargetZ += Math.sin(t * 3) * 0.1;
                rightArmTargetZ -= Math.sin(t * 3) * 0.1;

                // Occasional emphasis
                if (Math.sin(t * 1) > 0.8) {
                    rightArm.rotation.x = Math.sin(t * 5) * 0.2;
                }
            }

            leftArm.rotation.z = leftArmTargetZ + swayX * 0.5;
            rightArm.rotation.z = rightArmTargetZ + swayX * 0.5;

            // Breathing effect on arms
            leftArm.rotation.x = Math.sin(breatheTime.current) * 0.03;
            rightArm.rotation.x = Math.sin(breatheTime.current) * 0.03;
        }

        // ==== LIP-SYNC VISEMES ====
        if (vrm.expressionManager) {
            // reset
            for (const name of VISEME_NAMES) {
                if (name !== "sil") {
                    vrm.expressionManager.setValue(name, 0);
                }
            }

            if (visemeIndex != null) {
                const name = VISEME_NAMES[visemeIndex] ?? "neutral";
                if (name !== "sil" && name !== "neutral") {
                    vrm.expressionManager.setValue(name, 1);
                }
            }
        }

        // CRITICAL: Update VRM physics and blendshapes
        vrm.update(delta);

        mixerRef.current?.update(delta);
    });

    if (!loadedScene) return null;
    return <primitive object={loadedScene} scale={1} />;
};
