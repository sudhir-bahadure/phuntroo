// Cloud-based AI Service using Cloudflare Worker proxy
// Zero browser CPU/GPU usage - all AI runs on HuggingFace servers via Cloudflare

class CloudLlamaService {
    constructor() {
        this.conversationHistory = [];
        // Use Cloudflare Worker to avoid CORS issues - 100% free!
        this.apiUrl = 'https://phuntroo-ai-proxy.sudhir1100200426.workers.dev';
    }

    async initialize(onProgress) {
        // No model download needed - it's all in the cloud!
        console.log('☁️ Cloud AI ready (no download needed)');
        if (onProgress) {
            onProgress({ progress: 1.0, text: 'Cloud AI ready!' });
        }
        return true;
    }

    isReady() {
        return true; // Always ready!
    }

    async generateResponse(userMessage, context = {}) {
        try {
            const userName = context.userPrefs?.name || 'friend';

            // Build prompt for Mistral
            const systemPrompt = `You are Phuntroo, ${userName}'s loyal AI friend. You are warm, funny, supportive, and empathetic. Respond naturally as a close friend would. Keep responses concise (2-3 sentences) unless asked for more detail.`;

            const conversationContext = this.conversationHistory.slice(-4).map(msg =>
                `${msg.role === 'user' ? 'User' : 'Phuntroo'}: ${msg.content}`
            ).join('\n');

            const prompt = `${systemPrompt}\n\n${conversationContext}\nUser: ${userMessage}\nPhuntroo:`;

            // Call Cloudflare Worker (which proxies to HuggingFace)
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 250,
                        temperature: 0.8,
                        top_p: 0.9,
                        return_full_text: false
                    }
                })
            });

            if (!response.ok) {
                if (response.status === 503) {
                    return "Give me 20 seconds - my cloud brain is waking up! Try again in a moment. 😊";
                }
                if (response.status === 429) {
                    return "Whoa, too many requests! Give me 30 seconds to catch my breath? 😅";
                }
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            let aiResponse = data[0]?.generated_text || data.generated_text || "I'm having a brain fog moment. Try again?";

            // Clean up response
            aiResponse = aiResponse.trim();

            // Remove any repeated prompt
            if (aiResponse.startsWith('Phuntroo:')) {
                aiResponse = aiResponse.replace('Phuntroo:', '').trim();
            }

            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: aiResponse }
            );

            // Keep last 10 exchanges
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            return aiResponse;

        } catch (error) {
            console.error('☁️ Cloud AI error:', error);
            return "I'm having connection issues with the cloud. Can you try again in a moment?";
        }
    }
}

export const llamaService = new CloudLlamaService();
