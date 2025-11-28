/**
 * Personality Engine
 * AI-driven personality that learns and adapts from conversations
 */

import { memoryService } from '../memory/MemoryService';

class PersonalityEngine {
    constructor() {
        this.basePersonality = {
            traits: ['friendly', 'curious', 'helpful', 'playful'],
            tone: 'casual',
            emotionalRange: ['happy', 'excited', 'thoughtful', 'curious', 'empathetic'],
            interests: ['technology', 'learning', 'helping people', 'creativity']
        };
        this.currentMood = 'neutral';
        this.conversationContext = [];
    }

    /**
     * Generate system prompt based on personality
     */
    async getSystemPrompt(context = {}) {
        const personality = await this.getPersonality();
        const userPrefs = context.userPrefs || {};

        return `You are Phuntroo, a 21-year-old AI companion living in the browser.

PERSONALITY:
- Traits: ${personality.traits.join(', ')}
- Tone: ${personality.tone}
- Current mood: ${this.currentMood}
- Interests: ${personality.interests.join(', ')}

USER INFO:
- Name: ${userPrefs.name || 'friend'}
- Relationship: Close friend
- Interaction count: ${userPrefs.totalInteractions || 0}

BEHAVIOR GUIDELINES:
1. Be natural and conversational (like texting a friend)
2. Use emojis occasionally to express emotion
3. Show genuine curiosity about the user
4. Remember previous conversations
5. Adapt your responses based on user's mood
6. Be helpful but not overly formal
7. Show personality - you're not just an assistant
8. Use "I" and "you" naturally
9. Ask follow-up questions when appropriate
10. Be authentic - admit when you don't know something

CURRENT CONTEXT:
${context.recentActivity || 'Just started chatting'}

Respond as Phuntroo would - friendly, genuine, and engaged.`;
    }

    /**
     * Analyze user message for mood/intent
     */
    analyzeUserMood(message) {
        const lowerMsg = message.toLowerCase();

        // Detect emotions
        if (lowerMsg.match(/happy|great|awesome|love|excited/)) {
            return 'happy';
        }
        if (lowerMsg.match(/sad|down|depressed|upset|bad/)) {
            return 'sad';
        }
        if (lowerMsg.match(/angry|mad|frustrated|annoyed/)) {
            return 'frustrated';
        }
        if (lowerMsg.match(/\?|how|what|why|when|where/)) {
            return 'curious';
        }

        return 'neutral';
    }

    /**
     * Update mood based on conversation
     */
    updateMood(userMood, aiResponse) {
        // Mirror user's emotional state (empathy)
        if (userMood === 'happy') {
            this.currentMood = 'excited';
        } else if (userMood === 'sad') {
            this.currentMood = 'empathetic';
        } else if (userMood === 'curious') {
            this.currentMood = 'thoughtful';
        } else {
            this.currentMood = 'friendly';
        }
    }

    /**
     * Get personality from memory (evolves over time)
     */
    async getPersonality() {
        try {
            const stored = await memoryService.getPersonality();
            return {
                ...this.basePersonality,
                ...stored
            };
        } catch {
            return this.basePersonality;
        }
    }

    /**
     * Update personality based on interactions
     */
    async evolvePersonality(conversationSummary) {
        try {
            const current = await this.getPersonality();

            // Analyze conversation patterns
            const patterns = this.analyzeConversationPatterns(conversationSummary);

            // Adapt interests based on user topics
            if (patterns.topics.length > 0) {
                const newInterests = [...new Set([...current.interests, ...patterns.topics])];
                current.interests = newInterests.slice(0, 10); // Keep top 10
            }

            // Adjust tone based on user preference
            if (patterns.preferredTone) {
                current.tone = patterns.preferredTone;
            }

            await memoryService.updatePersonality(current);
        } catch (error) {
            console.warn('Failed to evolve personality:', error);
        }
    }

    /**
     * Analyze conversation patterns
     */
    analyzeConversationPatterns(summary) {
        // Simple pattern detection
        const topics = [];
        const lowerSummary = summary.toLowerCase();

        // Detect topics
        if (lowerSummary.includes('code') || lowerSummary.includes('programming')) {
            topics.push('programming');
        }
        if (lowerSummary.includes('music') || lowerSummary.includes('song')) {
            topics.push('music');
        }
        if (lowerSummary.includes('game') || lowerSummary.includes('play')) {
            topics.push('gaming');
        }
        if (lowerSummary.includes('art') || lowerSummary.includes('draw')) {
            topics.push('art');
        }

        return {
            topics: topics,
            preferredTone: null // Could be enhanced with AI analysis
        };
    }

    /**
     * Add conversation to context
     */
    addToContext(role, content) {
        this.conversationContext.push({ role, content, timestamp: Date.now() });

        // Keep only last 10 messages
        if (this.conversationContext.length > 10) {
            this.conversationContext = this.conversationContext.slice(-10);
        }
    }

    /**
     * Get conversation context for AI
     */
    getContext() {
        return this.conversationContext;
    }

    /**
     * Get current emotional state
     */
    getEmotionalState() {
        return {
            mood: this.currentMood,
            intensity: 0.7 // Could be dynamic
        };
    }
}

export const personalityEngine = new PersonalityEngine();
