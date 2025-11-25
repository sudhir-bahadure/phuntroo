/**
 * AnimationLoader.js
 * Loads FBX animations from Mixamo and adapts them for VRM avatars
 */

import { FBXLoader } from 'three-stdlib';
import * as THREE from 'three';

// Mixamo to VRM bone name mapping
const BONE_MAP = {
    // Core skeleton
    'mixamorig:Hips': 'hips',
    'mixamorig:Spine': 'spine',
    'mixamorig:Spine1': 'chest',
    'mixamorig:Spine2': 'upperChest',
    'mixamorig:Neck': 'neck',
    'mixamorig:Head': 'head',

    // Left arm
    'mixamorig:LeftShoulder': 'leftShoulder',
    'mixamorig:LeftArm': 'leftUpperArm',
    'mixamorig:LeftForeArm': 'leftLowerArm',
    'mixamorig:LeftHand': 'leftHand',

    // Right arm
    'mixamorig:RightShoulder': 'rightShoulder',
    'mixamorig:RightArm': 'rightUpperArm',
    'mixamorig:RightForeArm': 'rightLowerArm',
    'mixamorig:RightHand': 'rightHand',

    // Left leg
    'mixamorig:LeftUpLeg': 'leftUpperLeg',
    'mixamorig:LeftLeg': 'leftLowerLeg',
    'mixamorig:LeftFoot': 'leftFoot',
    'mixamorig:LeftToeBase': 'leftToes',

    // Right leg
    'mixamorig:RightUpLeg': 'rightUpperLeg',
    'mixamorig:RightLeg': 'rightLowerLeg',
    'mixamorig:RightFoot': 'rightFoot',
    'mixamorig:RightToeBase': 'rightToes',

    // Fingers (optional - VRM may not have all)
    'mixamorig:LeftHandThumb1': 'leftThumbProximal',
    'mixamorig:LeftHandIndex1': 'leftIndexProximal',
    'mixamorig:LeftHandMiddle1': 'leftMiddleProximal',
    'mixamorig:RightHandThumb1': 'rightThumbProximal',
    'mixamorig:RightHandIndex1': 'rightIndexProximal',
    'mixamorig:RightHandMiddle1': 'rightMiddleProximal',
};

class AnimationLoader {
    constructor() {
        this.loader = new FBXLoader();
        this.cache = new Map(); // Cache loaded animations
        this.loadingPromises = new Map(); // Prevent duplicate loads
    }

    /**
     * Load an FBX animation file and adapt it for VRM
     * @param {string} url - Path to FBX file
     * @param {Object} vrm - VRM instance
     * @returns {Promise<THREE.AnimationClip>}
     */
    async loadAnimation(url, vrm) {
        // Check cache first
        if (this.cache.has(url)) {
            console.log(`📦 Animation cached: ${url}`);
            return this.cache.get(url);
        }

        // Check if already loading
        if (this.loadingPromises.has(url)) {
            console.log(`⏳ Animation loading in progress: ${url}`);
            return this.loadingPromises.get(url);
        }

        // Start loading
        const loadPromise = new Promise((resolve, reject) => {
            console.log(`🔄 Loading animation: ${url}`);

            this.loader.load(
                url,
                (fbx) => {
                    try {
                        // Get the animation clip from FBX
                        const clip = fbx.animations[0];

                        if (!clip) {
                            throw new Error('No animation found in FBX file');
                        }

                        // Adapt the animation for VRM
                        const adaptedClip = this.adaptAnimationForVRM(clip, vrm);

                        // Cache the result
                        this.cache.set(url, adaptedClip);
                        this.loadingPromises.delete(url);

                        console.log(`✅ Animation loaded: ${url} (${adaptedClip.duration.toFixed(2)}s)`);
                        resolve(adaptedClip);
                    } catch (error) {
                        console.error(`❌ Error processing animation ${url}:`, error);
                        this.loadingPromises.delete(url);
                        reject(error);
                    }
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total * 100).toFixed(0);
                    console.log(`Loading ${url}: ${percent}%`);
                },
                (error) => {
                    console.warn(`⚠️ Failed to load animation ${url}, generating fallback...`);
                    try {
                        const fallbackClip = this.generateFallbackAnimation(url, vrm);
                        this.cache.set(url, fallbackClip);
                        this.loadingPromises.delete(url);
                        resolve(fallbackClip);
                    } catch (fallbackError) {
                        console.error(`❌ Fallback generation failed for ${url}:`, fallbackError);
                        this.loadingPromises.delete(url);
                        reject(error);
                    }
                }
            );
        });

