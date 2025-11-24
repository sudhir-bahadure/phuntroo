// CLIENT-ONLY API - No backend required
// All functions work locally in the browser

/**
 * Send a chat message to the AI (uses local LlamaService instead)
 */
export async function sendChatMessage(message, sessionId = 'default', enhance = false) {
    console.log('📝 Client-only mode: Use LlamaService directly for chat');
    // This is now handled by LlamaService in the frontend
    return {
        response: "I'm running locally in your browser!",
        sessionId
    };
}

/**
 * Get text-to-speech audio (uses browser's SpeechSynthesis)
 */
export async function getTextToSpeech(text, language = 'en-IN', voiceName = 'en-IN-Wavenet-A') {
    console.log('🔊 Client-only mode: Using browser TTS');
    // This is now handled by TTSService using browser's SpeechSynthesis
    return { success: true };
}

/**
 * Get phoneme data for lip-sync (simplified client-side)
 */
export async function getPhonemeData(text) {
    console.log('👄 Client-only mode: Simplified phoneme data');
    // Simple phoneme approximation
    return {
        phonemes: text.split(' ').map(word => ({
            phoneme: 'a',
            duration: 0.1
        }))
    };
}

/**
 * Summarize text (basic client-side summarization)
 */
export async function summarizeText(text, length = 'medium') {
    console.log('📄 Client-only mode: Basic summarization');
    // Simple summarization - just truncate
    const maxLength = length === 'short' ? 50 : length === 'long' ? 200 : 100;
    return {
        summary: text.substring(0, maxLength) + (text.length > maxLength ? '...' : '')
    };
}

/**
 * Generate image (disabled in client-only mode)
 */
export async function generateImage(prompt) {
    console.log('🎨 Client-only mode: Image generation disabled');
    throw new Error('Image generation requires backend - currently disabled');
}

/**
 * Get conversation history (uses local IndexedDB via MemoryService)
 */
export async function getConversationHistory(sessionId = 'default') {
    console.log('📚 Client-only mode: Use MemoryService for history');
    // This is now handled by MemoryService using IndexedDB
    return { conversations: [] };
}

/**
 * Clear conversation history (uses local IndexedDB)
 */
export async function clearConversationHistory(sessionId = 'default') {
    console.log('🗑️ Client-only mode: Use MemoryService to clear');
    return { success: true };
}

/**
 * Check server health (always returns healthy in client-only mode)
 */
export async function checkHealth() {
    console.log('💚 Client-only mode: Always healthy (no backend)');
    return {
        status: 'healthy',
        mode: 'client-only',
        message: 'Running fully in browser - no backend required'
    };
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
