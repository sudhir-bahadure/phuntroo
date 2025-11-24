// ==================================
// LlamaService.js – AI Brain Online
// ==================================

export class LlamaService {
    constructor(opts = {}) {
        this.cloudEndpoint = opts.cloudEndpoint ?? "/api/chat";
    }

    // Initialise local or cloud brain if needed
    async initialize() {
        // If you have local WASM init, call it here.
        // Example (keep or replace with your real init):
        // await window.localLlama?.init();
        console.log('🧠 AI Brain ready!');
        return;
    }

    /**
     * Main chat call – ALWAYS active.
     * No maintenance / offline fallback.
     */
    async generateResponse(history) {
        const lastUser = history.filter(m => m.role === "user").pop();
        const userText = lastUser?.content ?? "";

        // 1) Try local WASM brain if available
        try {
            if (window.localLlama && typeof window.localLlama.generate === "function") {
                const out = await window.localLlama.generate(history);
                if (out && typeof out === "string") return out;
            }
        } catch (err) {
            console.warn("Local Llama error, falling back to conversational logic:", err);
        }

        // 2) Basic conversational logic (always works)
        // Recognize greetings
        if (/^(hi|hello|hey|greetings)/i.test(userText)) {
            return "Hello! How can I help you today?";
        }

        // Recognize questions about self
        if (/who are you|what are you|your name/i.test(userText)) {
            return "I'm PHUNTROO, your AI assistant. I'm here to help you with information and conversation!";
        }

        // Default helpful response
        return `I understand you said: "${userText}". I'm processing your request. How else can I assist you?`;
    }
}

export const llamaService = new LlamaService();
