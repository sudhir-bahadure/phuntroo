/**
 * Autonomy Manager
 * Decides on avatar actions, animations, and movements based on AI brain output and context.
 */

import { movementController } from '../../utils/MovementController';
import { skeletonController } from '../../utils/SkeletonController';
import { ANIMATION_LIBRARY } from '../../utils/AnimationLoader';

class AutonomyManager {
    constructor() {
        this.currentAction = 'idle';
        this.currentGesture = null;
        this.lastActionTime = Date.now();
        this.lastMovementTime = Date.now();
        this.listeners = [];
        this.movementListeners = [];
        this.gestureListeners = [];

        // Behavior configuration
        this.config = {
            movementInterval: 30000, // Move every 30 seconds
            actionInterval: 5000, // Change action every 5 seconds
            gestureChance: 0.3, // 30% chance of gesture during talking
            movementChance: 0.7 // 70% chance of autonomous movement
        };
    }

    /**
     * Subscribe to action changes
     */
    onActionChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Subscribe to movement events
     */
    onMovementChange(callback) {
        this.movementListeners.push(callback);
    }

    /**
     * Subscribe to gesture events
     */
    onGestureChange(callback) {
        this.gestureListeners.push(callback);
    }

    /**
     * Get current action for logging
     */
    getCurrentAction() {
        return this.currentAction;
    }

    /**
     * Decide next action based on context
     */
    decideAction(context) {
        const { emotion, isTalking } = context;
        const now = Date.now();

        if (isTalking) {
            this.setAction('talking');

            // Randomly trigger gestures while talking
            if (Math.random() < this.config.gestureChance) {
                this.decideGesture(context);
            }
            return;
        }

        // Check if it's time for autonomous movement
        if (now - this.lastMovementTime > this.config.movementInterval) {
            if (Math.random() < this.config.movementChance) {
                this.decideMovement(context);
            }
            this.lastMovementTime = now;
        }

        // Random autonomous idle behaviors
        const rand = Math.random();

        if (emotion === 'happy' && rand > 0.8) {
            this.setAction('excited_idle');
        } else if (emotion === 'sad' && rand > 0.8) {
            this.setAction('sad_idle');
        } else if (rand > 0.95) {
            this.setAction('looking_around');
        } else if (rand > 0.9) {
            this.setAction('thinking');
        } else {
            this.setAction('idle');
        }
    }

    /**
     * Decide on spatial movement
     */
    decideMovement(context) {
        const { emotion } = context;

        // Different movement patterns based on emotion
        const movements = {
            happy: () => {
                // Happy: Walk to random position with energy
                movementController.setSpeed(0.7);
                movementController.moveToRandom();
                this.setAction('walking');
                this.notifyMovementListeners('walk_random');
            },
            sad: () => {
                // Sad: Slow, short movements
                movementController.setSpeed(0.3);
                movementController.moveToRandom();
                this.setAction('walking_slow');
                this.notifyMovementListeners('walk_slow');
            },
            neutral: () => {
                // Neutral: Normal walking
                movementController.setSpeed(0.5);
                movementController.moveToRandom();
                this.setAction('walking');
                this.notifyMovementListeners('walk_normal');
            }
        };

        const movementFn = movements[emotion] || movements.neutral;
        movementFn();

        console.log(`🚶 Autonomous movement triggered (${emotion})`);
    }

    /**
     * Decide on gesture based on context
     */
    decideGesture(context) {
        const { emotion, lastMessage } = context;

        // Simple gesture selection based on keywords and emotion
        let gesture = null;

        if (lastMessage) {
            const msg = lastMessage.toLowerCase();

            if (msg.includes('hello') || msg.includes('hi')) {
                gesture = 'wave';
            } else if (msg.includes('think') || msg.includes('wonder')) {
                gesture = 'thinking';
            } else if (msg.includes('yes') || msg.includes('agree')) {
                gesture = 'nod';
            } else if (emotion === 'happy') {
                gesture = Math.random() > 0.5 ? 'excited' : 'talking';
            }
        }

        if (gesture) {
            this.setGesture(gesture);
            this.notifyGestureListeners(gesture);
            console.log(`👋 Gesture triggered: ${gesture}`);
        }
    }

