/**
 * Groq AI Provider
 * Fast inference with Llama models
 */

class GroqProvider {
    constructor() {
        this.name = 'Groq';
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        this.model = 'llama-3.3-70b-versatile';
        this.apiKey = null;
    }

    setApiKey(key) {
        this.apiKey = key;
        sessionStorage.setItem('groq_api_key', key);
    }

    getApiKey() {
        if (!this.apiKey) {
            this.apiKey = sessionStorage.getItem('groq_api_key');
        }
        return this.apiKey;
    }

    isAvailable() {
        return !!this.getApiKey();
    }

    async generateResponse(messages, options = {}) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('Groq API key not set');
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 1024,
                    top_p: options.topP || 0.9
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Groq API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            return {
                content: data.choices[0].message.content,
                provider: this.name,
                model: this.model,
                usage: data.usage
            };
        } catch (error) {
            console.error('Groq provider error:', error);
            throw error;
        }
    }
}

export const groqProvider = new GroqProvider();
