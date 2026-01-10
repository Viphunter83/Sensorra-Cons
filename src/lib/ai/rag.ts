import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';

const openai = new OpenAI({
    baseURL: process.env.PROXY_BASE_URL || "https://api.proxyapi.ru/openai/v1",
    apiKey: process.env.PROXY_API_KEY,
});

// Helper to generate embedding
async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
    });
    return response.data[0].embedding;
}

export async function storeProjectContext(projectId: string, content: string) {
    const supabase = await createClient();
    const embedding = await generateEmbedding(content);

    const { error } = await supabase.from('project_embeddings').insert([{
        project_id: projectId,
        content,
        embedding: embedding as any // Supabase client handles number[] -> vector string conversion
    }]);

    if (error) console.error('Error storing project context:', error);
}

export async function retrieveContext(query: string, projectId?: string) {
    const supabase = await createClient();
    const embedding = await generateEmbedding(query);

    // 1. Search Global Knowledge Base
    const { data: globalContext } = await supabase.rpc('match_knowledge_base', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 2
    });

    // 2. Search Project Context (if applicable)
    let projectContext: { content: string }[] = [];

    if (projectId) {
        const { data: pContext } = await supabase.rpc('match_project_context', {
            query_embedding: embedding,
            target_project_id: projectId,
            match_threshold: 0.5,
            match_count: 3
        });
        projectContext = pContext || [];
    }

    return {
        global: globalContext?.map(c => c.content).join('\n') || '',
        project: projectContext?.map(c => c.content).join('\n') || ''
    };
}
