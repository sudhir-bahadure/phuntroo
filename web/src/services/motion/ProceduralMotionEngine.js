/**
 * Procedural Motion Engine
 * Math-based natural movement without animation files
 * Inspired by Nexa's approach
 */

class ProceduralMotionEngine {
    constructor() {
        this.motionSeed = Math.random() * 1000;
        this.baseIntensity = 0.25;
        this.micIntensity = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
    }

    /**
     * Pseudo-noise function for natural variation
     */
    pseudoNoise(t, offset) {
        return Math.sin(t * 1.2 + offset) * 0.5 + Math.sin(t * 0.7 + offset * 1.3) * 0.5;
    }

    /**
     * Smooth noise for breathing
     */
    breathingNoise(t) {
        return Math.sin(t * 0.8) * 0.5 + 0.5; // 0 to 1
    }

    /**
     * Update motion state
     */
    update(deltaTime, micLevel = 0) {
        this.time += deltaTime;
        this.micIntensity = micLevel;
    }

    /**
     * Set mouse position for head tracking
     */
    setMousePosition(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }

    /**
     * Randomize motion seed for new movement pattern
     */
    randomizeSeed() {
        this.motionSeed = Math.random() * 1000;
        console.log('🎲 Motion seed randomized:', this.motionSeed.toFixed(2));
    }

    /**
     * Get current total intensity
     */
    getIntensity() {
        return this.baseIntensity + (this.micIntensity * 0.75);
    }

    /**
     * Apply procedural motion to VRM humanoid bones
     */
    applyProceduralMotion(humanoid, avatarState = 'idle') {
        if (!humanoid) return;

        const t = this.time;
        const seed = this.motionSeed;
        const intensity = this.getIntensity();

        // Get bones
        const spine = humanoid.getNormalizedBoneNode('spine');
        const chest = humanoid.getNormalizedBoneNode('chest');
        const head = humanoid.getNormalizedBoneNode('head');
        const leftShoulder = humanoid.getNormalizedBoneNode('leftShoulder');
        const rightShoulder = humanoid.getNormalizedBoneNode('rightShoulder');
        const leftUpperArm = humanoid.getNormalizedBoneNode('leftUpperArm');
        const rightUpperArm = humanoid.getNormalizedBoneNode('rightUpperArm');
        const hips = humanoid.getNormalizedBoneNode('hips');

        // BREATHING (always active)
        const breathCycle = this.breathingNoise(t);
        if (chest) {
            chest.rotation.x = breathCycle * 0.02 * intensity;
        }
        if (spine) {
            spine.scale.y = 1 + breathCycle * 0.01 * intensity;
        }

        // HEAD TRACKING (mouse-based)
        if (head) {
            const yaw = this.mouseX * 0.3 * intensity;
            const pitch = -this.mouseY * 0.2 * intensity;
            head.rotation.y = yaw;
            head.rotation.x = pitch * 0.4;
        }

        // IDLE SWAY (subtle weight shifting)
        if (avatarState === 'idle' || avatarState === 'listening') {
            const sway = this.pseudoNoise(t, seed) * 0.08 * intensity;
            if (hips) {
                hips.rotation.z = sway;
                hips.position.x = sway * 0.05;
            }
            if (spine) {
                spine.rotation.z = -sway * 0.5;
            }
        }

        // TALKING (more dynamic movement)
        if (avatarState === 'talking') {
            const talkCycle = this.pseudoNoise(t * 2, seed + 5);

            // Shoulder movement
            if (leftShoulder && rightShoulder) {
                leftShoulder.rotation.z = talkCycle * 0.1 * intensity;
                rightShoulder.rotation.z = -talkCycle * 0.1 * intensity;
            }

            // Arm gestures (subtle)
            if (leftUpperArm && rightUpperArm) {
                leftUpperArm.rotation.x = Math.sin(t * 1.5 + seed) * 0.15 * intensity;
                rightUpperArm.rotation.x = Math.sin(t * 1.5 + seed + Math.PI) * 0.15 * intensity;
            }

            // Head emphasis
            if (head) {
                const emphasis = this.pseudoNoise(t * 3, seed + 10) * 0.05 * intensity;
                head.rotation.z = emphasis;
            }
        }

        // THINKING (looking away, hand to chin)
        if (avatarState === 'thinking') {
            if (head) {
                head.rotation.y += 0.3;
                head.rotation.x += 0.2;
            }
            if (rightUpperArm) {
                rightUpperArm.rotation.x = 0.5;
                rightUpperArm.rotation.z = -0.3;
            }
        }

        // MIC-REACTIVE MICRO-MOVEMENTS
        if (this.micIntensity > 0.1) {
            const micPulse = this.micIntensity;

            // Shoulders react to voice
            if (leftShoulder && rightShoulder) {
                const shoulderPulse = micPulse * 0.05;
                leftShoulder.position.y = shoulderPulse;
                rightShoulder.position.y = shoulderPulse;
            }

            // Chest expands with voice
            if (chest) {
                chest.scale.x = 1 + micPulse * 0.02;
                chest.scale.z = 1 + micPulse * 0.02;
            }
        }
    }

