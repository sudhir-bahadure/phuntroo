/**
 * VisionService.js
 * Handles webcam access and image capture for AI vision capabilities.
 */

class VisionService {
    constructor() {
        this.stream = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Create hidden video element for capture
            this.videoElement = document.createElement('video');
            this.videoElement.autoplay = true;
            this.videoElement.playsInline = true;
            this.videoElement.style.display = 'none';
            document.body.appendChild(this.videoElement);

            // Create canvas for processing
            this.canvasElement = document.createElement('canvas');

            this.isInitialized = true;
            console.log('👁️ VisionService initialized');
        } catch (error) {
            console.error('Failed to initialize VisionService:', error);
            throw error;
        }
    }

    async startCamera() {
        if (!this.isInitialized) await this.initialize();

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            this.videoElement.srcObject = this.stream;

            // Wait for video to be ready
            return new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve(this.stream);
                };
            });
        } catch (error) {
            console.error('Camera access denied:', error);
            throw new Error('Please allow camera access to let Phuntroo see you!');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.videoElement.srcObject = null;
        }
    }

    captureImage() {
        if (!this.stream || !this.videoElement) {
            throw new Error('Camera not started');
        }

        const width = this.videoElement.videoWidth;
        const height = this.videoElement.videoHeight;

        this.canvasElement.width = width;
        this.canvasElement.height = height;

        const ctx = this.canvasElement.getContext('2d');
        ctx.drawImage(this.videoElement, 0, 0, width, height);

        // Convert to base64 JPEG (compressed for API)
        return this.canvasElement.toDataURL('image/jpeg', 0.7);
    }

    isActive() {
        return !!this.stream && this.stream.active;
    }
}

export const visionService = new VisionService();
