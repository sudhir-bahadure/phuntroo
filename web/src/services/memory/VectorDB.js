import { pipeline } from '@xenova/transformers';
import { memoryService } from './MemoryService';

class VectorDB {
    constructor() {
        this.embedder = null;
        this.isReady = false;
    }

    async initialize() {
        if (this.isReady) return;

        try {
            console.log('Loading embedding model...');
            this.embedder = await pipeline(
                'feature-extraction',
                'Xenova/all-MiniLM-L6-v2'
            );
            this.isReady = true;
            console.log('Embedding model ready!');
        } catch (error) {
            console.error('Failed to load embedder:', error);
            throw error;
        }
    }

    /**
     * Generate embedding for text
     */
    async embed(text) {
        if (!this.isReady) {
            await this.initialize();
        }

        try {
            const output = await this.embedder(text, {
                pooling: 'mean',
                normalize: true
            });
            return Array.from(output.data);
        } catch (error) {
            console.error('Embedding error:', error);
            return null;
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Search for similar conversations
     */
    async searchSimilar(query, limit = 5) {
        try {
            // Get query embedding
            const queryEmbedding = await this.embed(query);
            if (!queryEmbedding) return [];

            // Get all conversations with embeddings
            const conversations = await memoryService.getAllConversations();
            const withEmbeddings = conversations.filter(c => c.embedding);

            // Calculate similarities
            const results = withEmbeddings.map(conv => ({
                ...conv,
                similarity: this.cosineSimilarity(queryEmbedding, conv.embedding)
            }));

            // Sort by similarity and return top results
            return results
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    /**
     * Add embedding to stored conversation
     */
    async addEmbeddingToConversation(id, text) {
        try {
            const embedding = await this.embed(text);
            if (embedding) {
                await memoryService.updateEmbedding(id, embedding);
            }
        } catch (error) {
            console.error('Failed to add embedding:', error);
        }
    }

    /**
     * Process all conversations without embeddings
     */
    async processUnembeddedConversations() {
        try {
            const conversations = await memoryService.getAllConversations();
            const unembedded = conversations.filter(c => !c.embedding);

            console.log(`Processing ${unembedded.length} conversations...`);

            for (const conv of unembedded) {
                const text = `${conv.userMessage} ${conv.aiResponse}`;
                await this.addEmbeddingToConversation(conv.id, text);
            }

            console.log('All conversations embedded!');
        } catch (error) {
            console.error('Failed to process conversations:', error);
        }
    }
}

export const vectorDB = new VectorDB();