    /**
     * Use Llama3 to decide autonomous behavior (advanced)
     * @param {Object} llamaService - Llama3 service instance
     * @param {Object} context - Current context
     */
    async decideWithAI(llamaService, context) {
        try {
            const prompt = `You are controlling a realistic 3D avatar. Based on the context, decide what the avatar should do next.

Context:
- Emotion: ${context.emotion}
- Is Talking: ${context.isTalking}
- Last Message: ${context.lastMessage || 'none'}
- Time since last movement: ${Date.now() - this.lastMovementTime}ms

Actions:
1. High-level action: walk_random, gesture_wave, gesture_think, gesture_nod, idle, excited_idle, sad_idle, looking_around
2. Bone Control (Optional): Set rotation for specific bones (Euler angles in radians).
   Supported bones: head, neck, spine, hips, leftUpperArm, rightUpperArm, leftLowerArm, rightLowerArm.
   Example: "bones": {"head": [0.2, 0, 0], "leftUpperArm": [0, 0, 1.5]}

Respond with ONLY a JSON object: 
{
  "action": "chosen_action", 
  "reason": "brief reason",
  "bones": { ... } (optional)
}`;

            const response = await llamaService.generateResponse(
                [{ role: 'user', content: prompt }],
                () => { }
            );

            // Parse AI decision
            const match = response.match(/\{[^}]+\}/);
            if (match) {
                const decision = JSON.parse(match[0]);
                console.log(`🤖 AI Decision: ${decision.action} (${decision.reason})`);

                // Execute high-level action
                if (decision.action.startsWith('walk_')) {
                    this.decideMovement(context);
                } else if (decision.action.startsWith('gesture_')) {
                    const gesture = decision.action.replace('gesture_', '');
                    this.setGesture(gesture);
                } else {
                    this.setAction(decision.action);
                }

                // Execute bone control
                if (decision.bones) {
                    Object.keys(decision.bones).forEach(boneName => {
                        skeletonController.setTarget(boneName, decision.bones[boneName], 2.0);
                    });
                    console.log(`💀 Bone control applied: ${Object.keys(decision.bones).join(', ')}`);
                }
            }
        } catch (error) {
            console.warn('AI decision failed, using fallback:', error);
            this.decideAction(context); // Fallback to rule-based
        }
    }

    setAction(action) {
        if (this.currentAction !== action) {
            this.currentAction = action;
            this.notifyListeners(action);
        }
    }

    setGesture(gesture) {
        this.currentGesture = gesture;
        // Gestures are temporary, reset after a delay
        setTimeout(() => {
            this.currentGesture = null;
        }, 3000);
    }

    notifyListeners(action) {
        this.listeners.forEach(cb => cb(action));
    }

    notifyMovementListeners(movement) {
        this.movementListeners.forEach(cb => cb(movement));
    }

    notifyGestureListeners(gesture) {
        this.gestureListeners.forEach(cb => cb(gesture));
    }

    /**
     * Get current state
     */
    getState() {
        return {
            action: this.currentAction,
            gesture: this.currentGesture,
            isMoving: movementController.getState().isMoving,
            position: movementController.getState().position
        };
    }

    /**
     * Get animation URL for current action
     */
    getAnimationForAction(action) {
        const animMap = {
            'idle': ANIMATION_LIBRARY.idle.breathingIdle,
            'looking_around': ANIMATION_LIBRARY.idle.lookingAround,
            'walking': ANIMATION_LIBRARY.walking.walk,
            'walking_slow': ANIMATION_LIBRARY.walking.walk,
            'excited_idle': ANIMATION_LIBRARY.emotions.excited,
            'sad_idle': ANIMATION_LIBRARY.emotions.sad,
            'thinking': ANIMATION_LIBRARY.gestures.thinking,
            'talking': ANIMATION_LIBRARY.gestures.talking,
        };

        return animMap[action] || animMap['idle'];
    }

    /**
     * Get animation URL for gesture
     */
    getAnimationForGesture(gesture) {
        const gestureMap = {
            'wave': ANIMATION_LIBRARY.gestures.wave,
            'thinking': ANIMATION_LIBRARY.gestures.thinking,
            'nod': ANIMATION_LIBRARY.gestures.nod,
            'talking': ANIMATION_LIBRARY.gestures.talking,
        };

        return gestureMap[gesture];
    }
}

export const autonomyManager = new AutonomyManager();
