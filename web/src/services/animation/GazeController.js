/**
 * Intelligent Gaze Controller
 * Natural eye movement and gaze tracking
 */

class GazeController {
    constructor() {
        this.currentGaze = { x: 0, y: 0 };
        this.targetGaze = { x: 0, y: 0 };
        this.blinkTimer = 0;
        this.nextBlinkTime = this.randomBlinkInterval();
        this.gazeMode = 'idle';
        this.dartTimer = 0;
    }

    /**
     * Random blink interval (2-6 seconds)
     */
    randomBlinkInterval() {
        return 2 + Math.random() * 4;
    }

    /**
     * Update gaze based on conversation state
     */
    update(deltaTime, conversationState = {}) {
        this.blinkTimer += deltaTime;
        this.dartTimer += deltaTime;

        // Determine gaze mode
        if (conversationState.isThinking) {
            this.gazeMode = 'thinking';
        } else if (conversationState.isListening) {
            this.gazeMode = 'listening';
        } else if (conversationState.isTalking) {
            this.gazeMode = 'talking';
        } else {
            this.gazeMode = 'idle';
        }

        // Set target gaze based on mode
        this.updateTargetGaze(conversationState);

        // Smooth interpolation to target
        const lerpSpeed = 0.05;
        this.currentGaze.x += (this.targetGaze.x - this.currentGaze.x) * lerpSpeed;
        this.currentGaze.y += (this.targetGaze.y - this.currentGaze.y) * lerpSpeed;

        // Natural eye darts (quick micro-movements)
        if (this.dartTimer > 1.5 + Math.random()) {
            this.addEyeDart();
            this.dartTimer = 0;
        }
    }

    /**
     * Update target gaze based on mode
     */
    updateTargetGaze(state) {
        const t = Date.now() / 1000;

        switch (this.gazeMode) {
            case 'thinking':
                // Look up and away
                this.targetGaze.x = 0.4 + Math.sin(t * 0.3) * 0.1;
                this.targetGaze.y = 0.5 + Math.cos(t * 0.2) * 0.1;
                break;

            case 'listening':
                // Direct eye contact with slight movement
                this.targetGaze.x = Math.sin(t * 0.5) * 0.05;
                this.targetGaze.y = Math.cos(t * 0.3) * 0.05;
                break;

            case 'talking':
                // Look at user but with natural variation
                this.targetGaze.x = Math.sin(t * 0.4) * 0.1;
                this.targetGaze.y = Math.sin(t * 0.25) * 0.08;
                break;

            case 'idle':
                // Look around naturally
                this.targetGaze.x = Math.sin(t * 0.2) * 0.3 + Math.sin(t * 1.2) * 0.1;
                this.targetGaze.y = Math.cos(t * 0.15) * 0.2;
                break;
        }
    }

    /**
     * Add quick eye dart (micro-movement)
     */
    addEyeDart() {
        this.targetGaze.x += (Math.random() - 0.5) * 0.15;
        this.targetGaze.y += (Math.random() - 0.5) * 0.1;
    }

    /**
     * Check if should blink
     */
    shouldBlink() {
        if (this.blinkTimer >= this.nextBlinkTime) {
            this.blinkTimer = 0;
            this.nextBlinkTime = this.randomBlinkInterval();
            return true;
        }
        return false;
    }

    /**
     * Get current gaze direction
     */
    getCurrentGaze() {
        return {
            x: this.currentGaze.x,
            y: this.currentGaze.y
        };
    }

    /**
     * Set gaze to specific target (e.g., mouse position)
     */
    lookAt(x, y) {
        this.targetGaze.x = x;
        this.targetGaze.y = y;
    }

    /**
     * Get gaze mode
     */
    getMode() {
        return this.gazeMode;
    }
}

export const gazeController = new GazeController();
