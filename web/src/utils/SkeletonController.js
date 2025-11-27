/**
 * SkeletonController.js
 * Manages autonomous bone control with smooth interpolation
 */

import * as THREE from 'three';

export class SkeletonController {
    constructor() {
        // Map of bone names to their current and target states
        // Structure: { boneName: { current: Quaternion, target: Quaternion, speed: number } }
        this.bones = {};

        // Default interpolation speed (slerp factor per second)
        this.defaultSpeed = 5.0;

        // Supported bones list (standard VRM/Humanoid bone names)
        this.supportedBones = [
            'hips', 'spine', 'chest', 'upperChest', 'neck', 'head',
            'leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand',
            'rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand',
            'leftUpperLeg', 'leftLowerLeg', 'leftFoot',
            'rightUpperLeg', 'rightLowerLeg', 'rightFoot'
        ];
    }

    /**
     * Set a target rotation for a bone
     * @param {string} boneName - Name of the bone (e.g., 'head', 'leftUpperArm')
     * @param {Object|Array} rotation - Euler angles {x,y,z} or [x,y,z] in radians
     * @param {number} speed - Interpolation speed (optional)
     */
    setTarget(boneName, rotation, speed = this.defaultSpeed) {
        if (!this.supportedBones.includes(boneName)) {
            console.warn(`SkeletonController: Bone '${boneName}' not supported`);
            return;
        }

        // Initialize bone state if not exists
        if (!this.bones[boneName]) {
            this.bones[boneName] = {
                current: new THREE.Quaternion(),
                target: new THREE.Quaternion(),
                speed: speed
            };
        }

        // Convert input to Quaternion
        const targetQuat = new THREE.Quaternion();
        if (Array.isArray(rotation)) {
            targetQuat.setFromEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2]));
        } else {
            targetQuat.setFromEuler(new THREE.Euler(rotation.x || 0, rotation.y || 0, rotation.z || 0));
        }

        this.bones[boneName].target.copy(targetQuat);
        this.bones[boneName].speed = speed;
    }

    /**
     * Update all bone rotations towards their targets
     * @param {number} delta - Time delta in seconds
     */
    update(delta) {
        Object.keys(this.bones).forEach(boneName => {
            const bone = this.bones[boneName];

            // Slerp towards target
            // Calculate step size based on speed and delta
            // Use a factor (0-1) for slerp, but since we update every frame, 
            // we use a time-based approach for smooth transition
            const step = Math.min(delta * bone.speed, 1.0);

            bone.current.slerp(bone.target, step);
        });
    }

    /**
     * Get the current rotation for a bone
     * @param {string} boneName 
     * @returns {THREE.Quaternion|null}
     */
    getBoneRotation(boneName) {
        return this.bones[boneName] ? this.bones[boneName].current : null;
    }

    /**
     * Reset a bone to identity rotation (rest pose)
     * @param {string} boneName 
     */
    resetBone(boneName) {
        if (this.bones[boneName]) {
            this.bones[boneName].target.identity();
        }
    }

    /**
     * Reset all bones
     */
    resetAll() {
        Object.keys(this.bones).forEach(boneName => {
            this.bones[boneName].target.identity();
        });
    }
}

export const skeletonController = new SkeletonController();
