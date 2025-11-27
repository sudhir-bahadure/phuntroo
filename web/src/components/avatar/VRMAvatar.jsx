import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VRMUtils, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTFLoader } from 'three-stdlib';
// import { useVRMAnimations } from '../../hooks/useVRMAnimations';
import { movementController } from '../../utils/MovementController';
import { skeletonController } from '../../utils/SkeletonController';
// import { autonomyManager } from '../../services/autonomy/AutonomyManager';

const VISEME_NAMES = ["aa", "ih", "ou", "ee", "oh", "sil"];

export const VRMAvatar = ({ visemeIndex, avatarState, url }) => {
    const vrmRef = useRef(null);
    const mixerRef = useRef(null);
    const [loadedScene, setLoadedScene] = useState(null);

    // Procedural animation refs
    const blinkTimer = useRef(0);
    const blinkValue = useRef(0);
    const breatheTime = useRef(0);
    const pointer = useRef({ x: 0, y: 0 });

    // Animation system integration
    /*
    const { playAnimation, isPlaying, isTransitioning } = useVRMAnimations(
        vrmRef.current,
        mixerRef.current
    );
    */
    const isPlaying = false;
    const isTransitioning = false;
    const playAnimation = null;

    // Mouse / pointer tracking
    useEffect(() => {
        const handler = (e) => {
            pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener("pointermove", handler);
        return () => window.removeEventListener("pointermove", handler);
    }, []);

    // Load VRM
    useEffect(() => {
        if (!url) return;

        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));

        // Use relative path to prevent doubling with Vite base
        const modelPath = url.startsWith('http') ? url : `./models/avatar.vrm`;

        console.log(`🔄 Loading VRM: ${modelPath}`);

        loader.load(
            modelPath,
            (gltf) => {
                // Cleanup previous model ONLY after new one is loaded
                if (vrmRef.current) {
                    VRMUtils.removeUnnecessaryJoints(vrmRef.current.scene);
                    if (vrmRef.current.scene) {
                        vrmRef.current.scene.traverse((o) => {
                            if (o.geometry) o.geometry.dispose();
                            if (o.material) {
                                if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
                                else o.material.dispose();
                            }
                        });
                    }
                }

                VRMUtils.rotateVRM0(gltf.scene);
                const vrm = gltf.userData.vrm;

                // Fix rotation (rotate 180 degrees to face camera)
                vrm.scene.rotation.y = Math.PI;

                vrmRef.current = vrm;
                setLoadedScene(vrm.scene);

                mixerRef.current = new THREE.AnimationMixer(vrm.scene);

                // Ensure meshes are visible
                vrm.scene.traverse(obj => obj.frustumCulled = false);

                console.log('✅ VRM loaded successfully');
            },
            (progress) => {
                console.log(`Loading: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
            },
            (error) => {
                console.error('❌ VRM load error:', error);
            }
        );
    }, [url]);

    // Per-frame animation updates
    useFrame((state, delta) => {
        if (!vrmRef.current) return;

        const vrm = vrmRef.current;
        const t = state.clock.elapsedTime;

        // ==== SPATIAL MOVEMENT ====
        // Update position from MovementController
        const { position, rotation, isMoving } = movementController.update(delta);
        if (vrm.scene) {
            vrm.scene.position.copy(position);
            vrm.scene.rotation.y = rotation;
        }

        // ==== SKELETON CONTROL (AI) ====
        // Apply AI-driven bone rotations
        skeletonController.update(delta);

        const humanoid = vrm.humanoid;
        if (humanoid) {
            skeletonController.supportedBones.forEach(boneName => {
                const rotation = skeletonController.getBoneRotation(boneName);
                if (rotation) {
                    const bone = humanoid.getNormalizedBoneNode(boneName);
                    if (bone) {
                        // Apply rotation (overrides procedural if set)
                        bone.quaternion.copy(rotation);
                    }
                }
            });
        }

        // ==== AUTONOMOUS GAZE & HEAD TRACKING ====
        // Only apply gaze tracking if head is NOT controlled by AI
        if (!skeletonController.getBoneRotation('head')) {
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
        // Only apply breathing if chest not controlled by AI
        if (chest && !skeletonController.getBoneRotation('chest')) {
            chest.position.y = breathe;
        }

        // ==== INTERACTION PHYSICS / IDLE MOTION ====
        // Only apply procedural arm movements if no clip animation is playing AND arms not controlled by AI
        if (!isPlaying || isTransitioning) {
            const spine = vrm.humanoid?.getNormalizedBoneNode("spine");
            const leftArm = vrm.humanoid?.getNormalizedBoneNode("leftUpperArm");
            const rightArm = vrm.humanoid?.getNormalizedBoneNode("rightUpperArm");

            if (spine && leftArm && rightArm) {
                // Base sway (only if spine not controlled)
                if (!skeletonController.getBoneRotation('spine')) {
                    const swayAmount = avatarState === 'talking' ? 0.05 : 0.02;
                    const swayX = Math.sin(t * 0.5) * swayAmount;
                    const swayY = Math.cos(t * 0.3) * swayAmount;

                    spine.rotation.z = swayX;
                    spine.rotation.x = swayY;
                }

                // Arms - Natural hang (only if arms not controlled)
                if (!skeletonController.getBoneRotation('leftUpperArm')) {
                    let leftArmTargetZ = -1.4; // ~80 deg down
                    // Gestures when talking
                    if (avatarState === 'talking') {
                        leftArmTargetZ += Math.sin(t * 3) * 0.1;
                    }
                    // Sway influence
                    const swayX = Math.sin(t * 0.5) * (avatarState === 'talking' ? 0.05 : 0.02);
                    leftArm.rotation.z = leftArmTargetZ + swayX * 0.5;
                    leftArm.rotation.x = Math.sin(breatheTime.current) * 0.03;
                }

                if (!skeletonController.getBoneRotation('rightUpperArm')) {
                    let rightArmTargetZ = 1.4;
                    if (avatarState === 'talking') {
                        rightArmTargetZ -= Math.sin(t * 3) * 0.1;
                        // Occasional emphasis
                        if (Math.sin(t * 1) > 0.8) {
                            rightArm.rotation.x = Math.sin(t * 5) * 0.2;
                        }
                    }
                    const swayX = Math.sin(t * 0.5) * (avatarState === 'talking' ? 0.05 : 0.02);
                    rightArm.rotation.z = rightArmTargetZ + swayX * 0.5;
                    rightArm.rotation.x = Math.sin(breatheTime.current) * 0.03;
                }
            }
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

        // Update animation mixer
        mixerRef.current?.update(delta);
    });

    if (!loadedScene) return null;
    return <primitive object={loadedScene} scale={1} />;
};
