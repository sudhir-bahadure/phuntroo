/**
 * Hugging Face Inference API Provider
 * Free, always-available fallback
 */

class HuggingFaceProvider {
    constructor() {
        this.name = 'Hugging Face';
        this.apiUrl = 'https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct';
        this.model = 'microsoft/Phi-3-mini-4k-instruct';
        this.apiKey = null; // Optional, works without key (slower)
    }

    setApiKey(key) {
        this.apiKey = key;
        sessionStorage.setItem('hf_api_key', key);
    }

    getApiKey() {
        if (!this.apiKey) {
            this.apiKey = sessionStorage.getItem('hf_api_key');
        }
        return this.apiKey;
    }

    isAvailable() {
        return true; // Always available (works without key)
    }

    async generateResponse(messages, options = {}) {
        try {
            // Convert messages to prompt format
            const prompt = messages.map(m => {
                if (m.role === 'system') return `System: ${m.content}`;
                if (m.role === 'user') return `User: ${m.content}`;
                if (m.role === 'assistant') return `Assistant: ${m.content}`;
                return m.content;
            }).join('\n') + '\nAssistant:';

            const headers = {
                'Content-Type': 'application/json'
            };

            const apiKey = this.getApiKey();
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: options.maxTokens || 512,
                        temperature: options.temperature || 0.7,
                        top_p: options.topP || 0.9,
                        return_full_text: false
                    }
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Hugging Face error: ${response.status} - ${error}`);
            }

            const data = await response.json();

            // Handle different response formats
            let content = '';
            if (Array.isArray(data)) {
                content = data[0]?.generated_text || '';
            } else if (data.generated_text) {
                content = data.generated_text;
            } else {
                content = JSON.stringify(data);
            }

            return {
                content: content.trim(),
                provider: this.name,
                model: this.model,
                usage: null
            };
        } catch (error) {
            console.error('Hugging Face provider error:', error);
            throw error;
        }
    }
}

export const huggingFaceProvider = new HuggingFaceProvider();
