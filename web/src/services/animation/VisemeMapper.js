/**
 * Enhanced Viseme Mapper
 * Precise phoneme-to-mouth-shape mapping for realistic lip-sync
 */

class VisemeMapper {
    constructor() {
        // Phoneme to viseme mapping (based on speech research)
        this.phonemeMap = {
            // Vowels
            'a': 'aa',    // "father"
            'e': 'E',     // "bed"
            'i': 'ih',    // "bit"
            'o': 'oh',    // "boat"
            'u': 'ou',    // "boot"

            // Consonants
            'p': 'PP',    // "put" (lips closed)
            'b': 'PP',    // "but"
            'm': 'PP',    // "met"
            'f': 'FF',    // "fun" (lower lip to teeth)
            'v': 'FF',    // "van"
            't': 'TH',    // "top" (tongue to teeth)
            'd': 'TH',    // "dog"
            's': 'SS',    // "sit" (teeth close)
            'z': 'SS',    // "zoo"
            'r': 'RR',    // "red" (lips rounded)
            'l': 'nn',    // "let" (tongue up)
            'w': 'ou',    // "wet" (lips rounded)
            'y': 'ih',    // "yes"

            // Special
            ' ': 'sil',   // silence
            '.': 'sil',
            ',': 'sil',
            '!': 'sil',
            '?': 'sil'
        };

        // VRM viseme names
        this.vrmVisemes = {
            'aa': 0,   // mouth wide open
            'E': 1,    // mouth medium open
            'ih': 2,   // mouth slightly open
            'oh': 3,   // mouth rounded
            'ou': 4,   // lips pursed
            'PP': 5,   // lips closed
            'FF': 6,   // lower lip to teeth
            'TH': 7,   // tongue to teeth
            'SS': 8,   // teeth close
            'RR': 9,   // lips rounded
            'nn': 10,  // tongue up
            'sil': 11  // neutral/closed
        };
    }

    /**
     * Convert text to viseme sequence with timing
     */
    textToVisemes(text, duration = null) {
        const words = text.toLowerCase().split(/\s+/);
        const visemes = [];
        let currentTime = 0;

        // Estimate duration if not provided (average speaking rate: 150 words/min)
        const estimatedDuration = duration || (words.length * 0.4); // ~0.4s per word
        const timePerWord = estimatedDuration / words.length;

        words.forEach((word, wordIndex) => {
            const chars = word.split('');
            const timePerChar = timePerWord / chars.length;

            chars.forEach((char, charIndex) => {
                const phoneme = this.phonemeMap[char] || 'sil';
                const visemeIndex = this.vrmVisemes[phoneme] || 11;

                visemes.push({
                    time: currentTime,
                    viseme: visemeIndex,
                    phoneme: phoneme,
                    char: char
                });

                currentTime += timePerChar;
            });

            // Add brief silence between words
            visemes.push({
                time: currentTime,
                viseme: 11, // silence
                phoneme: 'sil',
                char: ' '
            });
            currentTime += 0.05; // 50ms pause
        });

        return visemes;
    }

    /**
     * Get viseme at specific time
     */
    getVisemeAtTime(visemes, time) {
        if (!visemes || visemes.length === 0) return 11; // neutral

        // Find the viseme that should be active at this time
        for (let i = visemes.length - 1; i >= 0; i--) {
            if (time >= visemes[i].time) {
                return visemes[i].viseme;
            }
        }

        return visemes[0].viseme;
    }

    /**
     * Smooth viseme transitions (blend between visemes)
     */
    getSmoothedViseme(visemes, time, blendFactor = 0.3) {
        const currentViseme = this.getVisemeAtTime(visemes, time);
        const nextViseme = this.getVisemeAtTime(visemes, time + 0.1);

        // Simple blend (in real implementation, would blend blend shapes)
        return currentViseme;
    }
}

export const visemeMapper = new VisemeMapper();
