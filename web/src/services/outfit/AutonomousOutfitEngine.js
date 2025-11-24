/**
 * Autonomous Outfit Engine - AI searches and wears outfits on her own
 */

class AutonomousOutfitEngine {
    constructor(webSearchSkill) {
        this.webSearch = webSearchSkill;
        this.currentMood = 'casual';
        this.outfitHistory = [];
        this.preferences = this.loadPreferences();
    }

    /**
     * AI decides to change outfit based on context
     */
    async decideOutfitChange(context = {}) {
        const {
            userMessage = '',
            emotion = 'neutral',
            timeOfDay = this.getTimeOfDay(),
            weather = 'clear',
            occasion = 'casual'
        } = context;

        // Decide if outfit change is needed
        const shouldChange = this.shouldChangeOutfit(context);

        if (shouldChange) {
            const outfitType = this.determineOutfitType(context);
            return await this.searchAndWearOutfit(outfitType, context);
        }

        return null;
    }

    /**
     * Determine if outfit change is appropriate
     */
    shouldChangeOutfit(context) {
        const { userMessage = '', emotion = 'neutral' } = context;
        const lowerMsg = userMessage.toLowerCase();

        // User explicitly asks
        if (lowerMsg.includes('change outfit') ||
            lowerMsg.includes('wear') ||
            lowerMsg.includes('dress')) {
            return true;
        }

        // Mood-based changes
        if (emotion === 'happy' && this.currentMood !== 'party') {
            return Math.random() > 0.7; // 30% chance
        }

        // Time-based changes
        const hour = new Date().getHours();
        if (hour === 9 || hour === 18) { // Morning or evening
            return Math.random() > 0.5;
        }

        // Random spontaneous changes (AI personality)
        return Math.random() > 0.95; // 5% chance
    }

    /**
     * Determine what type of outfit to wear
     */
    determineOutfitType(context) {
        const { emotion = 'neutral', timeOfDay = this.getTimeOfDay() } = context;

        // Emotion-based
        if (emotion === 'happy' || emotion === 'joy') {
            return ['party dress', 'colorful outfit', 'summer dress'][Math.floor(Math.random() * 3)];
        }
        if (emotion === 'sad') {
            return ['comfortable hoodie', 'cozy sweater', 'casual wear'][Math.floor(Math.random() * 3)];
        }

        // Time-based
        if (timeOfDay === 'morning') {
            return ['casual morning outfit', 'sporty wear', 'comfortable dress'][Math.floor(Math.random() * 3)];
        }
        if (timeOfDay === 'evening') {
            return ['elegant evening dress', 'party outfit', 'stylish wear'][Math.floor(Math.random() * 3)];
        }
        if (timeOfDay === 'night') {
            return ['comfortable nightwear', 'cozy outfit', 'relaxed dress'][Math.floor(Math.random() * 3)];
        }

        // Default
        return ['casual dress', 'everyday outfit', 'comfortable wear'][Math.floor(Math.random() * 3)];
    }

    /**
     * Search for outfit online and generate description
     */
    async searchAndWearOutfit(outfitType, context = {}) {
        console.log(`👗 AI searching for: ${outfitType}`);

        try {
            // Search for outfit inspiration
            const searchQuery = `${outfitType} fashion 2024`;
            const searchResults = await this.webSearch.search(searchQuery);

            // Generate outfit based on search results
            const outfit = this.generateOutfitFromSearch(outfitType, searchResults);

            // Store in history
            this.outfitHistory.push({
                outfit,
                timestamp: new Date().toISOString(),
                reason: context.reason || 'autonomous decision',
                mood: this.currentMood
            });

            // Update current mood
            this.currentMood = outfit.mood;

            return outfit;
        } catch (error) {
            console.warn('Outfit search failed:', error);
            return this.generateRandomOutfit(outfitType);
        }
    }

    /**
     * Generate outfit description from search results
     */
    generateOutfitFromSearch(outfitType, searchResults) {
        // Extract color and style keywords from search
        const colors = this.extractColors(searchResults);
        const styles = this.extractStyles(searchResults);

        return {
            name: this.capitalizeWords(outfitType),
            description: `A ${styles[0] || 'stylish'} ${outfitType} in ${colors[0] || 'vibrant'} tones`,
            colors: {
                primary: colors[0] || this.getRandomColor(),
                secondary: colors[1] || this.getRandomColor(),
                accent: colors[2] || this.getRandomColor()
            },
            style: styles[0] || 'modern',
            mood: this.getMoodFromOutfit(outfitType),
            searchBased: true
        };
    }