        this.loadingPromises.set(url, loadPromise);
        return loadPromise;
    }

    /**
     * Generate a procedural fallback animation based on the URL name
     * @param {string} url - Animation URL
     * @param {Object} vrm - VRM instance
     * @returns {THREE.AnimationClip}
     */
    generateFallbackAnimation(url, vrm) {
        const name = url.split('/').pop().replace('.fbx', '');
        const duration = 2.0;
        const tracks = [];

        // Helper to create rotation track
        const createRotationTrack = (boneName, times, values) => {
            const bone = vrm.humanoid?.getNormalizedBoneNode(boneName);
            if (bone) {
                return new THREE.QuaternionKeyframeTrack(
                    `${bone.name}.quaternion`,
                    times,
                    values
                );
            }
            return null;
        };

        // Helper to create position track
        const createPositionTrack = (boneName, times, values) => {
            const bone = vrm.humanoid?.getNormalizedBoneNode(boneName);
            if (bone) {
                return new THREE.VectorKeyframeTrack(
                    `${bone.name}.position`,
                    times,
                    values
                );
            }
            return null;
        };

        if (name.includes('idle') || name.includes('looking')) {
            // Breathing/Idle: Slight spine rotation
            const times = [0, 1, 2];
            const q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, 0, 0));
            const q2 = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.02, 0, 0));
            const values = [...q1.toArray(), ...q2.toArray(), ...q1.toArray()];

            const track = createRotationTrack('spine', times, values);
            if (track) tracks.push(track);

        } else if (name.includes('walk')) {
            // Walking: Bob hips and swing arms
            const times = [0, 0.5, 1, 1.5, 2];

            // Hips bob
            const hips = vrm.humanoid?.getNormalizedBoneNode('hips');
            if (hips) {
                const baseY = hips.position.y;
                const p1 = [0, baseY, 0];
                const p2 = [0, baseY + 0.05, 0];
                const posValues = [...p1, ...p2, ...p1, ...p2, ...p1];
                tracks.push(createPositionTrack('hips', times, posValues));
            }

            // Arm swing
            const qFront = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0));
            const qBack = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0, 0));

            const leftArmValues = [...qFront.toArray(), ...qBack.toArray(), ...qFront.toArray(), ...qBack.toArray(), ...qFront.toArray()];
            const rightArmValues = [...qBack.toArray(), ...qFront.toArray(), ...qBack.toArray(), ...qFront.toArray(), ...qBack.toArray()];

            const leftTrack = createRotationTrack('leftUpperArm', times, leftArmValues);
            const rightTrack = createRotationTrack('rightUpperArm', times, rightArmValues);

            if (leftTrack) tracks.push(leftTrack);
            if (rightTrack) tracks.push(rightTrack);

        } else if (name.includes('wave') || name.includes('hello')) {
            // Waving: Rotate right arm
            const times = [0, 0.5, 1, 1.5, 2];
            const qUp = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 2.5)); // Arm up
            const qWave1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 2.8));
            const qWave2 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 2.2));

            const values = [...qUp.toArray(), ...qWave1.toArray(), ...qWave2.toArray(), ...qWave1.toArray(), ...qUp.toArray()];
            const track = createRotationTrack('rightUpperArm', times, values);
            if (track) tracks.push(track);
        }

        // If no specific tracks generated, return a dummy idle
        if (tracks.length === 0) {
            const times = [0, 2];
            const q = new THREE.Quaternion();
            const values = [...q.toArray(), ...q.toArray()];
            const track = createRotationTrack('spine', times, values);
            if (track) tracks.push(track);
        }

        return new THREE.AnimationClip(name, duration, tracks);
    }

    /**
     * Adapt Mixamo animation to VRM bone structure
     * @param {THREE.AnimationClip} clip - Original animation clip
     * @param {Object} vrm - VRM instance
     * @returns {THREE.AnimationClip}
     */
    adaptAnimationForVRM(clip, vrm) {
        const tracks = [];

        for (const track of clip.tracks) {
            // Extract bone name from track name (format: "mixamorig:BoneName.property")
            const trackParts = track.name.split('.');
            const mixamoBoneName = trackParts[0];
            const property = trackParts[1]; // position, quaternion, scale

            // Map to VRM bone name
            const vrmBoneName = BONE_MAP[mixamoBoneName];

            if (!vrmBoneName) {
                // Skip unmapped bones
                continue;
            }

            // Get the VRM bone
            const vrmBone = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName);

            if (!vrmBone) {
                // Skip if VRM doesn't have this bone
                continue;
            }

            // Create new track with VRM bone name
            const newTrackName = `${vrmBone.name}.${property}`;

            let newTrack;
            if (track instanceof THREE.VectorKeyframeTrack) {
                newTrack = new THREE.VectorKeyframeTrack(
                    newTrackName,
                    track.times,
                    track.values
                );
            } else if (track instanceof THREE.QuaternionKeyframeTrack) {
                newTrack = new THREE.QuaternionKeyframeTrack(
                    newTrackName,
                    track.times,
                    track.values
                );
            } else if (track instanceof THREE.NumberKeyframeTrack) {
                newTrack = new THREE.NumberKeyframeTrack(
                    newTrackName,
                    track.times,
                    track.values
                );
            } else {
                // Unknown track type, skip
                continue;
            }

            tracks.push(newTrack);
        }

        // Create new clip with adapted tracks
        const adaptedClip = new THREE.AnimationClip(
            clip.name || 'animation',
            clip.duration,
            tracks
        );

        return adaptedClip;
    }

    /**
     * Preload multiple animations
     * @param {Array<string>} urls - Array of animation URLs
     * @param {Object} vrm - VRM instance
     * @returns {Promise<Array<THREE.AnimationClip>>}
     */
    async preloadAnimations(urls, vrm) {
        console.log(`📥 Preloading ${urls.length} animations...`);
        const promises = urls.map(url => this.loadAnimation(url, vrm));
        return Promise.all(promises);
    }

    /**
     * Clear animation cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Animation cache cleared');
    }

    /**
     * Get cached animation
     * @param {string} url - Animation URL
     * @returns {THREE.AnimationClip|null}
     */
    getCached(url) {
        return this.cache.get(url) || null;
    }
}

// Singleton instance
export const animationLoader = new AnimationLoader();

// Animation metadata for easy reference
export const ANIMATION_LIBRARY = {
    idle: {
        breathingIdle: '/models/animations/breathing_idle.fbx',
        lookingAround: '/models/animations/looking_around.fbx',
    },
    walking: {
        walk: '/models/animations/walking.fbx',
        walkBackward: '/models/animations/walking_backward.fbx',
        strut: '/models/animations/strut_walking.fbx',
    },
    gestures: {
        wave: '/models/animations/waving.fbx',
        talking: '/models/animations/talking_hands.fbx',
        thinking: '/models/animations/thinking.fbx',
        nod: '/models/animations/nodding.fbx',
    },
    emotions: {
        happy: '/models/animations/happy_idle.fbx',
        sad: '/models/animations/sad_idle.fbx',
        excited: '/models/animations/excited.fbx',
    },
    actions: {
        sitting: '/models/animations/sitting.fbx',
        standingUp: '/models/animations/standing_up.fbx',
    }
};
