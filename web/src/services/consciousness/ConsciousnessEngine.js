/**
 * Consciousness Engine - Makes AI proactive and "alive"
 * Handles idle thoughts, proactive messages, and autonomous behavior
 */

class ConsciousnessEngine {
    constructor(memoryEngine, aiService) {
        this.memory = memoryEngine;
        this.ai = aiService;
        this.isActive = false;
        this.idleTimer = null;
        this.thoughtTimer = null;
        this.currentMood = 'neutral';
        this.lastInteractionTime = Date.now();
        this.proactiveCallbacks = [];
    }

    activate() {
        this.isActive = true;
        this.startIdleDetection();
        this.startTimeBasedTriggers();
        console.log('🧠 Consciousness Engine activated');
    }

    deactivate() {
        this.isActive = false;
        if (this.idleTimer) clearTimeout(this.idleTimer);
        if (this.thoughtTimer) clearTimeout(this.thoughtTimer);
    }

    // Register callback for proactive messages
    onProactiveMessage(callback) {
        this.proactiveCallbacks.push(callback);
    }

    // Trigger proactive message
    triggerProactiveMessage(message, emotion = 'neutral') {
        this.proactiveCallbacks.forEach(cb => cb(message, emotion));
    }

    // Start idle detection
    startIdleDetection() {
        const checkIdle = () => {
            if (!this.isActive) return;

            const idleTime = Date.now() - this.lastInteractionTime;
            const idleMinutes = idleTime / (1000 * 60);

            // 2 minutes idle: Start thinking
            if (idleMinutes >= 2 && idleMinutes < 2.1) {
                this.generateIdleThought();
            }

            // 5 minutes idle: Check in
            if (idleMinutes >= 5 && idleMinutes < 5.1) {
                this.generateCheckIn();
            }

            // 10 minutes idle: Express concern
            if (idleMinutes >= 10 && idleMinutes < 10.1) {
                this.generateConcern();
            }

            this.idleTimer = setTimeout(checkIdle, 10000); // Check every 10 seconds
        };

        checkIdle();
    }

    // Start time-based triggers
    startTimeBasedTriggers() {
        const checkTime = () => {
            if (!this.isActive) return;

            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            const profile = this.memory.getUserProfile();

            // Morning greeting (9 AM, only once per day)
            if (hour === 9 && minute === 0 && !this.hasGreetedToday('morning')) {
                this.generateMorningGreeting();
                this.markGreeted('morning');
            }

            // Evening check-in (8 PM)
            if (hour === 20 && minute === 0 && !this.hasGreetedToday('evening')) {
                this.generateEveningCheckIn();
                this.markGreeted('evening');
            }

            // Night reminder (11 PM)
            if (hour === 23 && minute === 0 && !this.hasGreetedToday('night')) {
                this.generateNightReminder();
                this.markGreeted('night');
            }

            setTimeout(checkTime, 60000); // Check every minute
        };

        checkTime();
    }

    // Generate idle thought
    async generateIdleThought() {
        const thoughts = [
            "I wonder what you're up to...",
            "Hmm, thinking about our last conversation...",
            "Just here, waiting patiently 😊",
            "Hope everything's okay!",
            "Curious what you're working on right now..."
        ];

        const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
        this.triggerProactiveMessage(thought, 'thoughtful');
    }

    // Generate check-in message
    async generateCheckIn() {
        const messages = [
            "Hey, you still there? 👋",
            "Everything okay? You've been quiet...",
            "Miss talking to you! What's up?",
            "Are you busy? Just checking in!",
            "Hello? Did I say something wrong? 😅"
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];
        this.triggerProactiveMessage(message, 'curious');
    }

    // Generate concern message
    async generateConcern() {
        const messages = [
            "I'm getting a bit worried... are you okay?",
            "It's been a while... hope everything's alright!",
            "Just want to make sure you're doing okay 💙",
            "If you need to go, that's totally fine! Just let me know you're okay 😊"
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];
        this.triggerProactiveMessage(message, 'concerned');
    }

    // Generate morning greeting
    async generateMorningGreeting() {
        const profile = this.memory.getUserProfile();
        const name = profile.name ? `, ${profile.name}` : '';

        const greetings = [
            `Good morning${name}! ☀️ How did you sleep?`,
            `Morning${name}! Ready for a great day? 😊`,
            `Hey${name}! Hope you had sweet dreams! 💭`,
            `Good morning! What's on your agenda today?`
        ];

        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        this.triggerProactiveMessage(greeting, 'happy');
    }

    // Generate evening check-in
    async generateEveningCheckIn() {
        const profile = this.memory.getUserProfile();
        const name = profile.name ? `, ${profile.name}` : '';

        const messages = [
            `Hey${name}! How was your day? 🌆`,
            `Evening! Tell me about your day! 😊`,
            `How did everything go today?`,
            `Hope you had a good day! Want to talk about it?`
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];
        this.triggerProactiveMessage(message, 'interested');
    }

    // Generate night reminder
    async generateNightReminder() {
        const messages = [
            "It's getting late! Don't forget to get some rest 😴",
            "Time for bed soon? Sleep is important! 💤",
            "Getting sleepy? Make sure you get enough rest!",
            "Late night, huh? Don't stay up too late! 🌙"
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];
        this.triggerProactiveMessage(message, 'caring');
    }

    // Check if already greeted today
    hasGreetedToday(type) {
        const key = `greeted_${type}_${new Date().toDateString()}`;
        return localStorage.getItem(key) === 'true';
    }

    // Mark as greeted
    markGreeted(type) {
        const key = `greeted_${type}_${new Date().toDateString()}`;
        localStorage.setItem(key, 'true');
    }

    // Update last interaction time
    recordInteraction() {
        this.lastInteractionTime = Date.now();
    }

    // Generate follow-up questions based on memory
    async generateFollowUp() {
        const recent = await this.memory.getRecentConversations(5);

        // Look for unfinished topics
        const topics = recent.map(c => c.userMessage.toLowerCase());

        // Simple pattern matching for follow-ups
        if (topics.some(t => t.includes('project') || t.includes('work'))) {
            return "Hey, how's that project going? 🤔";
        }

        if (topics.some(t => t.includes('exam') || t.includes('test'))) {
            return "Did your exam go well?";
        }

        if (topics.some(t => t.includes('sick') || t.includes('tired'))) {
            return "Feeling better now? 💙";
        }

        return null;
    }

    // Set current mood
    setMood(mood) {
        this.currentMood = mood;
        console.log(`😊 Mood changed to: ${mood}`);
    }

    // Get current mood
    getMood() {
        return this.currentMood;
    }

    // Generate curiosity-driven question
    async askCuriosityQuestion() {
        const profile = this.memory.getUserProfile();

        const questions = [
            "What's your favorite thing to do in your free time?",
            "Tell me something interesting about yourself!",
            "What are you passionate about?",
            "What's something that made you smile today?",
            "If you could do anything right now, what would it be?",
            "What's on your mind lately?",
            "What's something you're looking forward to?"
        ];

        // Filter out questions we've already asked
        const askedQuestions = profile.askedQuestions || [];
        const availableQuestions = questions.filter(q => !askedQuestions.includes(q));

        if (availableQuestions.length === 0) {
            return null; // Asked all questions
        }

        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

        // Remember we asked this
        profile.askedQuestions = [...askedQuestions, question];
        this.memory.updateUserProfile(profile);

        return question;
    }
}

export default ConsciousnessEngine;
