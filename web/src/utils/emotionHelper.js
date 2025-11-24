// Helper: Determine AI emotion from response and user emotion
const determineEmotionFromResponse = (response, userEmotion) => {
    const lowerResponse = response.toLowerCase();

    // Mirror user's emotion with empathy
    if (userEmotion === 'sad' || userEmotion === 'fear') return 'concerned';
    if (userEmotion === 'joy' || userEmotion === 'love') return 'happy';
    if (userEmotion === 'anger') return 'calm';

    // Detect from response content
    if (lowerResponse.includes('!') && (lowerResponse.includes('😊') || lowerResponse.includes('😄'))) return 'excited';
    if (lowerResponse.includes('sorry') || lowerResponse.includes('understand')) return 'empathetic';
    if (lowerResponse.includes('?')) return 'curious';
    if (lowerResponse.includes('haha') || lowerResponse.includes('😂')) return 'playful';

    return 'neutral';
};
