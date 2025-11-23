import { memoryService } from '../memory/MemoryService';

class LearningEngine {
    constructor() {
        this.initialized = false;
    }

    /**
     * Analyze all conversations and extract learnings
     */
    async analyzeConversations() {
        try {
            const conversations = await memoryService.getAllConversations();
            if (conversations.length === 0) return null;

            const analysis = {
                topicPreferences: this.analyzeTopicPreferences(conversations),
                outfitEffectiveness: this.analyzeOutfitEffectiveness(conversations),
                communicationStyle: this.analyzeCommunicationStyle(conversations),
                timePatterns: this.analyzeTimePatterns(conversations),
                engagementMetrics: this.calculateEngagementMetrics(conversations)
            };

            return analysis;
        } catch (error) {
            console.error('Analysis error:', error);
            return null;
        }
    }

    /**
     * Analyze which topics user engages with most
     */
    analyzeTopicPreferences(conversations) {
        const topicEngagement = {};

        conversations.forEach(conv => {
            conv.context.topics?.forEach(topic => {
                if (!topicEngagement[topic]) {
                    topicEngagement[topic] = {
                        count: 0,
                        totalLength: 0,
                        avgResponseLength: 0
                    };
                }
                topicEngagement[topic].count++;
                topicEngagement[topic].totalLength += conv.aiResponse.length;
            });
        });

        // Calculate averages
        Object.keys(topicEngagement).forEach(topic => {
            const data = topicEngagement[topic];
            data.avgResponseLength = data.totalLength / data.count;
        });

        // Sort by engagement (count * avg length)
        const sorted = Object.entries(topicEngagement)
            .sort((a, b) => {
                const scoreA = a[1].count * a[1].avgResponseLength;
                const scoreB = b[1].count * b[1].avgResponseLength;
                return scoreB - scoreA;
            })
            .slice(0, 5);

        return Object.fromEntries(sorted);
    }

    /**
     * Analyze which outfits lead to better engagement
     */
    analyzeOutfitEffectiveness(conversations) {
        const outfitMetrics = {};

        conversations.forEach(conv => {
            const outfit = conv.context.outfit;
            if (!outfit) return;

            if (!outfitMetrics[outfit]) {
                outfitMetrics[outfit] = {
                    count: 0,
                    totalMessages: 0,
                    avgConversationLength: 0
                };
            }

            outfitMetrics[outfit].count++;
            outfitMetrics[outfit].totalMessages += conv.userMessage.length + conv.aiResponse.length;
        });

        // Calculate averages
        Object.keys(outfitMetrics).forEach(outfit => {
            const data = outfitMetrics[outfit];
            data.avgConversationLength = data.totalMessages / data.count;
        });

        return outfitMetrics;
    }

    /**
     * Analyze user's communication style
     */
    analyzeCommunicationStyle(conversations) {
        let totalLength = 0;
        let questionCount = 0;
        let casualWords = 0;
        let formalWords = 0;

        const casualIndicators = ['hey', 'yeah', 'cool', 'awesome', 'lol', 'haha', 'ok', 'gonna'];
        const formalIndicators = ['please', 'thank you', 'kindly', 'would', 'could', 'appreciate'];

        conversations.forEach(conv => {
            const msg = conv.userMessage.toLowerCase();
            totalLength += conv.userMessage.length;

            if (msg.includes('?')) questionCount++;

            casualIndicators.forEach(word => {
                if (msg.includes(word)) casualWords++;
            });

            formalIndicators.forEach(word => {
                if (msg.includes(word)) formalWords++;
            });
        });

        const avgMessageLength = totalLength / conversations.length;
        const questionRate = questionCount / conversations.length;
        const formalityScore = formalWords / (casualWords + formalWords + 1);

        return {
            avgMessageLength: Math.round(avgMessageLength),
            questionRate: questionRate.toFixed(2),
            formalityScore: formalityScore.toFixed(2),
            style: formalityScore > 0.5 ? 'formal' : 'casual'
        };
    }

