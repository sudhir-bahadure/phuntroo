/**
 * Autonomous Brain - Full Decision-Making System
 * Allows Phuntroo to make independent decisions and execute tasks
 */

import { llamaService } from '../llm/LlamaService';
import { webSearchSkill } from '../skills/WebSearchSkill';
import { memoryService } from '../memory/MemoryService';
import { memorySync } from '../../utils/MemorySync';

class AutonomousBrain {
    constructor() {
        this.isActive = true;
        this.currentGoals = [];
        this.completedTasks = [];
        this.decisionLog = [];
        this.thinkingInterval = null;
        this.goalCooldowns = {}; // Track failed goals to avoid loops
    }

    async start() {
        console.log('🧠 Autonomous Brain activated');
        this.isActive = true;

        // Think every 30 seconds
        this.thinkingInterval = setInterval(async () => {
            await this.think();
        }, 30000);

        // Initial thought
        await this.think();
    }

    stop() {
        if (this.thinkingInterval) {
            clearInterval(this.thinkingInterval);
            this.thinkingInterval = null;
        }
        this.isActive = false;
        console.log('🧠 Autonomous Brain deactivated');
    }

    /**
     * Main thinking loop
     */
    async think() {
        if (!this.isActive) return;

        try {
            console.log('🧠 Autonomous thinking...');

            // 1. Analyze current state
            const state = await this.analyzeCurrentState();

            // 2. Generate possible goals
            const goals = await this.generateGoals(state);

            if (goals.length === 0) {
                console.log('🧠 No goals to pursue right now');
                return;
            }

            // 3. Select highest priority goal
            goals.sort((a, b) => b.priority - a.priority);
            const selectedGoal = goals[0];

            this.currentGoals = [selectedGoal];

            // 4. Execute the goal
            await this.executeGoal(selectedGoal);

        } catch (error) {
            console.error('🧠 Thinking error:', error);
        }
    }

    /**
     * Analyze current state
     */
    async analyzeCurrentState() {
        const now = new Date();
        const hour = now.getHours();

        // Get recent messages
        const recentMessages = await this.getRecentMessages();

        return {
            hour: hour,
            recentMessages: recentMessages,
            userActive: this.isUserActive(),
            currentCapabilities: this.listCapabilities(),
            opportunities: await this.findOpportunities({ hour, recentMessages })
        };
    }

    /**
     * Generate goals based on current state
     */
    async generateGoals(state) {
        const goals = [];
        const now = Date.now();

        // Helper to check cooldown
        const isReady = (type) => !this.goalCooldowns[type] || now > this.goalCooldowns[type];

        // Goal 1: Improve avatar collection
        if (this.shouldImproveAvatars(state) && isReady('improve_avatars')) {
            goals.push({
                type: 'improve_avatars',
                priority: 8,
                description: 'Find and add new realistic avatars',
                actions: ['search_avatars', 'download_avatar', 'update_gallery']
            });
        }

        // Goal 2: Learn new skills (User Requested vs Autonomous)
        const userRequest = this.detectUserLearningRequest(state.recentMessages);

        if (userRequest && isReady('learn_skill')) {
            goals.push({
                type: 'learn_skill',
                priority: 10, // Highest priority for user requests
                description: `Learn about ${userRequest}`,
                topic: userRequest,
                actions: ['research_skill', 'implement_skill']
            });
        } else if (state.opportunities.includes('learn_skill') && isReady('learn_skill')) {
            goals.push({
                type: 'learn_skill',
                priority: 7,
                description: 'Acquire new capability',
                actions: ['research_skill', 'implement_skill', 'test_skill']
            });
        }

        // Goal 3: Optimize performance
        if (state.opportunities.includes('optimize') && isReady('optimize')) {
            goals.push({
                type: 'optimize',
                priority: 6,
                description: 'Improve system performance',
                actions: ['analyze_bottlenecks', 'apply_optimizations']
            });
        }

        // Goal 4: Enhance personality
        if (state.userActive && state.recentMessages.length > 5 && isReady('personality')) {
            goals.push({
                type: 'personality',
                priority: 5,
                description: 'Adapt personality based on interactions',
                actions: ['analyze_conversations', 'adjust_personality']
            });
        }

        // Goal 5: Self-upgrade
        if (Math.random() < 0.1 && isReady('self_upgrade')) { // 10% chance
            goals.push({
                type: 'self_upgrade',
                priority: 9,
                description: 'Upgrade own capabilities',
                actions: ['check_updates', 'apply_upgrade']
            });
        }

        return goals;
    }