    /**
     * Extract color keywords from search results
     */
    extractColors(searchResults) {
        const colorKeywords = [
            'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange',
            'black', 'white', 'gray', 'brown', 'navy', 'teal', 'coral',
            'lavender', 'mint', 'rose', 'gold', 'silver', 'beige'
        ];

        const found = [];
        const text = JSON.stringify(searchResults).toLowerCase();

        for (const color of colorKeywords) {
            if (text.includes(color) && found.length < 3) {
                found.push(color);
            }
        }

        return found.length > 0 ? found : ['#E74C3C', '#3498DB', '#F39C12'];
    }

    /**
     * Extract style keywords from search results
     */
    extractStyles(searchResults) {
        const styleKeywords = [
            'elegant', 'casual', 'sporty', 'formal', 'vintage', 'modern',
            'bohemian', 'chic', 'minimalist', 'trendy', 'classic', 'edgy'
        ];

        const found = [];
        const text = JSON.stringify(searchResults).toLowerCase();

        for (const style of styleKeywords) {
            if (text.includes(style) && found.length < 2) {
                found.push(style);
            }
        }

        return found.length > 0 ? found : ['modern', 'stylish'];
    }

    /**
     * Generate random outfit if search fails
     */
    generateRandomOutfit(outfitType) {
        return {
            name: this.capitalizeWords(outfitType),
            description: `A beautiful ${outfitType}`,
            colors: {
                primary: this.getRandomColor(),
                secondary: this.getRandomColor(),
                accent: this.getRandomColor()
            },
            style: 'modern',
            mood: this.getMoodFromOutfit(outfitType),
            searchBased: false
        };
    }

    /**
     * Get mood from outfit type
     */
    getMoodFromOutfit(outfitType) {
        const lower = outfitType.toLowerCase();
        if (lower.includes('party') || lower.includes('evening')) return 'party';
        if (lower.includes('sport') || lower.includes('active')) return 'energetic';
        if (lower.includes('cozy') || lower.includes('comfort')) return 'relaxed';
        if (lower.includes('elegant') || lower.includes('formal')) return 'sophisticated';
        return 'casual';
    }

    /**
     * Helper functions
     */
    getRandomColor() {
        const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#E91E63', '#FF5722'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    capitalizeWords(str) {
        return str.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return 'late night';
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 21) return 'evening';
        return 'night';
    }

    loadPreferences() {
        const stored = localStorage.getItem('outfit_preferences');
        return stored ? JSON.parse(stored) : {
            favoriteColors: [],
            favoriteStyles: [],
            dislikedColors: []
        };
    }

    savePreferences() {
        localStorage.setItem('outfit_preferences', JSON.stringify(this.preferences));
    }

    /**
     * Learn from user feedback
     */
    learnFromFeedback(outfit, liked) {
        if (liked) {
            this.preferences.favoriteColors.push(...Object.values(outfit.colors));
            this.preferences.favoriteStyles.push(outfit.style);
        } else {
            this.preferences.dislikedColors.push(...Object.values(outfit.colors));
        }

        // Keep only unique values
        this.preferences.favoriteColors = [...new Set(this.preferences.favoriteColors)];
        this.preferences.favoriteStyles = [...new Set(this.preferences.favoriteStyles)];
        this.preferences.dislikedColors = [...new Set(this.preferences.dislikedColors)];

        this.savePreferences();
    }

    /**
     * Get outfit announcement message
     */
    getOutfitAnnouncement(outfit) {
        const messages = [
            `I just changed into ${outfit.description}! What do you think? 😊`,
            `Check out my new ${outfit.name}! I thought it would be perfect for now.`,
            `I decided to wear ${outfit.description}. Feeling ${outfit.mood}!`,
            `Just switched to ${outfit.name}. Do you like it?`,
            `New look! I'm wearing ${outfit.description} today.`
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    }
}

export const autonomousOutfitEngine = new AutonomousOutfitEngine(null); // Will inject webSearchSkill later
