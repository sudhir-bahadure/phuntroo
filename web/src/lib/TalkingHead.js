/**
 * TalkingHead.js - Simplified wrapper for realistic GLB avatar
 * Based on met4citizen/TalkingHead but simplified for our use case
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class TalkingHead {
    constructor() {
        this.avatar = null;
        this.mixer = null;
        this.animations = {};
        this.currentAnimation = null;
        this.clock = new THREE.Clock();
    }

    /**
     * Load avatar GLB file
     */
    async loadAvatar(scene, avatarUrl) {
        const loader = new GLTFLoader();

        return new Promise((resolve, reject) => {
            loader.load(
                avatarUrl,
                (gltf) => {
                    this.avatar = gltf.scene;
                    scene.add(this.avatar);

                    // Setup animation mixer
                    this.mixer = new THREE.AnimationMixer(this.avatar);

                    // Store animations from GLB
                    gltf.animations.forEach((clip) => {
                        this.animations[clip.name] = clip;
                    });

                    // Position avatar
                    this.avatar.position.set(0, -1.5, 0);
                    this.avatar.rotation.y = 0;

                    console.log('✅ Avatar loaded:', avatarUrl);
                    resolve(this.avatar);
                },
                (progress) => {
                    console.log('Loading avatar:', (progress.loaded / progress.total * 100).toFixed(0) + '%');
                },
                (error) => {
                    console.error('❌ Error loading avatar:', error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Load animation GLB file
     */
    async loadAnimation(name, animationUrl) {
        const loader = new GLTFLoader();

        return new Promise((resolve, reject) => {
            loader.load(
                animationUrl,
                (gltf) => {
                    if (gltf.animations.length > 0) {
                        this.animations[name] = gltf.animations[0];
                        console.log(`✅ Animation loaded: ${name}`);
                        resolve();
                    } else {
                        reject(new Error('No animations in file'));
                    }
                },
                undefined,
                reject
            );
        });
    }

    /**
     * Play animation by name
     */
    playAnimation(name, loop = true) {
        if (!this.mixer || !this.animations[name]) {
            console.warn(`Animation "${name}" not found`);
            return;
        }

        // Stop current animation
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }

        // Play new animation
        const action = this.mixer.clipAction(this.animations[name]);
        action.reset();
        action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
        action.play();

        this.currentAnimation = action;
        console.log(`🎬 Playing animation: ${name}`);
    }

    /**
     * Update animation mixer (call in animation loop)
     */
    update() {
        if (this.mixer) {
            const delta = this.clock.getDelta();
            this.mixer.update(delta);
        }
    }

    /**
     * Make avatar look at a point
     */
    lookAt(x, y, z) {
        if (this.avatar) {
            // Find head bone (assumes standard humanoid rig)
            const head = this.avatar.getObjectByName('Head') ||
                this.avatar.getObjectByName('head') ||
                this.avatar.getObjectByName('mixamorigHead');

            if (head) {
                head.lookAt(x, y, z);
            } else {
                // Fallback: rotate whole avatar
                this.avatar.lookAt(x, y, z);
            }
        }
    }

    /**
     * Set lip-sync viseme (for TTS integration)
     */
    setViseme(viseme, value) {
        if (!this.avatar) return;

        // Find morph targets for visemes (if avatar supports)
        this.avatar.traverse((child) => {
            if (child.isMesh && child.morphTargetDictionary) {
                const index = child.morphTargetDictionary[viseme];
                if (index !== undefined) {
                    child.morphTargetInfluences[index] = value;
                }
            }
        });
    }

    /**
     * Get available animations
     */
    getAnimations() {
        return Object.keys(this.animations);
    }

    /**
     * Dispose avatar
     */
    dispose() {
        if (this.avatar) {
            this.avatar.parent.remove(this.avatar);
        }
        if (this.mixer) {
            this.mixer.stopAllAction();
        }
    }
}

export default TalkingHead;
