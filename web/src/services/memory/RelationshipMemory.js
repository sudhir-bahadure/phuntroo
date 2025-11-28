/**
 * Relationship Memory System
 * Tracks conversation history, builds affection, remembers preferences
 */

import { memoryService } from '../memory/MemoryService';

class RelationshipMemory {
    constructor() {
        this.conversationHistory = [];
        this.affectionLevel = 0; // 0-100
        this.familiarityLevel = 0; // 0-100
        this.userPreferences = {
            topics: [],
            mood: 'neutral',
            communicationStyle: 'casual'
        };
        this.sharedMoments = [];
        this.lastInteraction = null;
    }

    /**
     * Initialize from stored memory
     */
    async initialize() {
        try {
            const stored = await memoryService.getPersonality();
            if (stored.relationship) {
                this.affectionLevel = stored.relationship.affection || 0;
                this.familiarityLevel = stored.relationship.familiarity || 0;
                this.userPreferences = stored.relationship.preferences || this.userPreferences;
                this.sharedMoments = stored.relationship.moments || [];
                this.lastInteraction = stored.relationship.lastInteraction;
            }
        } catch (error) {
            console.warn('Failed to load relationship memory:', error);
        }
    }

    /**
     * Add conversation to history
     */
    addConversation(userMessage, aiResponse, emotion) {
        const conversation = {
            timestamp: new Date().toISOString(),
            user: userMessage,
            ai: aiResponse,
            emotion: emotion
        };

        this.conversationHistory.push(conversation);

        // Keep only last 50 conversations
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }

        // Update familiarity
        this.familiarityLevel = Math.min(100, this.familiarityLevel + 0.5);

        // Analyze for preferences
        this.analyzePreferences(userMessage);

        // Check for shared moments
        this.detectSharedMoment(conversation);

        this.lastInteraction = new Date().toISOString();
    }

    /**
     * Analyze user preferences from message
     */
    analyzePreferences(message) {
        const lowerMsg = message.toLowerCase();

        // Topic detection
        const topics = {
            'music': /music|song|artist|album|concert/,
            'movies': /movie|film|cinema|watch/,
            'food': /food|eat|cook|restaurant|recipe/,
            'tech': /tech|computer|code|program|ai/,
            'sports': /sport|game|play|team|match/,
            'travel': /travel|trip|visit|vacation|country/,
            'art': /art|paint|draw|creative|design/,
            'books': /book|read|story|novel|author/
        };

        Object.entries(topics).forEach(([topic, pattern]) => {
            if (pattern.test(lowerMsg)) {
                if (!this.userPreferences.topics.includes(topic)) {
                    this.userPreferences.topics.push(topic);
                }
            }
        });

        // Keep only top 10 topics
        if (this.userPreferences.topics.length > 10) {
            this.userPreferences.topics = this.userPreferences.topics.slice(-10);
        }
    }

    /**
     * Detect shared moments (memorable interactions)
     */
    detectSharedMoment(conversation) {
        const msg = conversation.user.toLowerCase();

        // Detect significant moments
        const momentPatterns = {
            'celebration': /birthday|anniversary|graduation|promotion|celebrate/,
            'support': /sad|difficult|tough|hard time|struggle/,
            'joy': /happy|excited|amazing|wonderful|love/,
            'learning': /learn|teach|explain|understand|know/,
            'humor': /funny|laugh|joke|hilarious|haha/
        };

        Object.entries(momentPatterns).forEach(([type, pattern]) => {
            if (pattern.test(msg)) {
                this.sharedMoments.push({
                    type: type,
                    timestamp: conversation.timestamp,
                    snippet: conversation.user.substring(0, 100)
                });

                // Increase affection for shared moments
                this.affectionLevel = Math.min(100, this.affectionLevel + 2);
            }
        });

        // Keep only last 20 moments
        if (this.sharedMoments.length > 20) {
            this.sharedMoments = this.sharedMoments.slice(-20);
        }
    }

    /**
     * Get relationship status
     */
    getRelationshipStatus() {
        let status = 'stranger';

        if (this.familiarityLevel > 80) status = 'close friend';
        else if (this.familiarityLevel > 50) status = 'friend';
        else if (this.familiarityLevel > 20) status = 'acquaintance';

        return {
            status: status,
            affection: this.affectionLevel,
            familiarity: this.familiarityLevel,
            conversationCount: this.conversationHistory.length,
            sharedMoments: this.sharedMoments.length,
            favoriteTopics: this.userPreferences.topics.slice(0, 5)
        };
    }

    /**
     * Get personalized greeting based on relationship
     */
    getPersonalizedGreeting() {
        const status = this.getRelationshipStatus();
        const timeSinceLastInteraction = this.lastInteraction
            ? (Date.now() - new Date(this.lastInteraction).getTime()) / (1000 * 60 * 60)
            : null;

        if (status.status === 'close friend') {
            if (timeSinceLastInteraction && timeSinceLastInteraction > 24) {
                return "Hey! I've missed you! 💙";
            }
            return "Hey there, friend! 😊";
        } else if (status.status === 'friend') {
            return "Hi! Good to see you again! 🌟";
        } else if (status.status === 'acquaintance') {
            return "Hello! Nice to chat with you!";
        } else {
            return "Hi! I'm Phuntroo. Let's get to know each other! 👋";
        }
    }

    /**
     * Get conversation context for AI
     */
    getConversationContext() {
        const recentConversations = this.conversationHistory.slice(-5);
        const status = this.getRelationshipStatus();

        return {
            relationshipStatus: status.status,
            affectionLevel: this.affectionLevel,
            familiarityLevel: this.familiarityLevel,
            favoriteTopics: this.userPreferences.topics,
            recentConversations: recentConversations,
            sharedMoments: this.sharedMoments.slice(-3)
        };
    }

    /**
     * Save relationship memory
     */
    async save() {
        try {
            const personality = await memoryService.getPersonality();
            personality.relationship = {
                affection: this.affectionLevel,
                familiarity: this.familiarityLevel,
                preferences: this.userPreferences,
                moments: this.sharedMoments,
                lastInteraction: this.lastInteraction
            };
            await memoryService.updatePersonality(personality);
        } catch (error) {
            console.warn('Failed to save relationship memory:', error);
        }
    }
}

export const relationshipMemory = new RelationshipMemory();
