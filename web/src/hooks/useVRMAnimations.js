/**
 * useVRMAnimations.js
 * React hook for managing VRM animations with blending and transitions
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { animationLoader } from '../utils/AnimationLoader';

/**
 * Custom hook for VRM animation management
 * @param {Object} vrm - VRM instance
 * @param {THREE.AnimationMixer} mixer - Animation mixer
 * @returns {Object} Animation control functions
 */
export function useVRMAnimations(vrm, mixer) {
    const [currentAnimation, setCurrentAnimation] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const actionsRef = useRef(new Map()); // Store AnimationActions
    const queueRef = useRef([]); // Animation queue

    /**
     * Load and prepare an animation
     * @param {string} url - Animation file URL
     * @returns {Promise<THREE.AnimationAction>}
     */
    const loadAnimation = async (url) => {
        if (!vrm || !mixer) {
            console.warn('VRM or mixer not ready');
            return null;
        }

        try {
            // Check if already loaded
            if (actionsRef.current.has(url)) {
                return actionsRef.current.get(url);
            }

            // Load the animation clip
            const clip = await animationLoader.loadAnimation(url, vrm);

            // Create animation action
            const action = mixer.clipAction(clip);

            // Store for reuse
            actionsRef.current.set(url, action);

            return action;
        } catch (error) {
            console.error(`Failed to load animation ${url}:`, error);
            return null;
        }
    };

    /**
     * Play an animation with smooth transition
     * @param {string} url - Animation file URL
     * @param {Object} options - Playback options
     */
    const playAnimation = async (url, options = {}) => {
        const {
            loop = THREE.LoopRepeat,
            blendDuration = 0.3,
            timeScale = 1,
            weight = 1,
            priority = 0,
            onComplete = null
        } = options;

        if (!vrm || !mixer) {
            console.warn('Cannot play animation: VRM or mixer not ready');
            return;
        }

        try {
            setIsTransitioning(true);

            // Load the animation
            const newAction = await loadAnimation(url);

            if (!newAction) {
                setIsTransitioning(false);
                return;
            }

            // Configure the action
            newAction.loop = loop;
            newAction.timeScale = timeScale;
            newAction.weight = weight;
            newAction.clampWhenFinished = true;

            // Handle animation completion
            if (onComplete) {
                const listener = (e) => {
                    if (e.action === newAction) {
                        onComplete();
                        mixer.removeEventListener('finished', listener);
                    }
                };
                mixer.addEventListener('finished', listener);
            }

            // Get current action
            const currentAction = actionsRef.current.get(currentAnimation);

            if (currentAction && currentAction !== newAction) {
                // Crossfade from current to new
                newAction.reset();
                newAction.play();
                currentAction.crossFadeTo(newAction, blendDuration, true);

                console.log(`🎬 Transitioning: ${currentAnimation} → ${url}`);
            } else {
                // Just play the new animation
                newAction.reset();
                newAction.play();

                console.log(`▶️ Playing: ${url}`);
            }

            setCurrentAnimation(url);

            // Wait for blend to complete
            setTimeout(() => {
                setIsTransitioning(false);
            }, blendDuration * 1000);

        } catch (error) {
            console.error('Error playing animation:', error);
            setIsTransitioning(false);
        }
    };

    /**
     * Stop current animation
     * @param {number} fadeDuration - Fade out duration in seconds
     */
    const stopAnimation = (fadeDuration = 0.3) => {
        if (!currentAnimation) return;

        const action = actionsRef.current.get(currentAnimation);
        if (action) {
            action.fadeOut(fadeDuration);
            console.log(`⏹️ Stopping: ${currentAnimation}`);
        }

        setTimeout(() => {
            setCurrentAnimation(null);
        }, fadeDuration * 1000);
    };

    /**
     * Queue an animation to play after current one finishes
     * @param {string} url - Animation URL
     * @param {Object} options - Playback options
     */
    const queueAnimation = (url, options = {}) => {
        queueRef.current.push({ url, options });
        console.log(`📋 Queued: ${url}`);

        // If nothing playing, start the queue
        if (!currentAnimation && !isTransitioning) {
            processQueue();
        }
    };

    /**
     * Process animation queue
     */
    const processQueue = async () => {
        if (queueRef.current.length === 0) return;

        const { url, options } = queueRef.current.shift();

        await playAnimation(url, {
            ...options,
            onComplete: () => {
                options.onComplete?.();
                processQueue(); // Play next in queue
            }
        });
    };

    /**
     * Play multiple animations simultaneously (layered)
     * @param {Array<{url: string, options: Object}>} animations
     */
    const playLayered = async (animations) => {
        for (const { url, options } of animations) {
            const action = await loadAnimation(url);
            if (action) {
                action.reset();
                action.play();
                action.setEffectiveWeight(options.weight || 0.5);
            }
        }
    };

    /**
     * Get current animation state
     * @returns {Object}
     */
    const getState = () => ({
        current: currentAnimation,
        isTransitioning,
        queueLength: queueRef.current.length,
        loadedCount: actionsRef.current.size
    });

    /**
     * Preload animations for faster playback
     * @param {Array<string>} urls - Animation URLs to preload
     */
    const preload = async (urls) => {
        console.log(`📥 Preloading ${urls.length} animations...`);
        const promises = urls.map(url => loadAnimation(url));
        await Promise.all(promises);
        console.log(`✅ Preloaded ${urls.length} animations`);
    };

    /**
     * Clear all animations
     */
    const clearAll = () => {
        actionsRef.current.forEach(action => action.stop());
        actionsRef.current.clear();
        queueRef.current = [];
        setCurrentAnimation(null);
        console.log('🗑️ Cleared all animations');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearAll();
        };
    }, []);

    return {
        playAnimation,
        stopAnimation,
        queueAnimation,
        playLayered,
        preload,
        getState,
        clearAll,
        isPlaying: !!currentAnimation,
        isTransitioning
    };
}
