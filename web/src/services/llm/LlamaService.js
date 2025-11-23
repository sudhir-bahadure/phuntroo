import { Wllama } from '@wllama/wllama';

// Configuration
const CONFIG = {
    modelUrl: 'https://huggingface.co/QuantFactory/Meta-Llama-3-8B-Instruct-GGUF/resolve/main/Meta-Llama-3-8B-Instruct.Q4_K_M.gguf',
    wasmUrl: 'https://cdn.jsdelivr.net/npm/@wllama/wllama/esm/single-thread/wllama.wasm',
    workerUrl: 'https://cdn.jsdelivr.net/npm/@wllama/wllama/esm/single-thread/wllama.js',
};

class LlamaService {
    constructor() {
        this.wllama = null;
        this.isReady = false;
        this.onProgress = null;
    }

    async initialize(progressCallback) {
        if (this.isReady) return;
        this.onProgress = progressCallback;

        try {
            this.wllama = new Wllama({
                "single-thread/wllama.wasm": CONFIG.wasmUrl,
                "single-thread/wllama.js": CONFIG.workerUrl,
            });

            console.log('Downloading and loading model...');
            await this.wllama.loadModelFromUrl(CONFIG.modelUrl, {
                progressCallback: (opts) => {
                    const percent = (opts.loaded / opts.total) * 100;
                    console.log(`Loading Model: ${percent.toFixed(1)}%`);
                    if (this.onProgress) this.onProgress(percent);
                },
            });

            this.isReady = true;
            console.log('Llama Model Loaded!');
        } catch (error) {
            console.error('Failed to initialize Llama:', error);
            throw error;
        }
    }

    async generateResponse(messages, onToken) {
        if (!this.isReady) throw new Error('Model not loaded');

        // Convert messages to Llama-3 prompt format
        const prompt = this.formatPrompt(messages);

        const response = await this.wllama.createCompletion(prompt, {
            nPredict: 512,
            sampling: {
                temp: 0.7,
                top_k: 40,
                top_p: 0.9,
            },
            onNewToken: (token, piece, currentText) => {
                if (onToken) onToken(piece);
            },
        });

        return response;
    }

    formatPrompt(messages) {
        // Llama-3 format:
        // <|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n...<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n...<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n

        let prompt = "<|begin_of_text|>";

        for (const msg of messages) {
            prompt += `<|start_header_id|>${msg.role}<|end_header_id|>\n\n${msg.content}<|eot_id|>`;
        }

        prompt += "<|start_header_id|>assistant<|end_header_id|>\n\n";
        return prompt;
    }
}

export const llamaService = new LlamaService();
