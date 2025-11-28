/**
 * Integration Helper
 * Connects all new lifelike systems together
 */

import { visemeMapper } from './animation/VisemeMapper';
import { emotionalGestureLibrary } from './animation/EmotionalGestureLibrary';
import { gazeController } from './animation/GazeController';
import { relationshipMemory } from './memory/RelationshipMemory';

class LifelikeIntegration {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Initialize all systems
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Initialize relationship memory
            await relationshipMemory.initialize();

            console.log('✨ Lifelike systems initialized');
            this.isInitialized = true;
        } catch (error) {
            console.error('Lifelike integration error:', error);
        }
    }

    /**
     * Get enhanced response data for avatar
     */
    getEnhancedResponseData(text, emotion, conversationState) {
        // Get gesture suggestion
        const gesture = emotionalGestureLibrary.suggestGesture(text, emotion, conversationState);

        // Get visemes for lip-sync
        const visemes = visemeMapper.textToVisemes(text);

        // Get gaze direction
        gazeController.update(0.016, conversationState); // ~60fps
        const gaze = gazeController.getCurrentGaze();

        return {
            gesture: gesture,
            visemes: visemes,
            gaze: gaze,
            shouldBlink: gazeController.shouldBlink()
        };
    }

    /**
     * Update relationship after conversation
     */
    async updateRelationship(userMessage, aiResponse, emotion) {
        relationshipMemory.addConversation(userMessage, aiResponse, emotion);
        await relationshipMemory.save();
    }

    /**
     * Get personalized greeting
     */
    getGreeting() {
        return relationshipMemory.getPersonalizedGreeting();
    }

    /**
     * Get relationship context for AI
     */
    getRelationshipContext() {
        return relationshipMemory.getConversationContext();
    }
}

export const lifelikeIntegration = new LifelikeIntegration();
