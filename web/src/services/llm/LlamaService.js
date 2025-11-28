// Browser-based AI Service using WebLLM
// Falls back to Hugging Face API if WebGPU is not available

import { webSearchSkill } from '../skills/WebSearchSkill';
import { webLLMService } from './WebLLMService';
import { huggingFaceFallback } from './HuggingFaceFallback';
import { personalityEngine } from '../ai/PersonalityEngine';
import { behaviorEngine } from '../ai/BehaviorEngine';
import { relationshipMemory } from '../memory/RelationshipMemory';

class CloudLlamaService {
    constructor() {
        this.conversationHistory = [];
        this.currentGesture = null;
        this.currentExpression = 'neutral';
        this.useWebLLM = false;
        this.useFallback = false;
    }

    async initialize(onProgress) {
        console.log('🤖 Initializing browser-based AI...');

        // Try WebLLM first
        const webLLMSuccess = await webLLMService.initialize(onProgress);

        if (webLLMSuccess) {
            console.log('✅ WebLLM ready!');
            this.useWebLLM = true;
        } else {
            console.log('⚠️ WebLLM not available, using Hugging Face fallback');
            this.useFallback = true;

            if (onProgress) {
                onProgress({
                    progress: 1.0,
                    text: 'Using cloud AI fallback (free)',
                    stage: 'Ready'
                });
            }
        }

        // Initialize relationship memory
        await relationshipMemory.initialize();

        return true; // Always return true - we have fallback
    }

    isReady() {
        return this.useWebLLM || this.useFallback;
    }

    /**
     * Get AI status
     */
    getStatus() {
        if (this.useWebLLM) {
            return webLLMService.getStatus();
        } else {
            return {
                initialized: true,
                loading: false,
                progress: 100,
                model: 'Phi-3-mini (Hugging Face)',
                provider: 'Hugging Face Fallback',
                ready: true,
                webGPUSupported: false
            };
        }
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

            // Disabled web search to avoid CORS errors
            // if (typeof lastUserMsg === 'string' && webSearchSkill.shouldSearch(lastUserMsg)) {
            //     console.log("🌐 Triggering Web Search for:", lastUserMsg);
            //     const searchResults = await webSearchSkill.searchAndSummarize(lastUserMsg);
            //     if (searchResults) {
            //         searchContext = `\n\n[WEB SEARCH RESULTS]:\n${searchResults}\n(Use this information to answer if relevant, but don't explicitly say "I searched the web" unless asked. Just know it.)`;
            //     }
            // }

            // Get relationship context
            const relationshipContext = relationshipMemory.getConversationContext();

            // Build context for AI
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

            // Generate response using WebLLM or fallback
            let response;

            if (this.useWebLLM && webLLMService.isReady()) {
                response = await webLLMService.generateResponse(formattedMessages, aiContext);
            } else {
                // Use Hugging Face fallback
                response = await huggingFaceFallback.generateResponse(formattedMessages, aiContext);
            }

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
