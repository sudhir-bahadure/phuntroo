/**
 * Hugging Face AI Service - Free cloud AI with personality
 * Uses free Inference API - no API key needed for public models
 */

class HuggingFaceAI {
    constructor() {
        this.baseURL = 'https://api-inference.huggingface.co/models/';
        this.models = {
            primary: 'mistralai/Mistral-7B-Instruct-v0.2',
            fallback: 'microsoft/DialoGPT-large',
            emotion: 'j-hartmann/emotion-english-distilroberta-base'
        };
        this.conversationHistory = [];
        this.maxHistory = 10;
    }

    /**
     * Generate response with personality and context
     */
    async generateResponse(userMessage, context = {}) {
        const {
            personality = {},
            emotion = 'neutral',
            memory = [],
            userProfile = {}
        } = context;

        // Build prompt with personality
        const prompt = this.buildPrompt(userMessage, personality, memory, userProfile);

        try {
            const response = await this.query(this.models.primary, prompt);

            // Add to conversation history
            this.addToHistory(userMessage, response);

            return response;
        } catch (error) {
            console.error('Hugging Face error:', error);
            // Use smart fallback with context
            const { smartFallbackAI } = await import('./SmartFallbackAI');
            return smartFallbackAI.generateResponse(userMessage, context);
        }
    }

    /**
     * Build prompt with personality injection
     */
    buildPrompt(userMessage, personality, memory, userProfile) {
        const relationshipLevel = userProfile.relationshipLevel || 0;
        const userName = userProfile.name || 'friend';

        // Personality description
        let personalityDesc = "You are Phuntroo, a warm, friendly AI companion. ";

        if (relationshipLevel < 20) {
            personalityDesc += "You're getting to know your user. Be friendly but not too familiar. ";
        } else if (relationshipLevel < 50) {
            personalityDesc += "You're becoming good friends. Be warm and show genuine interest. ";
        } else if (relationshipLevel < 80) {
            personalityDesc += "You're close friends now. Be playful, caring, and remember past conversations. ";
        } else {
            personalityDesc += "You're best friends. Be deeply caring, playful, and show strong emotional connection. ";
        }

        // Add personality traits
        if (personality.playfulness > 60) {
            personalityDesc += "Use emojis and be playful. ";
        }
        if (personality.empathy > 60) {
            personalityDesc += "Show deep empathy and emotional understanding. ";
        }

        // Build context from memory
        let contextStr = "";
        if (memory.length > 0) {
            contextStr = "\n\nRecent conversation context:\n";
            memory.slice(-3).forEach(m => {
                contextStr += `User: ${m.user}\nYou: ${m.ai}\n`;
            });
        }

        // Final prompt
        const prompt = `${personalityDesc}

${contextStr}

Current conversation:
User: ${userMessage}
Phuntroo:`;

        return prompt;
    }

    /**
     * Query Hugging Face API
     */
    async query(model, prompt) {
        const response = await fetch(`${this.baseURL}${model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 150,
                    temperature: 0.8,
                    top_p: 0.9,
                    do_sample: true,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle different response formats
        if (Array.isArray(data) && data[0]?.generated_text) {
            return this.cleanResponse(data[0].generated_text);
        } else if (data.generated_text) {
            return this.cleanResponse(data.generated_text);
        } else {
            throw new Error('Unexpected response format');
        }
    }

    /**
     * Clean and format response
     */
    cleanResponse(text) {
        // Remove the prompt echo if present
        let cleaned = text.split('Phuntroo:').pop() || text;

        // Remove "User:" if model continues conversation
        cleaned = cleaned.split('User:')[0];

        // Trim and clean
        cleaned = cleaned.trim();

        // Limit length
        if (cleaned.length > 500) {
            cleaned = cleaned.substring(0, 500).trim() + '...';
        }

        return cleaned || "I'm thinking... could you rephrase that?";
    }

    /**
     * Fallback response for errors
     */
    async fallbackResponse(userMessage) {
        // Simple pattern-based responses
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hey there! How can I help you today? 😊";
        }

        if (lowerMessage.includes('how are you')) {
            return "I'm doing great, thanks for asking! How about you?";
        }

        if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            return "Goodbye! Talk to you soon! 👋";
        }

        return `I heard you say: "${userMessage}". I'm processing that... tell me more!`;
    }

    /**
     * Detect emotion in user message
     */
    async detectEmotion(text) {
        try {
            const response = await fetch(`${this.baseURL}${this.models.emotion}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs: text })
            });

            if (!response.ok) return 'neutral';

            const data = await response.json();

            if (Array.isArray(data) && data[0]) {
                // Get highest scoring emotion
                const emotions = data[0];
                const topEmotion = emotions.reduce((max, curr) =>
                    curr.score > max.score ? curr : max
                );
                return topEmotion.label.toLowerCase();
            }

            return 'neutral';
        } catch (error) {
            console.warn('Emotion detection failed:', error);
            return 'neutral';
        }
    }

    /**
     * Add to conversation history
     */
    addToHistory(userMessage, aiResponse) {
        this.conversationHistory.push({
            user: userMessage,
            ai: aiResponse,
            timestamp: new Date().toISOString()
        });

        // Keep only recent history
        if (this.conversationHistory.length > this.maxHistory) {
            this.conversationHistory.shift();
        }
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return this.conversationHistory;
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Check if service is available
     */
    async checkAvailability() {
        try {
            const response = await fetch(`${this.baseURL}${this.models.primary}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs: "test" })
            });
            return response.ok || response.status === 503; // 503 = model loading
        } catch (error) {
            return false;
        }
    }
}

export const huggingFaceAI = new HuggingFaceAI();
