import Dexie from 'dexie';

// Initialize IndexedDB
const db = new Dexie('PhuntrooMemory');

db.version(1).stores({
    conversations: '++id, timestamp, userMessage, aiResponse, embedding, context, engagement',
    personality: 'id, traits, preferences, knowledge, lastUpdated',
    learnings: '++id, type, data, timestamp'
});

class MemoryService {
    constructor() {
        this.db = db;
    }

    /**
     * Store a conversation with context
     */
    async storeConversation(userMessage, aiResponse, context = {}) {
        try {
            const memory = {
                timestamp: new Date().toISOString(),
                userMessage,
                aiResponse,
                embedding: null, // Will be added by VectorDB
                context: {
                    outfit: context.outfit || null,
                    emotion: context.emotion || 'neutral',
                    topics: context.topics || [],
                    ...context
                },
                engagement: {
                    responseTime: context.responseTime || 0,
                    followUpCount: 0
                }
            };

            const id = await this.db.conversations.add(memory);
            return id;
        } catch (error) {
            console.error('Failed to store conversation:', error);
            return null;
        }
    }

    /**
     * Get recent conversations
     */
    async getRecentConversations(limit = 10) {
        try {
            return await this.db.conversations
                .orderBy('timestamp')
                .reverse()
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Failed to get conversations:', error);
            return [];
        }
    }

    /**
     * Get all conversations
     */
    async getAllConversations() {
        try {
            return await this.db.conversations.toArray();
        } catch (error) {
            console.error('Failed to get all conversations:', error);
            return [];
        }
    }

    /**
     * Update conversation embedding
     */
    async updateEmbedding(id, embedding) {
        try {
            await this.db.conversations.update(id, { embedding });
        } catch (error) {
            console.error('Failed to update embedding:', error);
        }
    }

    /**
     * Get personality state
     */
    async getPersonality() {
        try {
            const personality = await this.db.personality.get(1);
            if (!personality) {
                // Initialize default personality
                const defaultPersonality = {
                    id: 1,
                    traits: {
                        humor: 0.5,
                        formality: 0.3,
                        curiosity: 0.8,
                        empathy: 0.7
                    },
                    preferences: {
                        favoriteTopics: [],
                        communicationStyle: 'casual',
                        outfitPreferences: {}
                    },
                    knowledge: {},
                    lastUpdated: new Date().toISOString()
                };
                await this.db.personality.add(defaultPersonality);
                return defaultPersonality;
            }
            return personality;
        } catch (error) {
            console.error('Failed to get personality:', error);
            return null;
        }
    }

    /**
     * Update personality
     */
    async updatePersonality(updates) {
        try {
            const current = await this.getPersonality();
            await this.db.personality.update(1, {
                ...current,
                ...updates,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to update personality:', error);
        }
    }

    /**
     * Store a learning
     */
    async storeLearning(type, data) {
        try {
            await this.db.learnings.add({
                type,
                data,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to store learning:', error);
        }
    }

    /**
     * Get conversation statistics
     */
    async getStats() {
        try {
            const total = await this.db.conversations.count();
            const conversations = await this.getAllConversations();

            const topics = {};
            const outfits = {};

            conversations.forEach(conv => {
                // Count topics
                conv.context.topics?.forEach(topic => {
                    topics[topic] = (topics[topic] || 0) + 1;
                });

                // Count outfits
                if (conv.context.outfit) {
                    outfits[conv.context.outfit] = (outfits[conv.context.outfit] || 0) + 1;
                }
            });

            return {
                totalConversations: total,
                topicDistribution: topics,
                outfitUsage: outfits,
                firstConversation: conversations[0]?.timestamp,
                lastConversation: conversations[conversations.length - 1]?.timestamp
            };
        } catch (error) {
            console.error('Failed to get stats:', error);
            return null;
        }
    }
}

export const memoryService = new MemoryService();
