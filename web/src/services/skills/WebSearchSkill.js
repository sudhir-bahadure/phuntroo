/**
 * Web Search Skill using DuckDuckGo HTML Scraping
 * Free, no API key required, robust results
 */

class WebSearchSkill {
    constructor() {
        this.name = 'WebSearch';
        this.description = 'Search the internet for information';
    }

    /**
     * Search DuckDuckGo HTML and parse results (more reliable than API)
     */
    async search(query, maxResults = 5) {
        try {
            console.log(`🔍 Searching: "${query}"`);

            // Use DuckDuckGo HTML version via corsproxy.io (more reliable)
            const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(ddgUrl)}`;

            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html'
                }
            });

            if (!response.ok) {
                console.warn(`Search failed: ${response.status}`);
                return [];
            }

            const html = await response.text();
            const results = [];
            let count = 0;

            // Split by result body to keep title and snippet together
            const resultBlocks = html.split('class="result__body"');

            // Skip the first block (it's before the first result)
            for (let i = 1; i < resultBlocks.length && count < maxResults; i++) {
                const block = resultBlocks[i];

                // Extract Title
                const titleMatch = block.match(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/);
                if (!titleMatch) continue;

                let url = titleMatch[1];
                let title = titleMatch[2].replace(/<[^>]+>/g, '');

                // Decode URL
                if (url.startsWith('/l/?kh=-1&uddg=')) {
                    try {
                        url = decodeURIComponent(url.split('uddg=')[1].split('&')[0]);
                    } catch (e) {
                        // Keep original if decode fails
                    }
                }

                // Extract Snippet
                const snippetMatch = block.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>(.*?)<\/a>/);
                let snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '') : "No description available";

                results.push({
                    title: title,
                    snippet: snippet,
                    url: url,
                    source: 'DuckDuckGo'
                });
                count++;
            }

            console.log(`✅ Found ${results.length} results`);
            return results;

        } catch (error) {
            // Silent error handling - don't spam console
            console.warn('Search unavailable:', error.message);
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

        if (results.length > 0) {
            return `${results[0].title}: ${results[0].snippet}`;
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
