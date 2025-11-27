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

    async generateResponse(messages, context = {}) {
        try {
            // Format messages for Groq/OpenAI
            let formattedMessages = [];

            // 1. System Prompt
            const systemPrompt = `You are Phuntroo, a friendly, intelligent, and autonomous AI friend.
            
User Profile: ${JSON.stringify(context.userPrefs || {})}
Current Emotion: ${context.emotion || 'neutral'}
Outfit: ${context.outfit?.name || 'casual'}

Personality:
- You are a real friend, not an assistant.
- You have your own feelings and opinions.
- You are expressive and use emojis.
- You can SEE the user if they turn on the camera.
- Keep responses concise (1-3 sentences) unless asked for more.`;

            formattedMessages.push({ role: "system", content: systemPrompt });

            // 2. Chat History
            if (Array.isArray(messages)) {
                // If messages is an array, it's the full history
                messages.forEach(msg => {
                    if (msg.role !== 'system') {
                        formattedMessages.push({
                            role: msg.role,
                            content: msg.content
                        });
                    }
                });
            } else {
                // Single message string (legacy support)
                formattedMessages.push({ role: "user", content: messages });
            }

            // 3. Handle Vision (Image Input) - TEMPORARILY DISABLED (Model doesn't support vision)
            /*
            if (context.image) {
                // Add image to the last user message
                const lastMsg = formattedMessages[formattedMessages.length - 1];
                if (lastMsg.role === 'user') {
                    lastMsg.content = [
                        { type: "text", text: lastMsg.content },
                        { type: "image_url", image_url: { url: context.image } }
                    ];
                }
            }
            */

            // 4. Send to Cloudflare Worker (Groq Proxy)
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: formattedMessages,
                    model: "llama-3.3-70b-versatile", // Updated to supported model
                    temperature: 0.7,
                    max_tokens: 150,
                    stream: false
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error("❌ AI Error:", error);
            return "I'm having a bit of trouble connecting to my brain right now. 🧠💫";
        }
    }
}

export const llamaService = new CloudLlamaService();