    /**
     * Analyze time-based patterns
     */
    analyzeTimePatterns(conversations) {
        const hourDistribution = {};

        conversations.forEach(conv => {
            const hour = new Date(conv.timestamp).getHours();
            hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
        });

        // Find peak hours
        const sortedHours = Object.entries(hourDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        return {
            peakHours: sortedHours.map(([hour]) => parseInt(hour)),
            distribution: hourDistribution
        };
    }

    /**
     * Calculate overall engagement metrics
     */
    calculateEngagementMetrics(conversations) {
        const recentConvs = conversations.slice(-10);

        let totalUserLength = 0;
        let totalAiLength = 0;

        recentConvs.forEach(conv => {
            totalUserLength += conv.userMessage.length;
            totalAiLength += conv.aiResponse.length;
        });

        return {
            avgUserMessageLength: Math.round(totalUserLength / recentConvs.length),
            avgAiResponseLength: Math.round(totalAiLength / recentConvs.length),
            conversationCount: conversations.length,
            recentActivity: recentConvs.length
        };
    }

    /**
     * Update personality based on learnings
     */
    async updatePersonalityFromLearnings() {
        try {
            const analysis = await this.analyzeConversations();
            if (!analysis) return;

            const personality = await memoryService.getPersonality();

            // Update preferences based on analysis
            const updates = {
                preferences: {
                    ...personality.preferences,
                    favoriteTopics: Object.keys(analysis.topicPreferences),
                    communicationStyle: analysis.communicationStyle.style,
                    outfitPreferences: this.buildOutfitPreferences(analysis)
                },
                traits: this.adjustTraits(personality.traits, analysis)
            };

            await memoryService.updatePersonality(updates);
            console.log('🎓 Personality updated from learnings');
        } catch (error) {
            console.error('Failed to update personality:', error);
        }
    }

    /**
     * Build outfit preferences based on effectiveness
     */
    buildOutfitPreferences(analysis) {
        const prefs = {};
        const topics = Object.keys(analysis.topicPreferences);
        const outfits = analysis.outfitEffectiveness;

        // Map most effective outfit to each topic
        topics.forEach(topic => {
            // Find outfit with best engagement for this topic
            const bestOutfit = Object.entries(outfits)
                .sort((a, b) => b[1].avgConversationLength - a[1].avgConversationLength)[0];

            if (bestOutfit) {
                prefs[topic] = bestOutfit[0];
            }
        });

        return prefs;
    }

    /**
     * Adjust personality traits based on interactions
     */
    adjustTraits(currentTraits, analysis) {
        const newTraits = { ...currentTraits };

        // Adjust formality based on communication style
        const formalityScore = parseFloat(analysis.communicationStyle.formalityScore);
        newTraits.formality = (newTraits.formality * 0.7) + (formalityScore * 0.3);

        // Adjust curiosity based on question rate
        const questionRate = parseFloat(analysis.communicationStyle.questionRate);
        newTraits.curiosity = Math.min(1, (newTraits.curiosity * 0.8) + (questionRate * 0.2));

        return newTraits;
    }

    /**
     * Get smart outfit recommendation
     */
    async getSmartOutfitRecommendation(currentTopic) {
        try {
            const personality = await memoryService.getPersonality();
            const prefs = personality.preferences.outfitPreferences;

            // Check if we have a learned preference for this topic
            if (prefs[currentTopic]) {
                return prefs[currentTopic];
            }

            // Fallback to time-based recommendation
            const hour = new Date().getHours();
            if (hour >= 9 && hour < 17) return 'professional';
            if (hour >= 17 && hour < 22) return 'casual';
            return 'relaxed';
        } catch (error) {
            console.error('Recommendation error:', error);
            return null;
        }
    }
}

export const learningEngine = new LearningEngine();
