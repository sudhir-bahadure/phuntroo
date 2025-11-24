/**
 * Text-to-Speech Service using Web Speech API
 * Built into browsers, completely free
 */

import { charToViseme } from '../../utils/visemeMapping';

class TTSService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voice = null;
        this.isReady = false;
        this.visemeQueue = []; // Shared queue for avatar
    }

    async initialize() {
        if (this.isReady) return;

        try {
            // Wait for voices to load
            await this.loadVoices();
            this.isReady = true;
            console.log('🔊 TTS ready!');
        } catch (error) {
            console.error('TTS initialization error:', error);
        }
    }

    async loadVoices() {
        return new Promise((resolve) => {
            const voices = this.synth.getVoices();

            if (voices.length > 0) {
                this.selectVoice(voices);
                resolve();
            } else {
                // Wait for voices to load
                this.synth.onvoiceschanged = () => {
                    const loadedVoices = this.synth.getVoices();
                    this.selectVoice(loadedVoices);
                    resolve();
                };
            }
        });
    }

    selectVoice(voices) {
        // Try to find Indian English female voice
        let selectedVoice = voices.find(v =>
            v.lang.includes('en-IN') && v.name.toLowerCase().includes('female')
        );

        // Fallback to any Indian English voice
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.includes('en-IN'));
        }

        // Fallback to any English female voice
        if (!selectedVoice) {
            selectedVoice = voices.find(v =>
                v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
            );
        }

        // Fallback to first English voice
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.startsWith('en'));
        }

        // Last resort: first available voice
        if (!selectedVoice) {
            selectedVoice = voices[0];
        }

        this.voice = selectedVoice;
        console.log('🎤 Selected voice:', selectedVoice?.name, selectedVoice?.lang);
    }

    /**
     * Speak text
     */
    speak(text, options = {}) {
        if (!this.isReady) {
            console.warn('TTS not ready');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            // Cancel any ongoing speech
            this.synth.cancel();
            this.visemeQueue.length = 0; // Clear queue

            const utterance = new SpeechSynthesisUtterance(text);

            // Set voice
            if (this.voice) {
                utterance.voice = this.voice;
            }

            // Set parameters
            utterance.rate = options.rate || 1.0;
            utterance.pitch = options.pitch || 1.0;
            utterance.volume = options.volume || 1.0;

            // Event handlers
            utterance.onend = () => {
                console.log('🔊 Speech finished');
                this.visemeQueue.length = 0;
                resolve();
            };

            utterance.onerror = (error) => {
                console.error('Speech error:', error);
                reject(error);
            };

            // Viseme generation on boundary
            utterance.onboundary = (ev) => {
                if (ev.name === 'word' || ev.name === 'sentence') {
                    const charIndex = ev.charIndex;
                    const char = text[charIndex] || ' ';
                    this.visemeQueue.push(charToViseme(char));
                }
            };

            // Speak
            this.synth.speak(utterance);
        });
    }

    /**
     * Stop speaking
     */
    stop() {
        this.synth.cancel();
        this.visemeQueue.length = 0;
    }

    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.synth.speaking;
    }

    /**
     * Get available voices
     */
    getVoices() {
        return this.synth.getVoices();
    }

    /**
     * Set specific voice by name
     */
    setVoiceByName(name) {
        const voices = this.getVoices();
        const voice = voices.find(v => v.name === name);
        if (voice) {
            this.voice = voice;
            console.log('Voice changed to:', voice.name);
        }
    }
}

export const ttsService = new TTSService();
