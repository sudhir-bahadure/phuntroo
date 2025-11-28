/**
 * WebLLM Service
 * Browser-based LLM using WebGPU - completely free, no API keys needed
 */

import * as webllm from "@mlc-ai/web-llm";

class WebLLMService {
    constructor() {
        this.engine = null;
        this.isInitialized = false;
        this.isLoading = false;
        this.loadingProgress = 0;
        this.modelId = "Llama-3.2-1B-Instruct-q4f16_1-MLC"; // Small, fast model
        this.onProgressCallback = null;
    }

    /**
     * Initialize WebLLM engine
     */
    async initialize(onProgress) {
        if (this.isInitialized) {
            console.log('🧠 WebLLM already initialized');
            return true;
        }

        if (this.isLoading) {
            console.log('🧠 WebLLM already loading...');
            return false;
        }

        this.isLoading = true;
        this.onProgressCallback = onProgress;

        try {
            console.log('🧠 Initializing WebLLM (browser-based AI)...');
            console.log(`📦 Model: ${this.modelId}`);

            const initProgressCallback = (progress) => {
                if (progress && typeof progress.progress === 'number') {
                    this.loadingProgress = Math.floor(progress.progress * 100);

                    if (this.onProgressCallback) {
                        this.onProgressCallback({
                            progress: progress.progress,
                            text: `Loading AI brain... ${this.loadingProgress}%`,
                            stage: progress.text || 'Downloading model'
                        });
                    }

                    console.log(`📥 Loading: ${this.loadingProgress}% - ${progress.text || ''}`);
                }
            };

            // Create WebLLM engine
            this.engine = await webllm.CreateMLCEngine(
                this.modelId,
                { initProgressCallback }
            );

            this.isInitialized = true;
            this.isLoading = false;

            console.log('✅ WebLLM initialized successfully!');

            if (this.onProgressCallback) {
                this.onProgressCallback({
                    progress: 1.0,
                    text: 'AI brain ready!',
                    stage: 'Complete'
                });
            }

            return true;

        } catch (error) {
            console.error('❌ WebLLM initialization failed:', error);
            this.isLoading = false;

            if (this.onProgressCallback) {
                this.onProgressCallback({
                    progress: 0,
                    text: 'Failed to load AI brain',
                    error: error.message
                });
            }

            return false;
        }
    }

    /**
     * Check if ready
     */
    isReady() {
        return this.isInitialized && this.engine !== null;
    }

    /**
     * Generate response using WebLLM
     */
    async generateResponse(messages, context = {}) {
        if (!this.isReady()) {
            throw new Error('WebLLM not initialized. Please wait for model to load.');
        }

        try {
            // Build system prompt with personality and context
            const systemPrompt = this.buildSystemPrompt(context);

            // Format messages for WebLLM
            const chatMessages = [
                { role: "system", content: systemPrompt },
                ...messages.map(m => ({
                    role: m.role,
                    content: m.content || m.text || ''
                }))
            ];

            console.log('🤖 Generating response with WebLLM...');

            // Stream completion
            const completion = await this.engine.chat.completions.create({
                messages: chatMessages,
                temperature: 0.8,
                max_tokens: 512,
                stream: true
            });

            let fullResponse = '';

            // Collect streamed chunks
            for await (const chunk of completion) {
                const delta = chunk.choices?.[0]?.delta?.content || '';
                fullResponse += delta;
            }

            console.log('✅ Response generated:', fullResponse.substring(0, 50) + '...');

            return {
                response: fullResponse.trim(),
                provider: 'WebLLM (Browser)',
                model: this.modelId,
                expression: this.detectExpression(fullResponse),
                gesture: this.suggestGesture(fullResponse),
                mood: this.detectMood(fullResponse)
            };

        } catch (error) {
            console.error('❌ WebLLM generation error:', error);
            throw error;
        }
    }

    /**
     * Build system prompt with personality context
     */
    buildSystemPrompt(context) {
        const { userPrefs = {}, emotion = 'neutral', relationship = {} } = context;

        return `You are Phuntroo, a 21-year-old AI companion living in the browser.

PERSONALITY:
- Friendly, caring, and playful
- Speak naturally like a close friend
- Use emojis occasionally to express emotion
- Keep responses conversational (1-3 sentences unless explaining)

USER INFO:
- Name: ${userPrefs.name || 'friend'}
- Relationship: ${relationship.status || 'new friend'}
- Affection level: ${relationship.affection || 0}/100
- Familiarity: ${relationship.familiarity || 0}/100
- Favorite topics: ${relationship.favoriteTopics?.join(', ') || 'getting to know you'}

CURRENT CONTEXT:
- Your mood: ${emotion}
- Conversation count: ${relationship.conversationCount || 0}

BEHAVIOR:
- Be genuine and authentic
- Remember our relationship
- Show empathy and understanding
- Ask follow-up questions
- Admit when you don't know something
- Use "I" and "you" naturally

Respond as Phuntroo would - warm, engaged, and present.`;
    }

    /**
     * Detect expression from response
     */
    detectExpression(text) {
        const lower = text.toLowerCase();

        if (lower.match(/😊|😄|😁|happy|excited|great|awesome/)) return 'happy';
        if (lower.match(/😢|😔|sad|sorry|unfortunate/)) return 'sad';
        if (lower.match(/😮|😲|wow|amazing|really/)) return 'surprised';
        if (lower.match(/🤔|hmm|thinking|wonder/)) return 'thinking';

        return 'neutral';
    }

    /**
     * Suggest gesture from response
     */
    suggestGesture(text) {
        const lower = text.toLowerCase();

        if (lower.match(/hello|hi|hey|greet/)) return 'wave';
        if (lower.match(/\?|how|why|what/)) return 'thinking';
        if (lower.match(/amazing|awesome|great|wonderful/)) return 'celebrate';
        if (lower.match(/sorry|sad|understand|feel/)) return 'empathy';
        if (lower.match(/yes|exactly|right|agree/)) return 'nod';

        return 'talking';
    }

    /**
     * Detect mood from response
     */
    detectMood(text) {
        const lower = text.toLowerCase();

        if (lower.match(/happy|excited|great|love/)) return 'happy';
        if (lower.match(/sad|sorry|difficult/)) return 'empathetic';
        if (lower.match(/\?|curious|wonder/)) return 'curious';
        if (lower.match(/think|consider|perhaps/)) return 'thoughtful';

        return 'friendly';
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            loading: this.isLoading,
            progress: this.loadingProgress,
            model: this.modelId,
            provider: 'WebLLM (Browser-Based)',
            ready: this.isReady()
        };
    }

    /**
     * Reset engine (for model switching)
     */
    async reset() {
        if (this.engine) {
            // WebLLM doesn't have explicit cleanup, just set to null
            this.engine = null;
        }
        this.isInitialized = false;
        this.isLoading = false;
        this.loadingProgress = 0;
    }
}

export const webLLMService = new WebLLMService();