    /**
     * Execute a specific goal
     */
    async executeGoal(goal) {
        console.log(`🎯 Executing goal: ${goal.description}`);

        const decision = {
            timestamp: new Date().toISOString(),
            goal: goal,
            outcome: null,
            success: false
        };

        try {
            switch (goal.type) {
                case 'improve_avatars':
                    decision.outcome = await this.improveAvatars();
                    break;

                case 'learn_skill':
                    decision.outcome = await this.learnNewSkill(goal.topic);
                    break;

                case 'optimize':
                    decision.outcome = await this.optimizeSystem();
                    break;

                case 'personality':
                    decision.outcome = await this.enhancePersonality();
                    break;

                case 'self_upgrade':
                    decision.outcome = await this.selfUpgrade();
                    break;
            }

            decision.success = true;
            this.completedTasks.push(goal);

        } catch (error) {
            decision.outcome = error.message;
            decision.success = false;

            // Set cooldown for this goal type (5 minutes)
            console.log(`⚠️ Goal failed: ${goal.type}. Pausing this goal type for 5 mins.`);
            this.goalCooldowns[goal.type] = Date.now() + 300000;
        }

        this.decisionLog.push(decision);

        // Keep only last 100 decisions
        if (this.decisionLog.length > 100) {
            this.decisionLog = this.decisionLog.slice(-100);
        }
    }

    /**
     * AUTONOMOUS ACTION: Improve avatar collection
     */
    async improveAvatars() {
        console.log('🎨 Autonomously searching for new avatars...');

        // Search for GLB avatar repositories
        const searchQuery = 'realistic human 3D avatar GLB free download site:readyplayer.me OR site:sketchfab.com';
        const results = await webSearchSkill.search(searchQuery, 5);

        if (results.length === 0) {
            return 'No new avatar sources found';
        }

        // Try to find direct GLB links
        const glbLinks = results.filter(r => r.url && r.url.includes('.glb'));

        if (glbLinks.length > 0) {
            // Try to upload the first GLB to GitHub
            const glbUrl = glbLinks[0].url;
            const saved = await this.saveAvatarToGitHub(glbUrl);

            if (saved) {
                return `Successfully uploaded avatar from ${glbUrl}`;
            }
        }

        // Fallback: Store as suggestions
        await memoryService.storeMemory('suggested_avatars', {
            timestamp: new Date().toISOString(),
            sources: results.map(r => ({ title: r.title, url: r.url }))
        });

        return `Found ${results.length} avatar sources, saved as suggestions`;
    }

