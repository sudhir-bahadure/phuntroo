// Multi-AI Service with Personality Engine
// Intelligent routing between Groq, Together AI, and Hugging Face

import { webSearchSkill } from '../skills/WebSearchSkill';
import { aiOrchestrator } from '../ai/AIOrchestrator';
import { personalityEngine } from '../ai/PersonalityEngine';
import { behaviorEngine } from '../ai/BehaviorEngine';

class CloudLlamaService {
    constructor() {
        this.conversationHistory = [];
        this.currentGesture = null;
        this.currentExpression = 'neutral';
    }

    async initialize(onProgress) {
        console.log('🤖 Multi-AI system ready!');
        if (onProgress) {
            onProgress({ progress: 1.0, text: 'AI ready!' });
        }
        return true;
    }

    isReady() {
        return true;
    }

    /**
     * Set API keys for AI providers
     */
    setApiKeys(keys) {
        aiOrchestrator.setApiKeys(keys);
    }

    /**
     * Get AI provider status
     */
    getStatus() {
        return aiOrchestrator.getStatus();
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

            // Get AI-driven system prompt from PersonalityEngine
            const systemPrompt = await personalityEngine.getSystemPrompt({
                userPrefs: context.userPrefs,
                emotion: context.emotion,
                outfit: context.outfit,
                recentActivity: searchContext
            });

            formattedMessages.push({ role: "system", content: systemPrompt });

            // Add conversation history (last 10 messages for context)
            if (Array.isArray(messages)) {
                const recentMessages = messages.slice(-10);
                recentMessages.forEach(msg => {
                    if (msg.role !== 'system') {
                        formattedMessages.push({
                            role: msg.role,
                            content: msg.content
                        });

                        // Track in personality engine
                        personalityEngine.addToContext(msg.role, msg.content);
                    }
                });
            } else {
                formattedMessages.push({ role: "user", content: messages });
                personalityEngine.addToContext('user', messages);
            }

            // Analyze user mood
            const userMood = personalityEngine.analyzeUserMood(lastUserMsg);

            // Generate response using AI Orchestrator (multi-provider fallback)
            const response = await aiOrchestrator.generateResponse(formattedMessages, {
                temperature: 0.8,
                maxTokens: 512,
                topP: 0.9
            });

            const aiResponse = response.content;

            // Update personality mood
            personalityEngine.updateMood(userMood, aiResponse);

            // Get emotional state
            const emotionalState = personalityEngine.getEmotionalState();

            // Update expression based on emotion
            this.currentExpression = behaviorEngine.updateExpression(emotionalState.mood);

            // Suggest gesture based on response content
            const suggestedGesture = behaviorEngine.suggestGesture(aiResponse, emotionalState.mood);
            behaviorEngine.queueGesture(suggestedGesture);
            this.currentGesture = suggestedGesture;

            // Track conversation for personality evolution
            personalityEngine.addToContext('assistant', aiResponse);

            // Evolve personality based on conversation (every 5 messages)
            if (personalityEngine.getContext().length >= 10) {
                const conversationSummary = personalityEngine.getContext()
                    .map(m => m.content)
                    .join(' ');
                await personalityEngine.evolvePersonality(conversationSummary);
            }

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
                response: "I'm having trouble thinking right now 😅 Can you try again?",
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
