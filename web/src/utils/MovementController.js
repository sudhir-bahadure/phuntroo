/**
 * MovementController.js
 * Controls avatar spatial movement with pathfinding and smooth transitions
 */

import * as THREE from 'three';

export class MovementController {
    constructor() {
        this.currentPosition = new THREE.Vector3(0, 0, 0);
        this.targetPosition = new THREE.Vector3(0, 0, 0);
        this.currentRotation = 0;
        this.targetRotation = 0;

        this.isMoving = false;
        this.movementSpeed = 0.5; // units per second
        this.rotationSpeed = 2; // radians per second

        // Movement boundaries
        this.boundaries = {
            minX: -2,
            maxX: 2,
            minZ: -2,
            maxZ: 2
        };

        this.listeners = [];
    }

    /**
     * Subscribe to movement events
     * @param {Function} callback - Called with movement state
     */
    onMovementChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify all listeners of movement state
     */
    notifyListeners() {
        const state = {
            isMoving: this.isMoving,
            position: this.currentPosition.clone(),
            rotation: this.currentRotation,
            target: this.targetPosition.clone()
        };
        this.listeners.forEach(cb => cb(state));
    }

    /**
     * Move to a specific position
     * @param {THREE.Vector3} target - Target position
     * @returns {boolean} - Whether movement was initiated
     */
    moveTo(target) {
        // Clamp to boundaries
        const clampedTarget = new THREE.Vector3(
            THREE.MathUtils.clamp(target.x, this.boundaries.minX, this.boundaries.maxX),
            0, // Keep Y at 0 (ground level)
            THREE.MathUtils.clamp(target.z, this.boundaries.minZ, this.boundaries.maxZ)
        );

        // Check if already at target
        const distance = this.currentPosition.distanceTo(clampedTarget);
        if (distance < 0.1) {
            return false;
        }

        this.targetPosition.copy(clampedTarget);
        this.isMoving = true;

        // Calculate target rotation to face movement direction
        const direction = new THREE.Vector3()
            .subVectors(clampedTarget, this.currentPosition)
            .normalize();

        this.targetRotation = Math.atan2(direction.x, direction.z);

        console.log(`🚶 Moving to: (${clampedTarget.x.toFixed(2)}, ${clampedTarget.z.toFixed(2)})`);
        this.notifyListeners();

        return true;
    }

    /**
     * Move to a random position within boundaries
     */
    moveToRandom() {
        const randomX = THREE.MathUtils.randFloat(this.boundaries.minX, this.boundaries.maxX);
        const randomZ = THREE.MathUtils.randFloat(this.boundaries.minZ, this.boundaries.maxZ);

        return this.moveTo(new THREE.Vector3(randomX, 0, randomZ));
    }

    /**
     * Update movement (call every frame)
     * @param {number} delta - Time delta in seconds
     * @returns {Object} - Current position and rotation
     */
    update(delta) {
        if (!this.isMoving) {
            return {
                position: this.currentPosition,
                rotation: this.currentRotation,
                isMoving: false
            };
        }

        // Update rotation (turn towards target direction)
        const rotationDiff = this.targetRotation - this.currentRotation;
        const rotationStep = Math.sign(rotationDiff) * Math.min(
            Math.abs(rotationDiff),
            this.rotationSpeed * delta
        );
        this.currentRotation += rotationStep;

        // Update position (move towards target)
        const direction = new THREE.Vector3()
            .subVectors(this.targetPosition, this.currentPosition)
            .normalize();

        const distance = this.currentPosition.distanceTo(this.targetPosition);
        const moveDistance = Math.min(distance, this.movementSpeed * delta);

        this.currentPosition.add(direction.multiplyScalar(moveDistance));

        // Check if reached target
        if (distance < 0.1) {
            this.isMoving = false;
            console.log(`✅ Reached target: (${this.currentPosition.x.toFixed(2)}, ${this.currentPosition.z.toFixed(2)})`);
            this.notifyListeners();
        }

        return {
            position: this.currentPosition.clone(),
            rotation: this.currentRotation,
            isMoving: this.isMoving
        };
    }

    /**
     * Stop current movement
     */
    stop() {
        this.isMoving = false;
        this.targetPosition.copy(this.currentPosition);
        console.log('⏹️ Movement stopped');
        this.notifyListeners();
    }

    /**
     * Set movement speed
     * @param {number} speed - Units per second
     */
    setSpeed(speed) {
        this.movementSpeed = speed;
    }

    /**
     * Set boundaries
     * @param {Object} bounds - {minX, maxX, minZ, maxZ}
     */
    setBoundaries(bounds) {
        this.boundaries = { ...this.boundaries, ...bounds };
    }

    /**
     * Get current state
     * @returns {Object}
     */
    getState() {
        return {
            position: this.currentPosition.clone(),
            rotation: this.currentRotation,
            isMoving: this.isMoving,
            target: this.targetPosition.clone(),
            speed: this.movementSpeed
        };
    }

    /**
     * Reset to origin
     */
    reset() {
        this.currentPosition.set(0, 0, 0);
        this.targetPosition.set(0, 0, 0);
        this.currentRotation = 0;
        this.targetRotation = 0;
        this.isMoving = false;
        this.notifyListeners();
    }
}

// Singleton instance
export const movementController = new MovementController();
