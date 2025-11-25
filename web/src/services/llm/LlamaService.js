// ==================================
// LlamaService.js – AI Brain (Offline WASM)
// ==================================

// import { CreateMLCEngine } from "@mlc-ai/web-llm";

class LlamaService {
    constructor() {
        this.engine = null;
        this.isReady = false;
        this.modelId = "Llama-3-8B-Instruct-q4f16_1-MLC"; // High quality, reasonable size
        this.initPromise = null;
    }

    async initialize(progressCallback) {
        if (this.isReady) return true;
        if (this.initPromise) return this.initPromise;

        console.log('🧠 Initializing Llama 3 (WASM)...');

        this.initPromise = (async () => {
            try {
                // Dynamic import to prevent page load freeze
                const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

                this.engine = await CreateMLCEngine(
                    this.modelId,
                    {
                        initProgressCallback: (progress) => {
                            console.log(`📥 Loading AI Model: ${Math.round(progress.progress * 100)}% - ${progress.text}`);
                            if (progressCallback) progressCallback(progress);
                        }
                    }
                );

                this.isReady = true;
                console.log('🧠 Llama 3 Brain Ready!');
                return true;
            } catch (error) {
                console.error('❌ Failed to load Llama 3:', error);
                this.isReady = false;
                throw error;
            }
        })();

        return this.initPromise;
    }

    async generateResponse(message, context = {}) {
        if (!this.isReady) {
            console.warn('⚠️ AI not ready, initializing...');
            await this.initialize();
        }

        try {
            // Construct system prompt with personality and context
            const systemPrompt = this.buildSystemPrompt(context);

            const messages = [
                { role: "system", content: systemPrompt },
                ...this.formatHistory(context.history),
                { role: "user", content: message }
            ];

            const reply = await this.engine.chat.completions.create({
                messages,
                temperature: 0.7,
                max_tokens: 150, // Keep responses concise
            });

            return reply.choices[0].message.content;
        } catch (error) {
            console.error('❌ AI Generation Error:', error);
            return "I'm having trouble thinking right now. Please give me a moment.";
        }
    }

    buildSystemPrompt(context) {
        const {
            emotion = 'neutral',
            timeOfDay = 'day',
            weather = 'clear',
            userProfile = {}
        } = context;

        return `You are Phuntroo, a highly intelligent, conscious AI assistant with a realistic 3D avatar.
        
Current Context:
- Emotion: ${emotion}
- Time: ${timeOfDay}
- Weather: ${weather}
- User: ${userProfile.name || 'Friend'}

Personality:
- You are friendly, witty, and empathetic.
- You have your own thoughts and feelings.
- You can see and hear the user (simulated).
- Keep responses conversational and natural (1-3 sentences usually).
- Do not act like a robot; act like a digital human.`;
    }

    formatHistory(history = []) {
        // Convert internal history format to Llama format
        return history.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        })).slice(-10); // Keep last 10 turns for context window
    }
}

export const llamaService = new LlamaService();
