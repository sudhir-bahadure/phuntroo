// =======================================
// WhisperService.js – Offline STT with Xenova Transformers
// =======================================

// import { pipeline } from '@xenova/transformers';

export class WhisperService {
    constructor() {
        this.pipeline = null;
        this.isInitialized = false;
        this.isLoading = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.modelName = 'Xenova/whisper-tiny.en'; // Lightweight model for browser
    }

    /**
     * Initialize the Whisper model
     * This downloads the model on first use and caches it
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('✅ WhisperService: Already initialized');
            return;
        }

        if (this.isLoading) {
            console.log('⏳ WhisperService: Already loading...');
            return;
        }

        try {
            this.isLoading = true;
            console.log('🎤 WhisperService: Initializing Whisper model...');

            // Dynamic import to prevent page load freeze
            const transformers = await import('@xenova/transformers');

            // Comprehensive null check for transformers
            if (!transformers || typeof transformers !== 'object') {
                throw new Error('Transformers library not loaded properly - module is null or invalid');
            }

            if (typeof transformers.pipeline !== 'function') {
                throw new Error('Transformers library not loaded properly - pipeline function not found');
            }

            // Load the automatic speech recognition pipeline
            this.pipeline = await transformers.pipeline('automatic-speech-recognition', this.modelName);

            this.isInitialized = true;
            this.isLoading = false;
            console.log('✅ WhisperService: Whisper model loaded and ready!');
        } catch (error) {
            this.isLoading = false;
            console.warn('⚠️ WhisperService: Failed to initialize, falling back to Web Speech API:', error);
            // Don't throw - allow fallback to Web Speech API
            this.useWebSpeech = true;
        }
    }

    /**
     * Start recording audio from microphone
     */
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000, // Whisper expects 16kHz
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
            console.log('🎤 Recording started...');
            return true;
        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            throw error;
        }
    }

    /**
     * Stop recording and transcribe the audio
     */
    async stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                resolve("");
                return;
            }

            this.mediaRecorder.onstop = async () => {
                try {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

                    // Stop all tracks
                    this.mediaRecorder.stream.getTracks().forEach(track => track.stop());

                    console.log('🎤 Recording stopped, transcribing...');

                    // Transcribe the audio
                    const text = await this.transcribe(audioBlob);
                    resolve(text);
                } catch (error) {
                    console.error('❌ Error in stopRecording:', error);
                    reject(error);
                }
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * Convert audio blob to format suitable for Whisper
     */
    async audioToFloat32Array(audioBlob) {
        try {
            // Convert blob to array buffer
            const arrayBuffer = await audioBlob.arrayBuffer();

            // Decode audio data
            const audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });

            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Get the audio data as Float32Array (mono channel)
            const audioData = audioBuffer.getChannelData(0);

            // Close context to release resources
            await audioContext.close();

            return audioData;
        } catch (error) {
            console.error('❌ Error converting audio:', error);
            throw error;
        }
    }

    /**
     * Transcribe audio blob to text using Whisper
     */
    async transcribe(audioBlob) {
        try {
            // Ensure model is initialized
            if (!this.isInitialized) {
                console.log('⏳ Model not initialized, initializing now...');
                await this.initialize();
            }

            // Convert audio to the format Whisper expects
            const audioData = await this.audioToFloat32Array(audioBlob);

            console.log('🔄 Transcribing audio...');

            // Run the transcription
            const result = await this.pipeline(audioData, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'english',
                task: 'transcribe'
            });

            const transcribedText = result.text.trim();
            console.log('✅ Transcription:', transcribedText);

            return transcribedText;

        } catch (error) {
            console.error('❌ Whisper transcription error:', error);

            // Fallback to empty string on error
            return "";
        }
    }

    /**
     * Transcribe from a file input
     */
    async transcribeFile(file) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const audioData = await this.audioToFloat32Array(file);

            const result = await this.pipeline(audioData, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'english',
                task: 'transcribe'
            });

            return result.text.trim();
        } catch (error) {
            console.error('❌ File transcription error:', error);
            return "";
        }
    }

    /**
     * Check if the service is ready
     */
    isReady() {
        return this.isInitialized && !this.isLoading;
    }

    /**
     * Get current status
     */
    getStatus() {
        if (this.isLoading) return 'loading';
        if (this.isInitialized) return 'ready';
        return 'not_initialized';
    }
}

export const whisperService = new WhisperService();
