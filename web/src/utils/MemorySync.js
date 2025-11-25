/**
 * Memory Sync Utility
 * Syncs browser localStorage to GitHub repository via GitHub API
 * Enables cloud-based memory persistence without local disk usage
 */

const REPO_OWNER = 'sudhir-bahadure';
const REPO_NAME = 'phuntroo';
const MEMORY_PATH = 'web/public/memory.json';

class MemorySync {
    constructor() {
        this.token = null;
        this.isOnline = navigator.onLine;

        // Listen for online/offline events
        window.addEventListener('online', () => this.isOnline = true);
        window.addEventListener('offline', () => this.isOnline = false);
    }

    /**
     * Initialize with GitHub Personal Access Token
     * Generate at: https://github.com/settings/tokens (scope: repo)
     */
    setToken(token) {
        this.token = token;
        // Store in sessionStorage (not localStorage to avoid persistence)
        sessionStorage.setItem('gh_token', token);
    }

    getToken() {
        if (!this.token) {
            this.token = sessionStorage.getItem('gh_token');
        }
        return this.token;
    }

    /**
     * Load memory from localStorage (fast, offline-capable)
     */
    loadLocal() {
        const stored = localStorage.getItem('phuntroo_memory');
        if (stored) {
            return JSON.parse(stored);
        }

        // Default memory structure
        return {
            userPrefs: {
                name: 'Sudhir',
                mood: 'curious',
                likes: [],
                conversationStyle: 'friendly'
            },
            chatHistory: [],
            evolutionLog: 'Started as your friend on ' + new Date().toISOString().split('T')[0]
        };
    }

    /**
     * Save memory to localStorage (instant, always works)
     */
    saveLocal(memory) {
        localStorage.setItem('phuntroo_memory', JSON.stringify(memory));
        localStorage.setItem('phuntroo_last_save', new Date().toISOString());
    }

    /**
     * Sync memory to GitHub repository
     * Only works when online and token is available
     */
    async syncToGitHub(memory) {
        if (!this.isOnline) {
            console.log('💾 Offline - saved to localStorage only');
            return false;
        }

        const token = this.getToken();
        if (!token) {
            console.warn('⚠️ No GitHub token - skipping cloud sync');
            return false;
        }

        try {
            // 1. Get current file SHA (required for update)
            const getResponse = await fetch(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${MEMORY_PATH}`,
                {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            let sha = null;
            if (getResponse.ok) {
                const data = await getResponse.json();
                sha = data.sha;
            }

            // 2. Update the file
            const content = btoa(JSON.stringify(memory, null, 2));
            const updateResponse = await fetch(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${MEMORY_PATH}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Update friend memory (${new Date().toLocaleString()})`,
                        content: content,
                        sha: sha
                    })
                }
            );

            if (updateResponse.ok) {
                console.log('☁️ Memory synced to GitHub successfully');
                return true;
            } else {
                console.error('Failed to sync:', await updateResponse.text());
                return false;
            }
        } catch (error) {
            console.error('❌ GitHub sync error:', error);
            return false;
        }
    }

    /**
     * Load memory from GitHub (fallback/initial load)
     */
    async loadFromGitHub() {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${MEMORY_PATH}`);
            if (response.ok) {
                const memory = await response.json();
                this.saveLocal(memory); // Cache locally
                return memory;
            }
        } catch (error) {
            console.warn('Could not load from GitHub, using local:', error);
        }

        return this.loadLocal();
    }

    /**
     * Smart save: localStorage immediately + GitHub debounced
     */
    async save(memory) {
        // Save locally first (instant)
        this.saveLocal(memory);

        // Sync to GitHub (debounced)
        if (!this._syncTimeout) {
            this._syncTimeout = setTimeout(async () => {
                await this.syncToGitHub(memory);
                this._syncTimeout = null;
            }, 5000); // Wait 5 seconds to batch updates
        }
    }
}

export const memorySync = new MemorySync();
