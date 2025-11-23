import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === 'production'
        ? 'https://phuntroo-backend.onrender.com'
        : 'http://localhost:3000');

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Send a chat message to the AI
 */
export async function sendChatMessage(message, sessionId = 'default', enhance = false) {
    try {
        const response = await api.post('/api/ai/chat', {
            message,
            sessionId,
            enhance
        });
        return response.data;
    } catch (error) {
        console.error('Chat API error:', error);
        throw error;
    }
}

/**
 * Get text-to-speech audio
 */
export async function getTextToSpeech(text, language = 'en-IN', voiceName = 'en-IN-Wavenet-A') {
    try {
        const response = await api.post('/api/voice/tts', {
            text,
            language,
            voiceName
        });
        return response.data;
    } catch (error) {
        console.error('TTS API error:', error);
        throw error;
    }
}

/**
 * Get phoneme data for lip-sync
 */
export async function getPhonemeData(text) {
    try {
        const response = await api.post('/api/voice/analyze-audio', {
            text
        });
        return response.data;
    } catch (error) {
        console.error('Phoneme analysis error:', error);
        throw error;
    }
}

/**
 * Summarize text
 */
export async function summarizeText(text, length = 'medium') {
    try {
        const response = await api.post('/api/ai/summarize', {
            text,
            length
        });
        return response.data;
    } catch (error) {
        console.error('Summarize API error:', error);
        throw error;
    }
}

/**
 * Generate image
 */
export async function generateImage(prompt) {
    try {
        const response = await api.post('/api/ai/generate-image', {
            prompt
        }, {
            responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
    } catch (error) {
        console.error('Image generation error:', error);
        throw error;
    }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(sessionId = 'default') {
    try {
        const response = await api.get(`/api/ai/history/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Get history error:', error);
        throw error;
    }
}

/**
 * Clear conversation history
 */
export async function clearConversationHistory(sessionId = 'default') {
    try {
        const response = await api.delete(`/api/ai/history/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Clear history error:', error);
        throw error;
    }
}

/**
 * Check server health
 */
export async function checkHealth() {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        console.error('Health check error:', error);
        throw error;
    }
}

export default {
    sendChatMessage,
    getTextToSpeech,
    getPhonemeData,
    summarizeText,
    generateImage,
    getConversationHistory,
    clearConversationHistory,
    checkHealth
};
