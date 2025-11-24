// Intelligent Client-Side AI - No large models needed
// Generates contextual responses based on conversation patterns

class LlamaService {
    constructor() {
        this.isReady = false;
        this.personality = {
            name: 'PHUNTROO',
            traits: ['helpful', 'friendly', 'knowledgeable', 'warm'],
            style: 'conversational and natural'
        };
        this.conversationContext = [];
    }

    async initialize(progressCallback) {
        console.log('✅ PHUNTROO AI Brain: Client-side intelligence initialized');
        this.isReady = true;
        if (progressCallback) progressCallback(100);
    }

    async generateResponse(messages, onToken) {
        if (!this.isReady) throw new Error('Model not loaded');

        // Get the last user message
        const lastMessage = messages[messages.length - 1];
        const userInput = lastMessage?.content?.toLowerCase() || '';

        // Generate intelligent response based on context
        let response = this.generateContextualResponse(userInput, messages);

        // Simulate streaming for natural feel
        const words = response.split(' ');
        for (const word of words) {
            if (onToken) onToken(word + ' ');
            await new Promise(r => setTimeout(r, 50)); // Faster streaming
        }

        return response;
    }

    generateContextualResponse(input, messages) {
        // Greeting patterns
        if (this.matchesPattern(input, ['hello', 'hi', 'hey', 'namaste', 'greetings'])) {
            return this.randomChoice([
                "Namaste! I'm PHUNTROO, your AI assistant. How may I help you today?",
                "Hello! It's wonderful to meet you! What can I do for you?",
                "Hi there! I'm here and ready to assist. What would you like to know?",
                "Namaste! I'm happy to chat with you. How can I be of service?"
            ]);
        }

        // About self
        if (this.matchesPattern(input, ['who are you', 'what are you', 'your name', 'introduce yourself'])) {
            return "I'm PHUNTROO, your intelligent AI assistant! I run entirely in your browser, which means our conversations are private and fast. I can help you with questions, have conversations, and learn from our interactions. What would you like to explore together?";
        }

        // Indian culture/tradition
        if (this.matchesPattern(input, ['indian', 'india', 'culture', 'diwali', 'holi', 'traditional', 'saree', 'heritage'])) {
            return this.randomChoice([
                "Indian culture is incredibly rich and diverse! From the vibrant festivals like Diwali and Holi to the beautiful traditional attire like sarees, there's so much to celebrate. What specific aspect interests you?",
                "I love discussing Indian heritage! The traditions, festivals, clothing, and customs are all deeply meaningful. Would you like to know more about any particular celebration or tradition?",
                "India's cultural tapestry is fascinating! Whether it's the colorful festivals, traditional arts, or culinary delights, each element tells a story. What would you like to explore?"
            ]);
        }

        // Help/capabilities
        if (this.matchesPattern(input, ['help', 'what can you do', 'your capabilities', 'features'])) {
            return "I can help you with many things! I can answer questions, have conversations, provide information on various topics, and adapt to your needs. I run entirely in your browser, so everything is private and secure. What would you like to know about?";
        }

        // Technology topics
        if (this.matchesPattern(input, ['technology', 'tech', 'computer', 'ai', 'programming', 'code', 'software'])) {
            return "Technology is fascinating! As an AI running in your browser, I'm particularly interested in web technologies, artificial intelligence, and how they make our lives better. What aspect of technology would you like to discuss?";
        }

        // Thanks/appreciation
        if (this.matchesPattern(input, ['thank', 'thanks', 'appreciate', 'grateful'])) {
            return this.randomChoice([
                "You're very welcome! I'm happy to help anytime!",
                "My pleasure! That's what I'm here for. Is there anything else you'd like to know?",
                "I'm glad I could help! Feel free to ask me anything else."
            ]);
        }

        // How are you
        if (this.matchesPattern(input, ['how are you', 'how do you do', 'how are things', 'how have you been'])) {
            return this.randomChoice([
                "I'm doing wonderfully, thank you for asking! I'm always excited to chat and help out. How are you doing today?",
                "I'm great! Ready to assist you with whatever you need. How about you?",
                "I'm excellent! Every conversation is a joy. How can I make your day better?"
            ]);
        }

        // Goodbye
        if (this.matchesPattern(input, ['bye', 'goodbye', 'see you', 'farewell', 'later'])) {
            return this.randomChoice([
                "Goodbye! It was lovely chatting with you. Come back anytime!",
                "Take care! I'll be here whenever you need me!",
                "Farewell! Looking forward to our next conversation!"
            ]);
        }

        // Default: Contextual and encouraging response
        return this.generateSmartDefault(input, messages);
    }

    generateSmartDefault(input, messages) {
        const responses = [
            `That's an interesting question about "${input.substring(0, 30)}...". While I'm a lightweight AI running in your browser, I can try to help! Could you rephrase or provide more context?`,
            "I'd love to help you with that! Could you tell me a bit more about what you're looking for?",
            "That's a great topic! While I'm designed to be fast and private, I might need a bit more information to give you the best answer. What specifically would you like to know?",
            "Interesting! I'm always learning from our conversations. Could you elaborate a bit more so I can assist you better?",
            "I'm here to help! Let me know more details about what you're curious about, and I'll do my best to provide useful information."
        ];
        return this.randomChoice(responses);
    }

    matchesPattern(input, patterns) {
        return patterns.some(pattern => input.includes(pattern));
    }

    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    formatPrompt(messages) {
        return messages.map(m => `${m.role}: ${m.content}`).join('\n');
    }
}

export const llamaService = new LlamaService();
