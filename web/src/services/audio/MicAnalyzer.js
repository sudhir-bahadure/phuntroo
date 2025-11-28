/**
 * Mic Analyzer
 * Real-time audio analysis for voice-reactive animations
 */

class MicAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.micData = null;
        this.currentLevel = 0;
        this.isActive = false;
        this.stream = null;
    }

    /**
     * Initialize mic access
     */
    async initialize() {
        if (this.isActive) {
            console.log('🎤 Mic already active');
            return true;
        }

        try {
            // Request mic access
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(this.stream);

            // Create analyser
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.micData = new Uint8Array(this.analyser.frequencyBinCount);

            // Connect
            source.connect(this.analyser);

            this.isActive = true;
            this.startAnalysis();

            console.log('🎤 Mic analyzer active');
            return true;

        } catch (error) {
            console.error('Mic access error:', error);
            return false;
        }
    }

    /**
     * Start continuous analysis
     */
    startAnalysis() {
        const analyze = () => {
            if (!this.isActive || !this.analyser || !this.micData) return;

            this.analyser.getByteFrequencyData(this.micData);

            // Calculate average level
            let sum = 0;
            for (let i = 0; i < this.micData.length; i++) {
                sum += this.micData[i];
            }
            const avg = sum / this.micData.length;
            this.currentLevel = Math.min(avg / 128, 1); // Normalize to 0-1

            requestAnimationFrame(analyze);
        };

        analyze();
    }

    /**
     * Get current mic level (0-1)
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Check if mic is active
     */
    isReady() {
        return this.isActive;
    }

    /**
     * Stop mic analysis
     */
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.isActive = false;
        this.currentLevel = 0;
        console.log('🎤 Mic analyzer stopped');
    }
}

export const micAnalyzer = new MicAnalyzer();
