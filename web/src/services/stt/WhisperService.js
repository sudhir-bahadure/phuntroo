import { pipeline } from '@xenova/transformers';

class WhisperService {
    constructor() {
        this.transcriber = null;
        this.isReady = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    async initialize() {
        if (this.isReady) return;

        try {
            console.log('Loading Whisper model...');
            this.transcriber = await pipeline(
                'automatic-speech-recognition',
                'Xenova/whisper-tiny.en'
            );
            this.isReady = true;
            console.log('Whisper ready!');
        } catch (error) {
            console.error('Failed to load Whisper:', error);
            throw error;
        }
    }

    async startRecording() {
        if (!this.isReady) {
            throw new Error('Whisper not initialized');
        }

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
                reject(new Error('No active recording'));
                return;
            }

            this.mediaRecorder.onstop = async () => {
                try {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    const arrayBuffer = await audioBlob.arrayBuffer();

                    // Transcribe
                    const result = await this.transcriber(arrayBuffer);

                    // Stop all tracks
                    this.mediaRecorder.stream.getTracks().forEach(track => track.stop());

                    resolve(result.text);
                } catch (error) {
                    reject(error);
                }
            };

            this.mediaRecorder.stop();
        });
    }
}

export const whisperService = new WhisperService();
