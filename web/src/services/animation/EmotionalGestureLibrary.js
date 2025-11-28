/**
 * Emotional Gesture Library
 * Expanded gesture system with nuanced emotional expressions
 */

class EmotionalGestureLibrary {
    constructor() {
        this.gestures = {
            // Thinking gestures
            'thinking_chin': {
                name: 'Hand to Chin',
                duration: 3.0,
                bones: {
                    rightUpperArm: { x: 0.4, y: 0, z: -0.6 },
                    rightLowerArm: { x: 0, y: 0.9, z: 0 },
                    rightHand: { x: 0.2, y: 0, z: 0 },
                    head: { x: 0.15, y: 0.2, z: 0.05 }
                },
                mood: 'thoughtful'
            },
            'thinking_temple': {
                name: 'Fingers to Temple',
                duration: 2.5,
                bones: {
                    rightUpperArm: { x: 0.5, y: 0, z: -0.7 },
                    rightLowerArm: { x: 0, y: 0.8, z: 0 },
                    rightHand: { x: 0.3, y: 0, z: 0.1 },
                    head: { x: -0.1, y: 0.1, z: -0.1 }
                },
                mood: 'concentrating'
            },

            // Excited gestures
            'excited_bounce': {
                name: 'Excited Bounce',
                duration: 1.5,
                bones: {
                    leftUpperArm: { x: 0, y: 0, z: 0.4 },
                    rightUpperArm: { x: 0, y: 0, z: -0.4 },
                    chest: { y: 0.05 }, // slight lift
                    head: { x: -0.05, y: 0, z: 0 }
                },
                mood: 'excited',
                animation: 'bounce' // special animation flag
            },
            'excited_clap': {
                name: 'Happy Clap',
                duration: 1.0,
                bones: {
                    leftUpperArm: { x: 0.3, y: 0, z: 0.5 },
                    rightUpperArm: { x: 0.3, y: 0, z: -0.5 },
                    leftLowerArm: { x: 0, y: -0.4, z: 0 },
                    rightLowerArm: { x: 0, y: -0.4, z: 0 }
                },
                mood: 'joyful',
                animation: 'clap'
            },

            // Empathetic gestures
            'empathy_reach': {
                name: 'Reaching Out',
                duration: 2.0,
                bones: {
                    rightUpperArm: { x: 0.2, y: 0, z: -0.4 },
                    rightLowerArm: { x: 0, y: 0.3, z: 0 },
                    rightHand: { x: 0.1, y: 0, z: 0 },
                    head: { x: 0.1, y: -0.1, z: 0.05 }
                },
                mood: 'caring'
            },
            'empathy_heart': {
                name: 'Hand to Heart',
                duration: 2.5,
                bones: {
                    rightUpperArm: { x: 0.3, y: 0, z: -0.3 },
                    rightLowerArm: { x: 0, y: 0.5, z: 0 },
                    rightHand: { x: 0.2, y: 0, z: 0 },
                    chest: { x: -0.05 },
                    head: { x: 0.05, y: -0.05, z: 0 }
                },
                mood: 'empathetic'
            },

            // Playful gestures
            'playful_wave': {
                name: 'Playful Wave',
                duration: 2.0,
                bones: {
                    rightUpperArm: { x: 0.5, y: 0, z: -0.8 },
                    rightLowerArm: { x: 0, y: 0.6, z: 0 },
                    rightHand: { x: 0, y: 0, z: 0.3 },
                    head: { x: 0, y: 0.1, z: 0.1 }
                },
                mood: 'playful',
                animation: 'wave'
            },
            'playful_shrug': {
                name: 'Playful Shrug',
                duration: 1.5,
                bones: {
                    leftShoulder: { y: 0.1, z: 0.1 },
                    rightShoulder: { y: 0.1, z: -0.1 },
                    leftUpperArm: { x: 0.2, y: 0, z: 0.3 },
                    rightUpperArm: { x: 0.2, y: 0, z: -0.3 },
                    head: { x: 0, y: 0.15, z: 0 }
                },
                mood: 'playful'
            },

            // Listening gestures
            'listening_attentive': {
                name: 'Attentive Listening',
                duration: 3.0,
                bones: {
                    head: { x: 0.1, y: 0.15, z: 0.05 },
                    spine: { x: 0.05 }
                },
                mood: 'attentive'
            },
            'listening_nod': {
                name: 'Understanding Nod',
                duration: 1.0,
                bones: {
                    head: { x: 0.2, y: 0, z: 0 }
                },
                mood: 'understanding',
                animation: 'nod'
            },

            // Surprised gestures
            'surprised_gasp': {
                name: 'Surprised Gasp',
                duration: 1.0,
                bones: {
                    leftUpperArm: { x: 0.2, y: 0, z: 0.3 },
                    rightUpperArm: { x: 0.2, y: 0, z: -0.3 },
                    head: { x: -0.1, y: 0, z: 0 },
                    chest: { x: -0.05 }
                },
                mood: 'surprised'
            }
        };
    }

    /**
     * Get gesture by name
     */
    getGesture(name) {
        return this.gestures[name] || null;
    }

    /**
     * Get gesture by mood/emotion
     */
    getGestureByMood(mood) {
        const matching = Object.entries(this.gestures)
            .filter(([_, gesture]) => gesture.mood === mood);

        if (matching.length === 0) return null;

        // Random selection from matching gestures
        const randomIndex = Math.floor(Math.random() * matching.length);
        return matching[randomIndex][1];
    }

    /**
     * Get gesture based on conversation context
     */
    suggestGesture(message, emotion, context = {}) {
        const lowerMsg = message.toLowerCase();

        // Question detection
        if (lowerMsg.includes('?') || lowerMsg.includes('how') || lowerMsg.includes('why')) {
            return this.getGesture('thinking_chin');
        }

        // Excitement detection
        if (lowerMsg.match(/amazing|awesome|great|wonderful|fantastic/)) {
            return this.getGesture('excited_bounce');
        }

        // Empathy detection
        if (lowerMsg.match(/sorry|sad|understand|feel|tough/)) {
            return this.getGesture('empathy_reach');
        }

        // Greeting detection
        if (lowerMsg.match(/hello|hi|hey|greet/)) {
            return this.getGesture('playful_wave');
        }

        // Uncertainty detection
        if (lowerMsg.match(/maybe|perhaps|not sure|don't know/)) {
            return this.getGesture('playful_shrug');
        }

        // Affirmation detection
        if (lowerMsg.match(/yes|exactly|right|agree/)) {
            return this.getGesture('listening_nod');
        }

        // Surprise detection
        if (lowerMsg.match(/really|wow|no way|seriously/)) {
            return this.getGesture('surprised_gasp');
        }

        // Default: mood-based
        return this.getGestureByMood(emotion);
    }

    /**
     * Get all gestures
     */
    getAllGestures() {
        return this.gestures;
    }
}

export const emotionalGestureLibrary = new EmotionalGestureLibrary();
