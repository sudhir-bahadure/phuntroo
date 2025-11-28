/**
 * AI Orchestrator
 * Intelligent routing between multiple AI providers with automatic fallback
 */

import { groqProvider } from './providers/GroqProvider';
import { togetherProvider } from './providers/TogetherProvider';
import { huggingFaceProvider } from './providers/HuggingFaceProvider';

class AIOrchestrator {
    constructor() {
        this.providers = [
            groqProvider,      // Primary (fastest)
            togetherProvider,  // Fallback 1 (good quality)
            huggingFaceProvider // Fallback 2 (always available)
        ];
        this.currentProvider = null;
        this.failureCount = {};
    }

    /**
     * Set API keys for providers
     */
    setApiKeys(keys) {
        if (keys.groq) groqProvider.setApiKey(keys.groq);
        if (keys.together) togetherProvider.setApiKey(keys.together);
        if (keys.huggingFace) huggingFaceProvider.setApiKey(keys.huggingFace);
    }

    /**
     * Get available providers
     */
    getAvailableProviders() {
        return this.providers.filter(p => p.isAvailable());
    }

    /**
     * Select best provider based on availability and failure rate
     */
    selectProvider() {
        const available = this.getAvailableProviders();

        if (available.length === 0) {
            throw new Error('No AI providers available. Please set API keys.');
        }

        // Sort by failure count (ascending)
        available.sort((a, b) => {
            const aFailures = this.failureCount[a.name] || 0;
            const bFailures = this.failureCount[b.name] || 0;
            return aFailures - bFailures;
        });

        return available[0];
    }

    /**
     * Generate response with automatic fallback
     */
    async generateResponse(messages, options = {}) {
        const maxRetries = this.providers.length;
        let lastError = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const provider = this.selectProvider();
                console.log(`🤖 Using AI provider: ${provider.name}`);

                const response = await provider.generateResponse(messages, options);

                // Success! Reset failure count for this provider
                this.failureCount[provider.name] = 0;
                this.currentProvider = provider.name;

                return response;

            } catch (error) {
                lastError = error;
                const providerName = this.currentProvider || 'unknown';

                // Increment failure count
                this.failureCount[providerName] = (this.failureCount[providerName] || 0) + 1;

                console.warn(`⚠️ Provider ${providerName} failed (attempt ${attempt + 1}/${maxRetries}):`, error.message);

                // If this was the last provider, throw error
                if (attempt === maxRetries - 1) {
                    throw new Error(`All AI providers failed. Last error: ${lastError.message}`);
                }

                // Otherwise, continue to next provider
                continue;
            }
        }

        throw lastError;
    }

    /**
     * Get current provider status
     */
    getStatus() {
        const available = this.getAvailableProviders();
        return {
            currentProvider: this.currentProvider,
            availableProviders: available.map(p => p.name),
            failureCount: this.failureCount,
            totalProviders: this.providers.length
        };
    }

    /**
     * Reset failure counts
     */
    resetFailures() {
        this.failureCount = {};
    }
}

export const aiOrchestrator = new AIOrchestrator();
