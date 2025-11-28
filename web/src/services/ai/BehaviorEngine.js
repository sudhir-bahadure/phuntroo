/**
 * Behavior Engine
 * AI-driven body language, gestures, and expressions
 */

class BehaviorEngine {
    constructor() {
        this.currentGesture = null;
        this.currentExpression = 'neutral';
        this.gestureQueue = [];
    }

    /**
     * Map emotion to facial expression
     */
    emotionToExpression(emotion) {
        const expressionMap = {
            'happy': 'happy',
            'excited': 'happy',
            'sad': 'sad',
            'empathetic': 'relaxed',
            'thoughtful': 'neutral',
            'curious': 'surprised',
            'frustrated': 'angry',
            'friendly': 'happy',
            'neutral': 'neutral'
        };

        return expressionMap[emotion] || 'neutral';
    }

    /**
     * Suggest gesture based on conversation content
     */
    suggestGesture(message, emotion) {
        const lowerMsg = message.toLowerCase();

        // Question gestures
        if (lowerMsg.includes('?')) {
            return 'thinking';
        }

        // Greeting gestures
        if (lowerMsg.match(/hello|hi|hey|greet/)) {
            return 'wave';
        }

        // Excitement gestures
        if (emotion === 'excited' || lowerMsg.match(/amazing|awesome|great/)) {
            return 'celebrate';
        }

        // Explaining gestures
        if (lowerMsg.length > 100 || lowerMsg.match(/because|so|therefore/)) {
            return 'explain';
        }

        // Empathy gestures
        if (emotion === 'empathetic' || lowerMsg.match(/sorry|understand|feel/)) {
            return 'empathy';
        }

        // Default talking gesture
        return 'talking';
    }

    /**
     * Get gesture animation parameters
     */
    getGestureParams(gestureName) {
        const gestures = {
            'wave': {
                rightUpperArm: { x: 0.5, y: 0, z: -0.8 },
                rightLowerArm: { x: 0, y: 0.5, z: 0 },
                rightHand: { x: 0, y: 0, z: 0.3 },
                duration: 2.0,
                repeat: 2
            },
            'thinking': {
                rightUpperArm: { x: 0.3, y: 0, z: -0.5 },
                rightLowerArm: { x: 0, y: 0.8, z: 0 },
                rightHand: { x: 0.2, y: 0, z: 0 },
                head: { x: 0.2, y: 0.3, z: 0 },
                duration: 3.0,
                repeat: 1
            },
            'celebrate': {
                leftUpperArm: { x: 0, y: 0, z: 0.5 },
                rightUpperArm: { x: 0, y: 0, z: -0.5 },
                leftLowerArm: { x: 0, y: -0.3, z: 0 },
                rightLowerArm: { x: 0, y: -0.3, z: 0 },
                duration: 1.5,
                repeat: 3
            },
            'explain': {
                leftUpperArm: { x: 0.2, y: 0, z: 0.3 },
                rightUpperArm: { x: 0.2, y: 0, z: -0.3 },
                leftHand: { x: 0, y: 0, z: 0.2 },
                rightHand: { x: 0, y: 0, z: -0.2 },
                duration: 4.0,
                repeat: 1
            },
            'empathy': {
                rightUpperArm: { x: 0.3, y: 0, z: -0.4 },
                rightLowerArm: { x: 0, y: 0.5, z: 0 },
                rightHand: { x: 0.1, y: 0, z: 0 },
                head: { x: -0.1, y: 0.2, z: 0 },
                duration: 2.5,
                repeat: 1
            },
            'talking': {
                // Subtle hand gestures while talking
                leftUpperArm: { x: 0.1, y: 0, z: 0.15 },
                rightUpperArm: { x: 0.1, y: 0, z: -0.15 },
                duration: 2.0,
                repeat: -1 // Continuous
            }
        };

        return gestures[gestureName] || gestures['talking'];
    }

    /**
     * Queue a gesture
     */
    queueGesture(gestureName) {
        this.gestureQueue.push({
            name: gestureName,
            params: this.getGestureParams(gestureName),
            timestamp: Date.now()
        });
    }

    /**
     * Get next gesture from queue
     */
    getNextGesture() {
        if (this.gestureQueue.length === 0) return null;
        return this.gestureQueue.shift();
    }

    /**
     * Update expression based on emotion
     */
    updateExpression(emotion) {
        this.currentExpression = this.emotionToExpression(emotion);
        return this.currentExpression;
    }

    /**
     * Get gaze direction based on state
     */
    getGazeDirection(avatarState, emotion) {
        if (avatarState === 'thinking') {
            return { x: 0.5, y: 0.5 }; // Look up/away
        }
        if (avatarState === 'listening') {
            return { x: 0, y: 0 }; // Look at user
        }
        if (emotion === 'empathetic') {
            return { x: 0, y: -0.1 }; // Slight downward gaze
        }

        // Default: natural movement
        return null;
    }

    /**
     * Calculate blink frequency based on state
     */
    getBlinkFrequency(avatarState, emotion) {
        if (avatarState === 'thinking') {
            return 2.0; // Blink more when thinking
        }
        if (emotion === 'excited') {
            return 3.0; // Blink more when excited
        }

        return 4.0; // Normal blink rate
    }
}

export const behaviorEngine = new BehaviorEngine();
