import { memoryService } from '../memory/MemoryService';
import { knowledgeAcquisition } from '../skills/KnowledgeAcquisition';
import { learningEngine } from '../learning/LearningEngine';
import { personalityEngine } from '../personality/PersonalityEngine';

/**
 * Self-Upgrade Engine
 * Autonomous improvement and knowledge gap detection
 */

class SelfUpgradeEngine {
    constructor() {
        this.metrics = {
            conversationQuality: [],
            knowledgeGaps: [],
            improvementActions: []
        };
        this.lastUpgrade = null;
    }

    /**
     * Detect weaknesses in conversation
     */
    async detectWeaknesses() {
        try {
            const conversations = await memoryService.getAllConversations();
            const recent = conversations.slice(-20);

            const weaknesses = {
                shortResponses: 0,
                repeatedTopics: {},
                unknownTopics: [],
                lowEngagement: 0
            };

            recent.forEach(conv => {
                // Detect short responses (potential knowledge gap)
                if (conv.aiResponse.length < 50) {
                    weaknesses.shortResponses++;
                }

                // Track repeated topics
                conv.context.topics?.forEach(topic => {
                    weaknesses.repeatedTopics[topic] = (weaknesses.repeatedTopics[topic] || 0) + 1;
                });

                // Detect knowledge gaps
                const gap = knowledgeAcquisition.detectKnowledgeGap(
                    conv.userMessage,
                    conv.aiResponse
                );
                if (gap) {
                    weaknesses.unknownTopics.push(gap);
                }

                // Detect low engagement
                if (conv.userMessage.length < 20 && conv.aiResponse.length < 50) {
                    weaknesses.lowEngagement++;
                }
            });

            return weaknesses;
        } catch (error) {
            console.error('Weakness detection error:', error);
            return null;
        }
    }

    /**
     * Create improvement plan
     */
    async createImprovementPlan() {
        try {
            const weaknesses = await this.detectWeaknesses();
            if (!weaknesses) return null;

            const plan = {
                actions: [],
                priority: 'medium',
                timestamp: new Date().toISOString()
            };

            // Address knowledge gaps
            if (weaknesses.unknownTopics.length > 0) {
                plan.actions.push({
                    type: 'learn',
                    topics: [...new Set(weaknesses.unknownTopics)],
                    description: 'Learn about unknown topics from the web'
                });
                plan.priority = 'high';
            }

            // Address short responses
            if (weaknesses.shortResponses > 5) {
                plan.actions.push({
                    type: 'improve_responses',
                    description: 'Provide more detailed and helpful responses'
                });
            }

            // Address low engagement
            if (weaknesses.lowEngagement > 5) {
                plan.actions.push({
                    type: 'increase_engagement',
                    description: 'Ask more questions and be more interactive'
                });
            }

            return plan;
        } catch (error) {
            console.error('Plan creation error:', error);
            return null;
        }
    }

    /**
     * Execute improvement plan
     */
    async executeImprovementPlan(plan) {
        if (!plan || plan.actions.length === 0) return;

        console.log('🚀 Executing improvement plan...');

        for (const action of plan.actions) {
            try {
                switch (action.type) {
                    case 'learn':
                        // Learn about unknown topics
                        for (const topic of action.topics.slice(0, 3)) {
                            await knowledgeAcquisition.learnTopic(topic);
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                        break;

                    case 'improve_responses':
                        // Adjust personality to be more detailed
                        const personality = await memoryService.getPersonality();
                        personality.traits.curiosity = Math.min(1, personality.traits.curiosity + 0.1);
                        await memoryService.updatePersonality(personality);
                        break;

                    case 'increase_engagement':
                        // Increase empathy and humor
                        const pers = await memoryService.getPersonality();
                        pers.traits.empathy = Math.min(1, pers.traits.empathy + 0.05);
                        pers.traits.humor = Math.min(1, pers.traits.humor + 0.05);
                        await memoryService.updatePersonality(pers);
                        break;
                }

                this.metrics.improvementActions.push({
                    action: action.type,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error(`Action ${action.type} failed:`, error);
            }
        }

        this.lastUpgrade = new Date().toISOString();
        console.log('✅ Improvement plan executed');
    }

    /**
     * Autonomous self-upgrade
     */
    async autonomousUpgrade() {
        try {
            console.log('🔧 Running autonomous self-upgrade...');

            // 1. Detect weaknesses
            const weaknesses = await this.detectWeaknesses();

            // 2. Create improvement plan
            const plan = await this.createImprovementPlan();

            // 3. Execute plan
            if (plan) {
                await this.executeImprovementPlan(plan);
            }

            // 4. Evolve personality
            await personalityEngine.evolvePersonality();

            // 5. Update learning
            await learningEngine.updatePersonalityFromLearnings();

            // 6. Autonomous knowledge acquisition
            await knowledgeAcquisition.autonomousLearning();

            console.log('🎉 Self-upgrade complete!');
        } catch (error) {
            console.error('Autonomous upgrade error:', error);
        }
    }

    /**
     * Get improvement metrics
     */
    getMetrics() {
        return {
            totalImprovements: this.metrics.improvementActions.length,
            lastUpgrade: this.lastUpgrade,
            recentActions: this.metrics.improvementActions.slice(-5)
        };
    }

    /**
     * Calculate conversation quality score
     */
    async calculateQualityScore(conversation) {
        const score = {
            responseLength: Math.min(1, conversation.aiResponse.length / 200),
            hasContext: conversation.context.topics?.length > 0 ? 1 : 0,
            engagement: conversation.userMessage.length > 30 ? 1 : 0.5
        };

        const avgScore = (score.responseLength + score.hasContext + score.engagement) / 3;

        this.metrics.conversationQuality.push({
            score: avgScore,
            timestamp: conversation.timestamp
        });

        // Keep only last 50
        if (this.metrics.conversationQuality.length > 50) {
            this.metrics.conversationQuality.shift();
        }

        return avgScore;
    }

    /**
     * Get average quality trend
     */
    getQualityTrend() {
        if (this.metrics.conversationQuality.length < 10) return null;

        const recent = this.metrics.conversationQuality.slice(-10);
        const older = this.metrics.conversationQuality.slice(-20, -10);

        const recentAvg = recent.reduce((sum, q) => sum + q.score, 0) / recent.length;
        const olderAvg = older.reduce((sum, q) => sum + q.score, 0) / older.length;

        return {
            current: recentAvg.toFixed(2),
            previous: olderAvg.toFixed(2),
            trend: recentAvg > olderAvg ? 'improving' : 'declining',
            change: ((recentAvg - olderAvg) * 100).toFixed(1) + '%'
        };
    }
}

export const selfUpgradeEngine = new SelfUpgradeEngine();