    /**
     * Apply specific gesture with procedural variation
     */
    applyGesture(gestureName, humanoid, progress = 0) {
        if (!humanoid || !gestureName) return;

        const t = this.time;
        const seed = this.motionSeed;
        const variation = this.pseudoNoise(t, seed + 20) * 0.1;

        const leftUpperArm = humanoid.getNormalizedBoneNode('leftUpperArm');
        const rightUpperArm = humanoid.getNormalizedBoneNode('rightUpperArm');
        const leftLowerArm = humanoid.getNormalizedBoneNode('leftLowerArm');
        const rightLowerArm = humanoid.getNormalizedBoneNode('rightLowerArm');
        const leftHand = humanoid.getNormalizedBoneNode('leftHand');
        const rightHand = humanoid.getNormalizedBoneNode('rightHand');

        switch (gestureName) {
            case 'wave':
                if (rightUpperArm) {
                    rightUpperArm.rotation.x = 0.5 + variation;
                    rightUpperArm.rotation.z = -0.8 + Math.sin(t * 4) * 0.3;
                }
                if (rightLowerArm) {
                    rightLowerArm.rotation.y = 0.5 + Math.sin(t * 4) * 0.4;
                }
                break;

            case 'thinking':
                if (rightUpperArm) {
                    rightUpperArm.rotation.x = 0.3 + variation;
                    rightUpperArm.rotation.z = -0.5;
                }
                if (rightLowerArm) {
                    rightLowerArm.rotation.y = 0.8;
                }
                break;

            case 'celebrate':
                const celebCycle = Math.sin(t * 3);
                if (leftUpperArm && rightUpperArm) {
                    leftUpperArm.rotation.z = 0.5 + celebCycle * 0.2;
                    rightUpperArm.rotation.z = -0.5 - celebCycle * 0.2;
                    leftUpperArm.rotation.x = variation;
                    rightUpperArm.rotation.x = variation;
                }
                break;

            case 'explain':
                const explainCycle = Math.sin(t * 1.5);
                if (leftUpperArm && rightUpperArm) {
                    leftUpperArm.rotation.x = 0.2 + explainCycle * 0.15;
                    rightUpperArm.rotation.x = 0.2 - explainCycle * 0.15;
                    leftUpperArm.rotation.z = 0.3 + variation;
                    rightUpperArm.rotation.z = -0.3 - variation;
                }
                break;

            case 'empathy':
                if (rightUpperArm) {
                    rightUpperArm.rotation.x = 0.3 + variation;
                    rightUpperArm.rotation.z = -0.4;
                }
                if (rightHand) {
                    rightHand.rotation.x = 0.1 + Math.sin(t * 2) * 0.05;
                }
                break;
        }
    }

    /**
     * Get current state for debugging
     */
    getState() {
        return {
            seed: this.motionSeed,
            baseIntensity: this.baseIntensity,
            micIntensity: this.micIntensity,
            totalIntensity: this.getIntensity(),
            time: this.time
        };
    }
}

export const proceduralMotionEngine = new ProceduralMotionEngine();
