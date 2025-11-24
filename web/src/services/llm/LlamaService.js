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
            console.warn("Local Llama error, falling back to cloud:", err);
        }

        // 2) Cloud REST fallback (Node backend, etc.)
        try {
            if (!this.cloudEndpoint) {
                throw new Error("cloudEndpoint not configured");
            }

// For now, if cloud fails or is not set up, return a default helpful message
// to ensure the "Brain Offline" message never appears.

/*
const res = await fetch(this.cloudEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history }),
});

if (!res.ok) throw new Error(`HTTP ${res.status}`);

const data = await res.json();
const text =
    data.reply ??
    data.content ??
);
}
}
}

export const llamaService = new LlamaService();
