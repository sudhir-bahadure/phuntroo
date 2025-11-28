// Browser-based AI Service using WebLLM
// Zero API costs - all AI runs in the browser using WebGPU

import { webSearchSkill } from '../skills/WebSearchSkill';
import { webLLMService } from './WebLLMService';
import { personalityEngine } from '../ai/PersonalityEngine';
import { behaviorEngine } from '../ai/BehaviorEngine';
import { relationshipMemory } from '../memory/RelationshipMemory';

class CloudLlamaService {
    constructor() {
        this.conversationHistory = [];
        this.currentGesture = null;
        this.currentExpression = 'neutral';
    }

    async initialize(onProgress) {
        console.log('🤖 Initializing browser-based AI...');

        // Initialize WebLLM
        const success = await webLLMService.initialize(onProgress);

        if (success) {
            console.log('✅ Browser AI ready!');
            // Initialize relationship memory
            await relationshipMemory.initialize();
        }

        return success;
    }

    isReady() {
        return webLLMService.isReady();
    }

    /**
     * Get AI status
     */
    getStatus() {
        return webLLMService.getStatus();
    }

    async generateResponse(messages, context = {}) {
        try {
            // Format messages
            let formattedMessages = [];
            let searchContext = "";

            // Check if we need to search the web
            const lastUserMsg = Array.isArray(messages)
                ? messages.filter(m => m.role === 'user').pop()?.content
                : messages;

            if (typeof lastUserMsg === 'string' && webSearchSkill.shouldSearch(lastUserMsg)) {
                console.log("🌐 Triggering Web Search for:", lastUserMsg);
                const searchResults = await webSearchSkill.searchAndSummarize(lastUserMsg);
                if (searchResults) {
                    searchContext = `\n\n[WEB SEARCH RESULTS]:\n${searchResults}\n(Use this information to answer if relevant, but don't explicitly say "I searched the web" unless asked. Just know it.)`;
                }
            }

            // Get relationship context
            const relationshipContext = relationshipMemory.getConversationContext();

            // Build context for WebLLM
            const aiContext = {
                userPrefs: context.userPrefs,
                emotion: context.emotion,
                outfit: context.outfit,
                relationship: relationshipContext,
                searchContext: searchContext
            };

            // Add conversation history (last 10 messages for context)
            if (Array.isArray(messages)) {
                const recentMessages = messages.slice(-10);
                formattedMessages = recentMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content || msg.text || ''
                }));
            } else {
                formattedMessages = [{ role: "user", content: messages }];
            }

            // Analyze user mood
            const userMood = personalityEngine.analyzeUserMood(lastUserMsg);

            // Generate response using WebLLM (browser-based)
            const response = await webLLMService.generateResponse(formattedMessages, aiContext);

            const aiResponse = response.response;

            // Update personality mood
            personalityEngine.updateMood(userMood, aiResponse);

            // Get emotional state
            const emotionalState = personalityEngine.getEmotionalState();

            // Update expression based on emotion
            this.currentExpression = response.expression || behaviorEngine.updateExpression(emotionalState.mood);

            // Suggest gesture based on response content
            const suggestedGesture = response.gesture || behaviorEngine.suggestGesture(aiResponse, emotionalState.mood);
            behaviorEngine.queueGesture(suggestedGesture);
            this.currentGesture = suggestedGesture;

            // Update relationship memory
            await relationshipMemory.addConversation(lastUserMsg, aiResponse, emotionalState.mood);
            await relationshipMemory.save();

            console.log(`✨ Response from ${response.provider} | Mood: ${emotionalState.mood} | Gesture: ${suggestedGesture}`);

            return {
                response: aiResponse,
                provider: response.provider,
                expression: this.currentExpression,
                gesture: this.currentGesture,
                mood: emotionalState.mood
            };

        } catch (error) {
            console.error('AI generation error:', error);

            // Fallback response
            return {
                response: "I'm having trouble thinking right now 😅 My brain might still be loading. Can you try again?",
                provider: 'fallback',
                expression: 'neutral',
                gesture: null,
                mood: 'neutral'
            };
        }
    }

    /**
     * Get current gesture from behavior engine
     */
    getCurrentGesture() {
        return behaviorEngine.getNextGesture();
    }

    /**
     * Get current expression
     */
    getCurrentExpression() {
        return this.currentExpression;
    }
}

export const llamaService = new CloudLlamaService();
