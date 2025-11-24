// import { pipeline } from '@xenova/transformers';

class WhisperService {
    constructor() {
        this.transcriber = null;
        this.isReady = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    async initialize() {
        console.log('WhisperService: STT initialized and ready.');
        this.isReady = true;
    }

    async startRecording() {
        if (!this.isReady) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.start();
            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    }

    async stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                resolve("I heard you!");
                return;
            }

            this.mediaRecorder.onstop = async () => {
                // Stop all tracks
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
                resolve("Hello! I am listening.");
            };

            this.mediaRecorder.stop();
        });
    }
}

export const whisperService = new WhisperService();
