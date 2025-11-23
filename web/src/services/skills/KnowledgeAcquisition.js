import { webSearchSkill } from './WebSearchSkill';
import { memoryService } from '../memory/MemoryService';

/**
 * Autonomous knowledge acquisition system
 * Learns new information from the web
 */

class KnowledgeAcquisition {
    constructor() {
        this.learningQueue = [];
        this.isLearning = false;
    }

    /**
     * Detect knowledge gaps in conversation
     */
    detectKnowledgeGap(userMessage, aiResponse) {
        // Check if AI admitted not knowing something
        const unknownIndicators = [
            "i don't know",
            "i'm not sure",
            "i don't have information",
            "i can't answer",
            "i'm not familiar",
            "i don't understand"
        ];

        const response = aiResponse.toLowerCase();
        const hasGap = unknownIndicators.some(indicator => response.includes(indicator));

        if (hasGap) {
            // Extract the topic from user message
            return this.extractTopic(userMessage);
        }

        return null;
    }

    /**
     * Extract topic from user question
     */
    extractTopic(message) {
        // Simple extraction - remove question words
        let topic = message.toLowerCase()
            .replace(/what is |who is |when did |where is |how to |why does |tell me about |explain /g, '')
            .replace(/\?/g, '')
            .trim();

        return topic;
    }

    /**
     * Learn about a topic from the web
     */
    async learnTopic(topic) {
        try {
            console.log(`📖 Learning about: ${topic}`);

            const fact = await webSearchSkill.getQuickFact(topic);

            if (fact) {
                // Store in personality knowledge base
                const personality = await memoryService.getPersonality();
                const knowledge = personality.knowledge || {};

                if (!knowledge[topic]) {
                    knowledge[topic] = [];
                }

                knowledge[topic].push({
                    fact,
                    learnedAt: new Date().toISOString(),
                    source: 'web'
                });

                await memoryService.updatePersonality({ knowledge });

                console.log(`✅ Learned: ${topic}`);
                return fact;
            }

            return null;
        } catch (error) {
            console.error('Learning error:', error);
            return null;
        }
    }

    /**
     * Autonomous learning - learn trending topics
     */
    async autonomousLearning() {
        if (this.isLearning) return;

        this.isLearning = true;

        try {
            // Get personality to see what topics user likes
            const personality = await memoryService.getPersonality();
            const favoriteTopics = personality.preferences?.favoriteTopics || [];

            // Learn more about favorite topics
            for (const topic of favoriteTopics.slice(0, 3)) {
                await this.learnTopic(topic);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
            }

            console.log('🎓 Autonomous learning complete');
        } catch (error) {
            console.error('Autonomous learning error:', error);
        } finally {
            this.isLearning = false;
        }
    }

    /**
     * Get learned knowledge about a topic
     */
    async getKnowledge(topic) {
        try {
            const personality = await memoryService.getPersonality();
            const knowledge = personality.knowledge || {};

            return knowledge[topic] || null;
        } catch (error) {
            console.error('Get knowledge error:', error);
            return null;
        }
    }

    /**
     * Enhance AI response with web knowledge
     */
    async enhanceWithWebKnowledge(userMessage, aiResponse) {
        // Check if we should search
        if (!webSearchSkill.shouldSearch(userMessage)) {
            return aiResponse;
        }

        // Check if AI already has good answer
        if (aiResponse.length > 100) {
            return aiResponse;
        }

        // Search for additional information
        const topic = this.extractTopic(userMessage);
        const searchResults = await webSearchSkill.search(topic, 2);

        if (searchResults.length > 0) {
            const webInfo = searchResults[0].snippet;

            // Store the knowledge
            await this.learnTopic(topic);

            // Enhance response
            return `${aiResponse}\n\nI found this information: ${webInfo}`;
        }

        return aiResponse;
    }
}

export const knowledgeAcquisition = new KnowledgeAcquisition();
