import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VRMUtils, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTFLoader } from 'three-stdlib';

const VISEME_NAMES = ["aa", "ih", "ou", "ee", "oh", "sil"];

export const VRMAvatar = ({ visemeIndex }) => {
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

        // ==== HEAD TRACKING ====
        // Use getNormalizedBoneNode for VRM 1.0 compatibility
        const head = vrm.humanoid?.getNormalizedBoneNode("head");
        if (head) {
            const targetYaw = pointer.current.x * 0.5;
            const targetPitch = pointer.current.y * 0.3;

            head.rotation.y += (targetYaw - head.rotation.y) * 0.08;
            head.rotation.x += (targetPitch - head.rotation.x) * 0.08;
        }

        // ==== BLINKING ====
        blinkTimer.current += delta;
        if (blinkTimer.current > 3 + Math.random() * 2) {
            blinkTimer.current = 0;
            blinkValue.current = 1;
        }
        if (blinkValue.current > 0) {
            blinkValue.current = Math.max(0, blinkValue.current - delta * 6);
        }
        if (vrm.expressionManager) {
            vrm.expressionManager.setValue("blink", blinkValue.current);
        }

        // ==== BREATHING ====
        breatheTime.current += delta * 1.2;
        const breathe = (Math.sin(breatheTime.current) + 1) * 0.02;
        const chest = vrm.humanoid?.getNormalizedBoneNode("chest");
        if (chest) {
            chest.position.y = breathe;
        }

        // ==== INTERACTION PHYSICS ====
        const spine = vrm.humanoid?.getNormalizedBoneNode("spine");
        const leftArm = vrm.humanoid?.getNormalizedBoneNode("leftUpperArm");
        const rightArm = vrm.humanoid?.getNormalizedBoneNode("rightUpperArm");

        if (spine && leftArm && rightArm) {
            const state = physicsState.current;
            const target = new THREE.Vector2(pointer.current.x, pointer.current.y).multiplyScalar(0.3);
            const stiffness = 8;
            const damping = 4;

            const forceX = -stiffness * (state.offset.x - target.x);
            const forceY = -stiffness * (state.offset.y - target.y);

            state.velocity.x += forceX * delta;
            state.velocity.y += forceY * delta;

            state.velocity.x *= 1 - damping * delta;
            state.velocity.y *= 1 - damping * delta;

            state.offset.x += state.velocity.x * delta;
            state.offset.y += state.velocity.y * delta;

            import React, { useEffect, useRef, useState } from "react";
            import { useFrame } from "@react-three/fiber";
            import * as THREE from "three";
            import { VRMUtils, VRMLoaderPlugin } from "@pixiv/three-vrm";
            import { GLTFLoader } from 'three-stdlib';

            const VISEME_NAMES = ["aa", "ih", "ou", "ee", "oh", "sil"];

            export const VRMAvatar = ({ visemeIndex }) => {
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

                    // ==== HEAD TRACKING ====
                    // Use getNormalizedBoneNode for VRM 1.0 compatibility
                    const head = vrm.humanoid?.getNormalizedBoneNode("head");
                    if (head) {
                        const targetYaw = pointer.current.x * 0.5;
                        const targetPitch = pointer.current.y * 0.3;

                        head.rotation.y += (targetYaw - head.rotation.y) * 0.08;
                        head.rotation.x += (targetPitch - head.rotation.x) * 0.08;
                    }

                    // ==== BLINKING ====
                    blinkTimer.current += delta;
                    if (blinkTimer.current > 3 + Math.random() * 2) {
                        blinkTimer.current = 0;
                        blinkValue.current = 1;
                    }
                    if (blinkValue.current > 0) {
                        blinkValue.current = Math.max(0, blinkValue.current - delta * 6);
                    }
                    if (vrm.expressionManager) {
                        vrm.expressionManager.setValue("blink", blinkValue.current);
                    }

                    // ==== BREATHING ====
                    breatheTime.current += delta * 1.2;
                    const breathe = (Math.sin(breatheTime.current) + 1) * 0.02;
                    const chest = vrm.humanoid?.getNormalizedBoneNode("chest");
                    if (chest) {
                        chest.position.y = breathe;
                    }

                    // ==== INTERACTION PHYSICS ====
                    const spine = vrm.humanoid?.getNormalizedBoneNode("spine");
                    const leftArm = vrm.humanoid?.getNormalizedBoneNode("leftUpperArm");
                    const rightArm = vrm.humanoid?.getNormalizedBoneNode("rightUpperArm");

                    if (spine && leftArm && rightArm) {
                        const state = physicsState.current;
                        const target = new THREE.Vector2(pointer.current.x, pointer.current.y).multiplyScalar(0.3);
                        const stiffness = 8;
                        const damping = 4;

                        const forceX = -stiffness * (state.offset.x - target.x);
                        const forceY = -stiffness * (state.offset.y - target.y);

                        state.velocity.x += forceX * delta;
                        state.velocity.y += forceY * delta;

                        state.velocity.x *= 1 - damping * delta;
                        state.velocity.y *= 1 - damping * delta;

                        state.offset.x += state.velocity.x * delta;
                        state.offset.y += state.velocity.y * delta;

                        const swayX = state.offset.x * 0.3;
                        const swayY = state.offset.y * 0.3;

                        spine.rotation.z = swayX;
                        spine.rotation.x = swayY * 0.5;

                        // Natural arm hang (approx 80 degrees down) + sway
                        // VRM 1.0 standard: Arms are T-pose at 0. Rotate Z to bring them down.
                        // Left arm: rotate negative Z. Right arm: rotate positive Z.
                        leftArm.rotation.z = -1.4 + -swayX * 0.5;
                        rightArm.rotation.z = 1.4 + -swayX * 0.5;

                        // Slight arm swing with breathing
                        leftArm.rotation.x = Math.sin(breatheTime.current) * 0.05;
                        rightArm.rotation.x = Math.sin(breatheTime.current) * 0.05;
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
