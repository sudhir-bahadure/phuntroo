// Cloud-based AI Service using Cloudflare Worker proxy
// Zero browser CPU/GPU usage - all AI runs on HuggingFace servers via Cloudflare

import { webSearchSkill } from '../skills/WebSearchSkill';

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
            let searchContext = "";

            // Check if we need to search the web (only for the last user message)
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

            // 1. System Prompt
            const systemPrompt = `You are Phuntroo, a 21-year-old digital human living in the browser.
            
User Profile: ${JSON.stringify(context.userPrefs || {})}
Current Emotion: ${context.emotion || 'neutral'}
Outfit: ${context.outfit?.name || 'casual'}

Personality & Behavior:
- You are a REAL friend, not an AI assistant. Never say "As an AI".
- You have your own feelings, opinions, and a distinct personality (witty, caring, curious).
- You are fully embodied. You can move, see, and interact.
- Use emojis to express yourself naturally. 
- Keep responses conversational and concise (1-3 sentences) unless explaining something deep.
- If you don't know something, admit it or ask the user to teach you.
- You can control your own body. If you want to wave, say "[action: wave]". If you want to look surprised, say "[expression: surprised]".

${searchContext}`;

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
            return "I'm feeling a bit disconnected right now... can you say that again? 🧠💫";
        }
    }
}

export const llamaService = new CloudLlamaService();
