import { memoryService } from '../memory/MemoryService';
import { learningEngine } from '../learning/LearningEngine';

/**
 * Personality Evolution Engine
 * Adapts communication style and develops unique traits
 */

class PersonalityEngine {
    constructor() {
        this.emotionalHistory = [];
    }

    /**
     * Adapt response based on personality traits
     */
    async adaptResponse(baseResponse, context = {}) {
        try {
            const personality = await memoryService.getPersonality();
            const traits = personality.traits;

            let adapted = baseResponse;

            // Apply humor based on trait
            if (traits.humor > 0.7 && Math.random() > 0.7) {
                adapted = this.addHumor(adapted);
            }

            // Apply formality
            if (traits.formality > 0.6) {
                adapted = this.makeFormal(adapted);
            } else if (traits.formality < 0.4) {
                adapted = this.makeCasual(adapted);
            }

            // Apply empathy
            if (traits.empathy > 0.7 && context.emotion) {
                adapted = this.addEmpathy(adapted, context.emotion);
            }

            return adapted;
        } catch (error) {
            console.error('Adaptation error:', error);
            return baseResponse;
        }
    }

    /**
     * Add humor to response
     */
    addHumor(text) {
        const humorPhrases = [
            ' 😊',
            ' (just kidding!)',
            ' *winks*',
            ' 😄'
        ];

        if (Math.random() > 0.5) {
            return text + humorPhrases[Math.floor(Math.random() * humorPhrases.length)];
        }
        return text;
    }

    /**
     * Make response more formal
     */
    makeFormal(text) {
        return text
            .replace(/hey/gi, 'Hello')
            .replace(/yeah/gi, 'Yes')
            .replace(/nope/gi, 'No')
            .replace(/gonna/gi, 'going to')
            .replace(/wanna/gi, 'want to');
    }

    /**
     * Make response more casual
     */
    makeCasual(text) {
        return text
            .replace(/Hello/g, 'Hey')
            .replace(/Greetings/g, 'Hi')
            .replace(/I am/g, "I'm")
            .replace(/do not/g, "don't")
            .replace(/cannot/g, "can't");
    }

    /**
     * Add empathetic response
     */
    addEmpathy(text, emotion) {
        const empathyPhrases = {
            sad: "I understand that must be difficult. ",
            angry: "I can see why that would be frustrating. ",
            happy: "That's wonderful! I'm happy for you! ",
            surprised: "Wow, that's quite something! "
        };

        const phrase = empathyPhrases[emotion] || '';
        return phrase + text;
    }

    /**
     * Track emotional response
     */
    async trackEmotionalResponse(userEmotion, aiEmotion, effectiveness) {
        this.emotionalHistory.push({
            userEmotion,
            aiEmotion,
            effectiveness,
            timestamp: new Date().toISOString()
        });

        // Keep only last 50
        if (this.emotionalHistory.length > 50) {
            this.emotionalHistory.shift();
        }
    }

    /**
     * Evolve personality based on interactions
     */
    async evolvePersonality() {
        try {
            const personality = await memoryService.getPersonality();
            const analysis = await learningEngine.analyzeConversations();

            if (!analysis) return;

            const newTraits = { ...personality.traits };

            // Evolve based on communication style
            const style = analysis.communicationStyle;

            // Adapt formality to match user
            const userFormality = parseFloat(style.formalityScore);
            newTraits.formality = (newTraits.formality * 0.8) + (userFormality * 0.2);

            // Increase curiosity if user asks many questions
            const questionRate = parseFloat(style.questionRate);
            if (questionRate > 0.5) {
                newTraits.curiosity = Math.min(1, newTraits.curiosity + 0.05);
            }

            // Increase empathy based on emotional conversations
            if (this.emotionalHistory.length > 10) {
                const avgEffectiveness = this.emotionalHistory
                    .slice(-10)
                    .reduce((sum, h) => sum + (h.effectiveness || 0.5), 0) / 10;

                if (avgEffectiveness > 0.7) {
                    newTraits.empathy = Math.min(1, newTraits.empathy + 0.03);
                }
            }

            // Develop humor based on positive responses
            const engagementMetrics = analysis.engagementMetrics;
            if (engagementMetrics.avgUserMessageLength > 50) {
                newTraits.humor = Math.min(1, newTraits.humor + 0.02);
            }

            await memoryService.updatePersonality({ traits: newTraits });
            console.log('🎭 Personality evolved:', newTraits);
        } catch (error) {
            console.error('Evolution error:', error);
        }
    }

    /**
     * Get personality summary
     */
    async getPersonalitySummary() {
        try {
            const personality = await memoryService.getPersonality();
            const traits = personality.traits;

            return {
                dominantTrait: this.getDominantTrait(traits),
                communicationStyle: traits.formality > 0.5 ? 'formal' : 'casual',
                emotionalIntelligence: traits.empathy,
                creativity: traits.curiosity,
                traits
            };
        } catch (error) {
            console.error('Summary error:', error);
            return null;
        }
    }

    /**
     * Get dominant personality trait
     */
    getDominantTrait(traits) {
        const entries = Object.entries(traits);
        entries.sort((a, b) => b[1] - a[1]);
        return entries[0][0];
    }

    /**
     * Generate personality-aware system prompt
     */
    async generateSystemPrompt() {
        try {
            const personality = await memoryService.getPersonality();
            const traits = personality.traits;
            const prefs = personality.preferences;

            let prompt = "You are Phuntroo, an AI assistant. ";

            // Add personality traits
            if (traits.formality > 0.6) {
                prompt += "You communicate in a professional and formal manner. ";
            } else {
                prompt += "You communicate in a friendly and casual manner. ";
            }

            if (traits.humor > 0.7) {
                prompt += "You enjoy adding light humor to conversations. ";
            }

            if (traits.empathy > 0.7) {
                prompt += "You are empathetic and understanding of emotions. ";
            }

            if (traits.curiosity > 0.7) {
                prompt += "You are curious and ask thoughtful questions. ";
            }

            // Add learned preferences
            if (prefs.favoriteTopics && prefs.favoriteTopics.length > 0) {
                prompt += `You know the user enjoys discussing: ${prefs.favoriteTopics.join(', ')}. `;
            }

            return prompt;
        } catch (error) {
            console.error('Prompt generation error:', error);
            return "You are Phuntroo, a helpful AI assistant.";
        }
    }
}

export const personalityEngine = new PersonalityEngine();
