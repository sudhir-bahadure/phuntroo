/**
 * Self-Upgrade Engine
 * Detects performance issues and attempts autonomous improvements.
 * All logic runs in the browser – no external services.
 */

class SelfUpgradeEngine {
    constructor() {
        this.qualityHistory = [];
    }

    /**
     * Calculate a simple quality score for a conversation turn.
     * Stores the score for later analysis.
     */
    calculateQualityScore({ userMessage, aiResponse, context, timestamp }) {
        // Very naive quality metric: length of AI response + engagement flag
        const lengthScore = aiResponse.length / 100; // normalize
        const engagementScore = (context?.outfit?.name ? 0.2 : 0) + (context?.emotion ? 0.1 : 0);
        const totalScore = Math.min(1, lengthScore + engagementScore);
        this.qualityHistory.push({ timestamp, score: totalScore, details: { userMessage, aiResponse, context } });
        // Keep only last 50 entries
        if (this.qualityHistory.length > 50) this.qualityHistory.shift();
        console.log('📊 Quality score recorded:', totalScore);
    }

    /**
     * Perform an autonomous upgrade.
     * For demo purposes we simply log and trigger a re‑analysis of personality.
     */
    async autonomousUpgrade() {
        console.log('🚀 Self‑Upgrade: analyzing quality history...');
        // Simple heuristic: if average quality < 0.5, boost curiosity trait
        const recent = this.qualityHistory.slice(-10);
        if (recent.length === 0) return;
        const avg = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
        if (avg < 0.5) {
            console.log('🔧 Low quality detected, nudging curiosity trait');
            // Use personalityEngine to bump curiosity slightly
            const personality = await memoryService.getPersonality();
            const newTraits = { ...personality.traits };
            newTraits.curiosity = Math.min(1, (newTraits.curiosity || 0) + 0.05);
            await memoryService.updatePersonality({ traits: newTraits });
            console.log('✅ Curiosity increased via self‑upgrade');
        } else {
            console.log('✅ Quality is good, no changes needed');
        }
    }

    /**
     * Health check – looks for recent errors via errorMonitor and attempts fixes.
     */
    async performHealthCheck() {
        const errors = errorMonitor.getRecentErrors(5);
        if (errors.length === 0) {
            console.log('🩺 Health check: no recent errors');
            return { status: 'healthy' };
        }
        console.warn('🩺 Health check found errors:', errors);
        // Simple auto‑fix: if VRM load error, force reload
        const vrmErrors = errors.filter(e => e.message && e.message.toLowerCase().includes('vrm'));
        if (vrmErrors.length > 0) {
            console.log('🔁 Attempting VRM reload due to errors');
            // Trigger a reload by resetting the component state via a custom event
            const event = new Event('phuntroo-reload-vrm');
            window.dispatchEvent(event);
        }
        return { status: 'issues', errors };
    }
}

export const selfUpgradeEngine = new SelfUpgradeEngine();
