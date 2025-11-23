// Outfit decision system for AI-driven wardrobe changes

export const OUTFIT_THEMES = {
    professional: {
        name: 'Professional',
        colors: { primary: '#2C3E50', secondary: '#FFFFFF', accent: '#3498DB' },
        description: 'Business, work, formal topics'
    },
    casual: {
        name: 'Casual',
        colors: { primary: '#E74C3C', secondary: '#ECF0F1', accent: '#F39C12' },
        description: 'Everyday conversation, relaxed topics'
    },
    creative: {
        name: 'Creative',
        colors: { primary: '#9B59B6', secondary: '#F1C40F', accent: '#E67E22' },
        description: 'Art, design, creative discussions'
    },
    tech: {
        name: 'Tech',
        colors: { primary: '#1ABC9C', secondary: '#34495E', accent: '#16A085' },
        description: 'Technology, coding, science'
    },
    festive: {
        name: 'Festive',
        colors: { primary: '#E91E63', secondary: '#FFC107', accent: '#FF5722' },
        description: 'Celebrations, parties, joy'
    },
    calm: {
        name: 'Calm',
        colors: { primary: '#95A5A6', secondary: '#BDC3C7', accent: '#7F8C8D' },
        description: 'Meditation, relaxation, peace'
    },
    energetic: {
        name: 'Energetic',
        colors: { primary: '#FF6B6B', secondary: '#FFE66D', accent: '#4ECDC4' },
        description: 'Sports, fitness, excitement'
    }
};

export function analyzeTopicForOutfit(conversationHistory) {
    // Extract recent messages
    const recentMessages = conversationHistory.slice(-5);
    const text = recentMessages.map(m => m.content).join(' ').toLowerCase();

    // Topic keywords mapping
    const topicKeywords = {
        professional: ['work', 'business', 'meeting', 'professional', 'career', 'job', 'office'],
        creative: ['art', 'design', 'creative', 'paint', 'draw', 'music', 'create'],
        tech: ['code', 'programming', 'computer', 'tech', 'software', 'ai', 'data'],
        festive: ['party', 'celebrate', 'festival', 'birthday', 'happy', 'joy', 'fun'],
        calm: ['relax', 'calm', 'peace', 'meditate', 'quiet', 'rest', 'sleep'],
        energetic: ['sport', 'exercise', 'run', 'energy', 'active', 'fitness', 'gym'],
        casual: [] // default
    };

    // Score each theme
    let maxScore = 0;
    let selectedTheme = 'casual';

    for (const [theme, keywords] of Object.entries(topicKeywords)) {
        if (keywords.length === 0) continue;

        const score = keywords.reduce((acc, keyword) => {
            return acc + (text.includes(keyword) ? 1 : 0);
        }, 0);

        if (score > maxScore) {
            maxScore = score;
            selectedTheme = theme;
        }
    }

    return OUTFIT_THEMES[selectedTheme];
}

export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : { r: 1, g: 1, b: 1 };
}
