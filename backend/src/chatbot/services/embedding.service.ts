import { Injectable, OnModuleInit } from '@nestjs/common';

// @xenova/transformers for local embeddings
let pipeline: any;
let embeddingPipeline: any;

/**
 * Embedding Service - Generates vector embeddings locally
 * 
 * Uses all-MiniLM-L6-v2 model (384 dimensions)
 * Runs entirely locally - no API calls needed!
 */
@Injectable()
export class EmbeddingService implements OnModuleInit {
    private isReady = false;
    private initPromise: Promise<void> | null = null;

    async onModuleInit() {
        console.log('[EmbeddingService] Initializing local embedding model...');
        this.initPromise = this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            // Dynamic import for ESM module
            const { pipeline: transformerPipeline } = await import('@xenova/transformers');
            pipeline = transformerPipeline;

            // Load the embedding model (downloads on first run ~25MB)
            embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

            this.isReady = true;
            console.log('[EmbeddingService] ✅ Embedding model ready (all-MiniLM-L6-v2, 384 dims)');
        } catch (error) {
            console.error('[EmbeddingService] ❌ Failed to load embedding model:', error);
        }
    }

    /**
     * Wait for model to be ready
     */
    async waitForReady(): Promise<boolean> {
        if (this.isReady) return true;
        if (this.initPromise) await this.initPromise;
        return this.isReady;
    }

    /**
     * Generate embedding for text
     * Returns 384-dimensional vector
     */
    async generateEmbedding(text: string): Promise<number[]> {
        await this.waitForReady();

        if (!embeddingPipeline) {
            console.warn('[EmbeddingService] Pipeline not ready, returning empty');
            return [];
        }

        try {
            // Truncate very long text (model has 256 token limit)
            const truncated = text.slice(0, 1000);

            // Generate embedding
            const output = await embeddingPipeline(truncated, {
                pooling: 'mean',
                normalize: true,
            });

            // Convert to regular array
            return Array.from(output.data);
        } catch (error) {
            console.error('[EmbeddingService] Error generating embedding:', error);
            return [];
        }
    }
}
