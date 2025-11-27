/**
 * Web Search Skill using DuckDuckGo
 * Free, no API key required
 */

class WebSearchSkill {
    constructor() {
        this.name = 'WebSearch';
        this.description = 'Search the internet for information';
    }

    /**
     * Search DuckDuckGo and return results
     */
    async search(query, maxResults = 5) {
        try {
            console.log(`🔍 Searching: "${query}"`);

            // Use DuckDuckGo Instant Answer API (free, no key)
            // Routed through AllOrigins to bypass CORS
            const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(ddgUrl)}`;

            const response = await fetch(proxyUrl);
            const proxyData = await response.json();

            // Parse the actual contents from the proxy
            const data = JSON.parse(proxyData.contents);

            const results = [];

            // Extract instant answer
            if (data.Abstract) {
                results.push({
                    title: data.Heading || 'Instant Answer',
                    snippet: data.Abstract,
                    url: data.AbstractURL || '',
                    source: data.AbstractSource || 'DuckDuckGo'
                });
            }

            // Extract related topics
            if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                data.RelatedTopics.slice(0, maxResults - 1).forEach(topic => {
                    if (topic.Text && topic.FirstURL) {
                        results.push({
                            title: topic.Text.split(' - ')[0] || 'Related',
                            snippet: topic.Text,
                            url: topic.FirstURL,
                            source: 'DuckDuckGo'
                        });
                    }
                });
            }

            console.log(`✅ Found ${results.length} results`);
            return results;
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    /**
     * Search and summarize results
     */
    async searchAndSummarize(query) {
        const results = await this.search(query);

        if (results.length === 0) {
            return `I couldn't find information about "${query}". Let me try a different approach.`;
        }

        // Create a summary from results
        let summary = `Here's what I found about "${query}":\n\n`;

        results.forEach((result, index) => {
            summary += `${index + 1}. **${result.title}**\n`;
            summary += `   ${result.snippet}\n`;
            if (result.url) {
                summary += `   Source: ${result.url}\n`;
            }
            summary += '\n';
        });

        return summary;
    }

    /**
     * Quick fact lookup
     */
    async getQuickFact(topic) {
        const results = await this.search(topic, 1);

        if (results.length > 0 && results[0].snippet) {
            return results[0].snippet;
        }

        return null;
    }

    /**
     * Check if query needs web search
     */
    shouldSearch(userMessage) {
        const searchIndicators = [
            'what is', 'who is', 'when did', 'where is',
            'how to', 'why does', 'search for', 'find',
            'look up', 'tell me about', 'explain',
            'latest', 'news', 'current', 'recent'
        ];

        const msg = userMessage.toLowerCase();
        return searchIndicators.some(indicator => msg.includes(indicator));
    }
}

export const webSearchSkill = new WebSearchSkill();
