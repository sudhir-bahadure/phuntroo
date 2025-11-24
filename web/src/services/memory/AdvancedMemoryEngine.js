/**
 * Advanced Memory Engine - Gives AI true memory and context awareness
 * Stores episodic, semantic, and emotional memories
 */

class AdvancedMemoryEngine {
    constructor() {
        this.dbName = 'PhuntrooMemory';
        this.db = null;
        this.userProfile = this.loadUserProfile();
        this.emotionalContext = {};
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 11);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('🧠 Advanced Memory Engine initialized');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const oldVersion = event.oldVersion;

                console.log(`🔄 Upgrading DB from v${oldVersion} to v11`);

                // Episodic memory: specific conversations
                if (!db.objectStoreNames.contains('conversations')) {
                    const convStore = db.createObjectStore('conversations', { keyPath: 'id', autoIncrement: true });
                    convStore.createIndex('timestamp', 'timestamp', { unique: false });
                    convStore.createIndex('emotion', 'emotion', { unique: false });
                }

                // Semantic memory: facts and concepts
                if (!db.objectStoreNames.contains('knowledge')) {
                    const knowStore = db.createObjectStore('knowledge', { keyPath: 'id', autoIncrement: true });
                    knowStore.createIndex('topic', 'topic', { unique: false });
                }

                // User profile: what she knows about you
                if (!db.objectStoreNames.contains('userProfile')) {
                    db.createObjectStore('userProfile', { keyPath: 'key' });
                }

                // Emotional memories: how topics make her "feel"
                if (!db.objectStoreNames.contains('emotions')) {
                    const emotStore = db.createObjectStore('emotions', { keyPath: 'topic' });
                }
            };
        });
    }

    // Store a conversation with full context
    async storeConversation(userMessage, aiResponse, emotion, context = {}) {
        const conversation = {
            userMessage,
            aiResponse,
            emotion,
            timestamp: new Date().toISOString(),
            context: {
                ...context,
                timeOfDay: this.getTimeOfDay(),
                dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
            }
        };

        const transaction = this.db.transaction(['conversations'], 'readwrite');
        const store = transaction.objectStore('conversations');
        await store.add(conversation);

        // Update emotional context
        this.updateEmotionalContext(userMessage, emotion);

        // Extract and store knowledge
        await this.extractKnowledge(userMessage, aiResponse);

        return conversation;
    }

    // Recall similar conversations (semantic search)
    async recallSimilar(query, limit = 5) {
        const transaction = this.db.transaction(['conversations'], 'readonly');
        const store = transaction.objectStore('conversations');
        const allConversations = await this.getAllFromStore(store);

        // Simple keyword matching (can be upgraded to vector search)
        const queryWords = query.toLowerCase().split(' ');
        const scored = allConversations.map(conv => {
            const text = (conv.userMessage + ' ' + conv.aiResponse).toLowerCase();
            const score = queryWords.reduce((acc, word) => {
                return acc + (text.includes(word) ? 1 : 0);
            }, 0);
            return { ...conv, score };
        });

        return scored
            .filter(c => c.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // Get recent conversations
    async getRecentConversations(limit = 10) {
        const transaction = this.db.transaction(['conversations'], 'readonly');
        const store = transaction.objectStore('conversations');
        const index = store.index('timestamp');

        const allConversations = await this.getAllFromStore(store);
        return allConversations
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    // Extract knowledge from conversation
    async extractKnowledge(userMessage, aiResponse) {
        // Extract facts about user (simple pattern matching)
        const patterns = [
            { regex: /my name is (\w+)/i, type: 'name' },
            { regex: /i (like|love|enjoy) (.+)/i, type: 'preference' },
            { regex: /i (work|study) (.+)/i, type: 'occupation' },
            { regex: /i live in (.+)/i, type: 'location' },
            { regex: /my (.+) is (.+)/i, type: 'attribute' }
        ];

        for (const pattern of patterns) {
            const match = userMessage.match(pattern.regex);
            if (match) {
                await this.storeKnowledge({
                    topic: pattern.type,
                    content: match[0],
                    extracted: match[1] || match[2],
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    async storeKnowledge(knowledge) {
        const transaction = this.db.transaction(['knowledge'], 'readwrite');
        const store = transaction.objectStore('knowledge');
        await store.add(knowledge);
    }

    // Update emotional context for topics
    updateEmotionalContext(message, emotion) {
        const words = message.toLowerCase().split(' ');
        words.forEach(word => {
            if (word.length > 4) { // Only significant words
                if (!this.emotionalContext[word]) {
                    this.emotionalContext[word] = { [emotion]: 1 };
                } else {
                    this.emotionalContext[word][emotion] = (this.emotionalContext[word][emotion] || 0) + 1;
                }
            }
        });
    }

    // Get emotional association with a topic
    getEmotionalAssociation(topic) {
        const words = topic.toLowerCase().split(' ');
        const emotions = {};

        words.forEach(word => {
            if (this.emotionalContext[word]) {
                Object.entries(this.emotionalContext[word]).forEach(([emotion, count]) => {
                    emotions[emotion] = (emotions[emotion] || 0) + count;
                });
            }
        });

        // Return dominant emotion
        const sorted = Object.entries(emotions).sort((a, b) => b[1] - a[1]);
        return sorted[0] ? sorted[0][0] : 'neutral';
    }

    // Build and maintain user profile
    loadUserProfile() {
        const stored = localStorage.getItem('phuntroo_user_profile');
        return stored ? JSON.parse(stored) : {
            name: null,
            preferences: [],
            interests: [],
            conversationCount: 0,
            relationshipLevel: 0, // 0-100
            lastInteraction: null,
            personality: {
                formality: 50, // How formal/casual to be
                humor: 50,     // How much humor to use
                empathy: 50    // How empathetic to be
            }
        };
    }

    saveUserProfile() {
        localStorage.setItem('phuntroo_user_profile', JSON.stringify(this.userProfile));
    }

    updateUserProfile(updates) {
        this.userProfile = { ...this.userProfile, ...updates };
        this.userProfile.lastInteraction = new Date().toISOString();
        this.userProfile.conversationCount++;

        // Increase relationship level gradually
        this.userProfile.relationshipLevel = Math.min(100, this.userProfile.relationshipLevel + 0.5);

        this.saveUserProfile();
    }

    getUserProfile() {
        return this.userProfile;
    }

    // Helper: Get time of day context
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return 'late night';
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 21) return 'evening';
        return 'night';
    }

    // Helper: Get all items from store
    getAllFromStore(store) {
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get conversation summary for context
    async getConversationContext(limit = 5) {
        const recent = await this.getRecentConversations(limit);
        return recent.map(c => ({
            user: c.userMessage,
            ai: c.aiResponse,
            emotion: c.emotion,
            time: c.context?.timeOfDay
        }));
    }

    // Clear old memories (privacy feature)
    async clearOldMemories(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const transaction = this.db.transaction(['conversations'], 'readwrite');
        const store = transaction.objectStore('conversations');
        const index = store.index('timestamp');

        const range = IDBKeyRange.upperBound(cutoffDate.toISOString());
        const request = index.openCursor(range);

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };
    }
}

export const advancedMemory = new AdvancedMemoryEngine();
