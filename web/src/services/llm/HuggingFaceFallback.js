/**
 * Hugging Face Inference API Fallback
 * Free tier - works when WebGPU is not available
 */

class HuggingFaceFallback {
    constructor() {
        this.apiUrl = 'https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct';
        this.isReady = true; // Always ready, no initialization needed
    }

    async generateResponse(messages, context = {}) {
        try {
            // Build prompt from messages
            const lastMessage = messages[messages.length - 1];
            const userMessage = lastMessage.content || lastMessage.text || '';

            // Simple prompt
            const prompt = `You are Phuntroo, a friendly AI companion. Respond naturally and warmly.\n\nUser: ${userMessage}\nPhuntroo:`;

            console.log('🤖 Using Hugging Face fallback API...');

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 200,
                        temperature: 0.7,
                        return_full_text: false
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HuggingFace API error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data[0]?.generated_text || data.generated_text || "I'm having trouble thinking right now. Can you try again?";

            console.log('✅ Fallback response generated');

            return {
                response: aiResponse.trim(),
                provider: 'Hugging Face (Fallback)',
                model: 'Phi-3-mini',
                expression: 'neutral',
                gesture: 'talking',
                mood: 'friendly'
            };

        } catch (error) {
            console.error('❌ Hugging Face fallback error:', error);

            // Ultimate fallback
            return {
                response: "I'm having some technical difficulties 😅 My brain is still waking up. Can you try again in a moment?",
                provider: 'Static Fallback',
                expression: 'neutral',
                gesture: null,
                mood: 'neutral'
            };
        }
    }
}

export const huggingFaceFallback = new HuggingFaceFallback();
