import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { payrollPolicies, payrollPoliciesDocument } from '../../payroll-configuration/models/payrollPolicies.schema';
import { EmbeddingService } from './embedding.service';

export interface PolicySearchResult {
    policyName: string;
    policyType: string;
    description: string;
    status: string;
    score: number;
}

/**
 * RAG Service - Semantic search using MongoDB Atlas Vector Search
 * 
 * Auto-indexes policies on startup.
 * Uses Atlas $vectorSearch for native vector similarity.
 */
@Injectable()
export class RagService implements OnModuleInit {
    constructor(
        @InjectModel(payrollPolicies.name)
        private policyModel: Model<payrollPoliciesDocument>,
        private embeddingService: EmbeddingService,
    ) { }

    /**
     * Auto-index policies when the app starts
     */
    async onModuleInit() {
        // Wait a bit for embedding model to initialize
        setTimeout(() => this.autoIndexPolicies(), 5000);
    }

    private async autoIndexPolicies() {
        console.log('[RAG] Checking for policies without embeddings...');

        // Only index policies that don't have embeddings yet
        const policiesWithoutEmbeddings = await this.policyModel.countDocuments({
            $or: [
                { embedding: { $exists: false } },
                { embedding: { $size: 0 } },
            ]
        });

        if (policiesWithoutEmbeddings > 0) {
            console.log(`[RAG] Found ${policiesWithoutEmbeddings} policies without embeddings. Indexing...`);
            await this.indexAllPolicies();
        } else {
            console.log('[RAG] ✅ All policies already have embeddings');
        }
    }


    /**
     * Search policies using Atlas Vector Search
     */
    async searchPolicies(query: string, limit = 5): Promise<PolicySearchResult[]> {
        console.log(`[RAG] Atlas Vector Search for: "${query}"`);

        if (!query || query.trim().length < 2) {
            return [];
        }

        try {
            // Generate embedding for the query
            const queryEmbedding = await this.embeddingService.generateEmbedding(query);

            if (queryEmbedding.length === 0) {
                console.log('[RAG] No embedding available, falling back to text search');
                return this.fallbackSearch(query, limit);
            }

            // Use Atlas $vectorSearch aggregation
            const results = await this.policyModel.aggregate([
                {
                    $vectorSearch: {
                        index: 'policy_vector_index',    // Index name in Atlas
                        path: 'embedding',               // Field containing embeddings
                        queryVector: queryEmbedding,     // Query embedding
                        numCandidates: limit * 10,       // Broader search pool
                        limit: limit,                    // Return top K
                    }
                },
                {
                    $project: {
                        policyName: 1,
                        policyType: 1,
                        description: 1,
                        status: 1,
                        score: { $meta: 'vectorSearchScore' }
                    }
                }
            ]);

            if (results.length === 0) {
                console.log('[RAG] No vector search results, falling back to text search');
                return this.fallbackSearch(query, limit);
            }

            console.log(`[RAG] Found ${results.length} matches (top score: ${results[0]?.score?.toFixed(3)})`);

            return results.map((doc: any) => ({
                policyName: doc.policyName,
                policyType: doc.policyType,
                description: doc.description,
                status: doc.status,
                score: Math.round((doc.score || 0) * 100) / 100,
            }));
        } catch (error: any) {
            // If vector search fails (index not created), fall back
            if (error.message?.includes('vectorSearch') || error.codeName === 'InvalidPipelineOperator') {
                console.warn('[RAG] Atlas Vector Search not available, using fallback');
                console.warn('[RAG] Create index in Atlas: See instructions in console');
            } else {
                console.error('[RAG] Search error:', error.message);
            }
            return this.fallbackSearch(query, limit);
        }
    }

    /**
     * Generate embeddings for all policies (indexing)
     */
    async indexAllPolicies(): Promise<{ indexed: number; failed: number }> {
        console.log('[RAG] Starting policy indexing...');

        const policies = await this.policyModel.find().lean();
        let indexed = 0;
        let failed = 0;

        for (const policy of policies) {
            try {
                const text = `${policy.policyName}. ${policy.description}`;
                const embedding = await this.embeddingService.generateEmbedding(text);

                if (embedding.length > 0) {
                    await this.policyModel.updateOne(
                        { _id: policy._id },
                        { $set: { embedding } }
                    );
                    indexed++;
                    console.log(`[RAG] Indexed: ${policy.policyName}`);
                } else {
                    failed++;
                }
            } catch {
                failed++;
            }
        }

        console.log(`[RAG] ✅ Indexing complete: ${indexed} indexed, ${failed} failed`);
        return { indexed, failed };
    }

    /**
     * Index a single policy
     */
    async indexPolicy(policyId: string): Promise<boolean> {
        try {
            const policy = await this.policyModel.findById(policyId).lean();
            if (!policy) return false;

            const text = `${policy.policyName}. ${policy.description}`;
            const embedding = await this.embeddingService.generateEmbedding(text);

            if (embedding.length > 0) {
                await this.policyModel.updateOne(
                    { _id: policyId },
                    { $set: { embedding } }
                );
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    /**
     * Fallback keyword search
     */
    private async fallbackSearch(query: string, limit = 5): Promise<PolicySearchResult[]> {
        console.log('[RAG] Using fallback keyword search');

        const regex = new RegExp(query.split(' ').join('|'), 'i');

        const results = await this.policyModel
            .find({
                $or: [
                    { policyName: regex },
                    { description: regex },
                    { policyType: regex },
                ],
            })
            .limit(limit)
            .lean();

        return results.map((doc: any) => ({
            policyName: doc.policyName,
            policyType: doc.policyType,
            description: doc.description,
            status: doc.status,
            score: 0.5,
        }));
    }
}