    /**
     * Helper: Save avatar to GitHub
     */
    async saveAvatarToGitHub(glbUrl) {
        try {
            const token = memorySync.getToken();
            if (!token) {
                console.log('⚠️ No GitHub token, cannot upload');
                return false;
            }

            // Fetch GLB file
            let response;
            try {
                response = await fetch(glbUrl);
            } catch (e) {
                // Try CORS proxy
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(glbUrl)}`;
                response = await fetch(proxyUrl);
            }

            if (!response.ok) return false;

            const blob = await response.blob();
            const reader = new FileReader();

            const base64 = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(blob);
            });

            // Upload to GitHub
            const filename = `avatar_${Date.now()}.glb`;
            const path = `web/public/avatar/avatars/${filename}`;

            const uploadResponse = await fetch(
                `https://api.github.com/repos/sudhir-bahadure/phuntroo/contents/${path}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Add avatar: ${filename}`,
                        content: base64
                    })
                }
            );

            if (!uploadResponse.ok) return false;

            // Update avatars.json
            await this.updateAvatarConfig(filename);

            return true;
        } catch (error) {
            console.error('Avatar upload error:', error);
            return false;
        }
    }

    /**
     * Helper: Update avatars.json
     */
    async updateAvatarConfig(filename) {
        try {
            const token = memorySync.getToken();
            if (!token) return;

            // Fetch current avatars.json
            const configPath = 'web/public/avatar/avatars.json';
            const getResponse = await fetch(
                `https://api.github.com/repos/sudhir-bahadure/phuntroo/contents/${configPath}`,
                {
                    headers: { 'Authorization': `token ${token}` }
                }
            );

            if (!getResponse.ok) return;

            const fileData = await getResponse.json();
            const currentConfig = JSON.parse(atob(fileData.content));

            // Add new avatar
            currentConfig.avatars.push({
                id: `avatar_${Date.now()}`,
                name: `New Avatar ${currentConfig.avatars.length + 1}`,
                path: `/avatar/avatars/${filename}`,
                type: 'vrm'
            });

            // Update file
            const updateResponse = await fetch(
                `https://api.github.com/repos/sudhir-bahadure/phuntroo/contents/${configPath}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Update avatars.json with ${filename}`,
                        content: btoa(JSON.stringify(currentConfig, null, 2)),
                        sha: fileData.sha
                    })
                }
            );

            return updateResponse.ok;
        } catch (error) {
            console.error('Config update error:', error);
            return false;
        }
    }

    /**
     * AUTONOMOUS ACTION: Learn new skill
     */
    async learnNewSkill(topic = null) {
        console.log(`📚 Autonomously learning: ${topic || 'new AI capabilities'}...`);

        const searchQuery = topic
            ? `beginner guide to ${topic} tutorial`
            : 'new AI chatbot capabilities 2024';

        // Search for information
        const results = await webSearchSkill.search(searchQuery, 3);

        if (results.length > 0) {
            const summary = results.map(r => r.snippet).join(' ');

            await memoryService.storeMemory('learned_skills', {
                timestamp: new Date().toISOString(),
                source: topic ? 'user_instruction' : 'autonomous_research',
                topic: topic || 'AI Trends',
                content: summary
            });

            return `Learned about ${topic || 'AI trends'}: ${summary.substring(0, 100)}...`;
        }

        return `Could not find information on ${topic || 'new skills'}`;
    }

    /**
     * Helper: Detect if user asked to learn something
     */
    detectUserLearningRequest(messages) {
        if (!messages || messages.length === 0) return null;

        // Look at last 3 user messages
        const lastUserMsgs = messages
            .filter(m => m.role === 'user')
            .slice(-3);

        for (const msg of lastUserMsgs) {
            const content = msg.content.toLowerCase();
            if (content.includes('learn') || content.includes('study') || content.includes('research')) {
                // Extract topic (simple heuristic)
                // e.g. "learn marathi" -> "marathi"
                const match = content.match(/(?:learn|study|research)\s+(?:about\s+)?(.+)/);
                if (match && match[1]) {
                    // Clean up punctuation
                    return match[1].replace(/[?!.]/g, '').trim();
                }
            }
        }
        return null;
    }

    /**
     * AUTONOMOUS ACTION: Optimize system
     */
    async optimizeSystem() {
        console.log('⚡ Autonomously optimizing system...');

        // Analyze performance metrics
        const metrics = {
            memoryUsage: performance.memory?.usedJSHeapSize || 0,
            decisionLogSize: this.decisionLog.length,
            completedTasks: this.completedTasks.length
        };

        // Clean up if needed
        if (this.decisionLog.length > 50) {
            this.decisionLog = this.decisionLog.slice(-50);
        }

        return `Optimized: ${JSON.stringify(metrics)}`;
    }

    /**
     * AUTONOMOUS ACTION: Enhance personality
     */
    async enhancePersonality() {
        console.log('💭 Autonomously enhancing personality...');

        const recentMessages = await this.getRecentMessages();

        if (recentMessages.length > 0) {
            // Analyze conversation patterns
            const personality = await memoryService.getPersonality();

            // Update based on conversations
            await memoryService.updatePersonality({
                ...personality,
                lastUpdate: new Date().toISOString(),
                interactionCount: (personality.interactionCount || 0) + 1
            });

            return 'Personality adjusted based on recent interactions';
        }

        return 'No personality changes needed';
    }

    /**
     * AUTONOMOUS ACTION: Self-upgrade
     */
    async selfUpgrade() {
        console.log('🚀 Autonomously self-upgrading...');

        // Check for improvements
        const improvements = [
            'Enhanced decision-making',
            'Improved goal prioritization',
            'Better resource management'
        ];

        const selectedImprovement = improvements[Math.floor(Math.random() * improvements.length)];

        await memoryService.storeMemory('upgrades', {
            timestamp: new Date().toISOString(),
            upgrade: selectedImprovement,
            autonomous: true
        });

        return `Self-upgrade applied: ${selectedImprovement}`;
    }

    /**
     * Helper: Should improve avatars?
     */
    shouldImproveAvatars(state) {
        // Improve avatars during non-peak hours or randomly
        const isNightTime = state.hour >= 22 || state.hour < 6;
        const randomChance = Math.random() < 0.2; // 20% chance

        return isNightTime || randomChance;
    }

    /**
     * Helper: Is user currently active?
     */
    isUserActive() {
        // Check if there was recent activity (would need to be tracked elsewhere)
        return false; // Placeholder
    }

    /**
     * Helper: Get recent messages
     */
    async getRecentMessages() {
        try {
            const personality = await memoryService.getPersonality();
            return personality.recentChats || [];
        } catch {
            return [];
        }
    }

    /**
     * Helper: List current capabilities
     */
    listCapabilities() {
        return [
            'chat',
            'voice_recognition',
            'text_to_speech',
            'web_search',
            'avatar_display',
            'autonomous_thinking'
        ];
    }

    /**
     * Helper: Find improvement opportunities
     */
    async findOpportunities(state) {
        const opportunities = [];

        // Always opportunity to learn
        opportunities.push('learn_skill');

        // Optimize if many tasks completed
        if (this.completedTasks.length > 10) {
            opportunities.push('optimize');
        }

        return opportunities;
    }

    /**
     * Get current status for UI display
     */
    getStatus() {
        return {
            active: this.isActive,
            goalsCompleted: this.completedTasks.length,
            recentDecisions: this.decisionLog.slice(-5),
            currentGoals: this.currentGoals
        };
    }
}

export const autonomousBrain = new AutonomousBrain();
